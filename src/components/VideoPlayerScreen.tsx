import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import RecommendedSidebar from './RecommendedSidebar';
import SearchBar from './SearchBar';
import SceneMetadata from './SceneMetadata';
import VideoPlayer from './VideoPlayer';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { List } from 'lucide-react';
import { createAuthenticatedImageUrl, createAuthenticatedVideoUrl } from '../lib/apolloClient';
import GetSceneForPlayer from '../graphql/queries/GetSceneForPlayer.gql';
import FindRecommendedScenes from '../graphql/queries/FindRecommendedScenes.gql';

interface VideoPlayerScreenProps {
  video: any;
  onBack: () => void;
  onVideoSelect?: (video: any) => void;
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  // Round to whole seconds and ensure it's a number
  const totalSeconds = Math.round(Number(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function VideoPlayerScreen({ video, onBack, onVideoSelect }: VideoPlayerScreenProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recommendedOpen, setRecommendedOpen] = useState(false);

  // Normalize video data - handle both direct video objects and recommendation objects
  const normalizedVideo = useMemo(() => {
    if (!video) return null;

    // If video has sceneData, it came from recommendations - use the sceneData
    // Otherwise, use the video directly
    const videoSource = video.sceneData || video;

    console.log('VideoPlayerScreen normalized video:', {
      originalHasSceneData: !!video.sceneData,
      usingSource: video.sceneData ? 'sceneData' : 'direct',
      videoId: videoSource.id,
      videoTitle: videoSource.title
    });

    return videoSource;
  }, [video]);

  // Fetch single scene data for player
  const { data: sceneData, loading: sceneLoading, error: sceneError } = useQuery(GetSceneForPlayer, {
    variables: { id: normalizedVideo?.id },
    skip: !normalizedVideo?.id
  });

  // Fetch recommended scenes based on matching tags
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = useQuery(FindRecommendedScenes, {
    variables: useMemo(() => {
      const currentVideoTags = normalizedVideo?.tags?.map((tag: any) => tag.id) || [];
      console.log('VideoPlayerScreen Debug:', {
        videoId: normalizedVideo?.id,
        videoTitle: normalizedVideo?.title,
        currentVideoTags,
        hasTags: currentVideoTags.length > 0
      });

      return {
        filter: {
          per_page: 20, // Get more to allow for filtering
          sort: 'date',
          direction: 'DESC'
        },
        scene_filter: currentVideoTags.length > 0 ? {
          tags: {
            value: currentVideoTags.slice(0, 3), // Limit to first 3 tags to avoid too restrictive filtering
            modifier: 'INCLUDES_ANY' // Find scenes that have ANY of the current video's tags
          }
        } : undefined
      };
    }, [normalizedVideo?.tags, normalizedVideo?.id, normalizedVideo?.title])
  });

  const handleTagAdd = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagId));
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  // Transform scene data to match expected format
  const videoData = useMemo(() => {
    const currentScene = sceneData?.findScene;
    if (!currentScene) return normalizedVideo ? {
      id: normalizedVideo.id,
      title: normalizedVideo.title || 'Loading...',
      studio: normalizedVideo.studio?.name || '',
      performers: normalizedVideo.performers?.map((p: any) => p.name) || [],
      tags: normalizedVideo.tags?.map((t: any) => t.name) || [],
      duration: normalizedVideo.duration || '0:00',
      thumbnail: normalizedVideo.thumbnail || '',
      videoUrl: normalizedVideo.videoUrl || '',
      views: '0',
      rating: normalizedVideo.rating || 0,
      description: normalizedVideo.details || normalizedVideo.title || '',
      scenes: []
    } : null;

    return {
      id: currentScene.id,
      title: currentScene.title,
      studio: currentScene.studio?.name || '',
      performers: currentScene.performers?.map((p: any) => p.name) || [],
      tags: currentScene.tags?.map((t: any) => t.name) || [],
      duration: formatDuration(currentScene.files?.[0]?.duration || 0),
      views: currentScene.play_count?.toString() || '0',
      rating: currentScene.rating100 ? currentScene.rating100 / 10 : 0,
      description: currentScene.details || currentScene.title,
      thumbnail: createAuthenticatedImageUrl(currentScene.paths?.screenshot, currentScene.id, 'scene') || '',
      videoUrl: createAuthenticatedVideoUrl(currentScene.paths?.stream) || '',
      scenes: currentScene.scene_markers?.map(marker => ({
        time: formatDuration(marker.seconds),
        description: marker.title || marker.primary_tag?.name || 'Scene Marker',
        thumbnail: createAuthenticatedImageUrl(currentScene.paths?.screenshot, currentScene.id, 'scene') || '',
        seconds: marker.seconds
      })) || []
    };
  }, [sceneData, normalizedVideo]);

  // Transform recommended scenes
  const recommendedVideos = useMemo(() => {
    console.log('Recommended Videos Debug:', {
      hasRecommendedData: !!recommendedData,
      hasScenes: !!recommendedData?.findScenes?.scenes,
      scenesCount: recommendedData?.findScenes?.scenes?.length || 0,
      currentVideoId: normalizedVideo?.id,
      loading: recommendedLoading,
      error: recommendedError?.message
    });

    if (!recommendedData?.findScenes?.scenes || recommendedData.findScenes.scenes.length === 0) {
      console.log('No recommended data available');
      return [];
    }

    let selectedScenes = [];

    // Try tag-based recommendations first
    if (normalizedVideo?.tags && Array.isArray(normalizedVideo.tags) && normalizedVideo.tags.length > 0) {
      console.log('Attempting tag-based recommendations with tags:', normalizedVideo.tags.map((t: any) => t.name));

      const currentVideoTagIds = new Set(normalizedVideo.tags.map((tag: any) => tag.id));
      console.log('Current video tag IDs:', Array.from(currentVideoTagIds));

      // Find scenes with matching tags
      const taggedScenes = recommendedData.findScenes.scenes
        .filter((scene: any) => scene.id !== normalizedVideo.id && scene.tags && Array.isArray(scene.tags))
        .map((scene: any) => {
          const sceneTagIds = new Set(scene.tags.map((tag: any) => tag.id));
          const matchingTags = [...currentVideoTagIds].filter(tagId => sceneTagIds.has(tagId));
          return {
            ...scene,
            tagMatches: matchingTags.length,
            matchingTagNames: matchingTags.map(tagId => {
              const tag = scene.tags.find((t: any) => t.id === tagId);
              return tag ? tag.name : '';
            })
          };
        })
        .filter(scene => scene.tagMatches > 0)
        .sort((a, b) => b.tagMatches - a.tagMatches)
        .slice(0, 8);

      console.log(`Found ${taggedScenes.length} scenes with matching tags`);

      if (taggedScenes.length >= 4) {
        // Use tag-based recommendations if we have enough matches
        selectedScenes = taggedScenes;
        console.log('Using tag-based recommendations');
      } else {
        console.log('Not enough tag matches, falling back to random selection');
      }
    }

    // Fallback to random/high-rated scenes if tag-based doesn't work
    if (selectedScenes.length === 0) {
      console.log('Using random/high-rated fallback recommendations');
      selectedScenes = recommendedData.findScenes.scenes
        .filter((scene: any) => scene.id !== normalizedVideo?.id)
        .sort(() => Math.random() - 0.5) // Random shuffle
        .slice(0, 8);
    }

    console.log(`Final recommendations: ${selectedScenes.length} videos`);

    return selectedScenes.map((scene: any) => ({
      id: scene.id,
      title: scene.title,
      studio: scene.studio?.name || '',
      performers: scene.performers?.map((p: any) => p.name) || [],
      tags: scene.tags?.map((t: any) => t.name) || [],
      duration: formatDuration(scene.files?.duration || 0),
      thumbnail: createAuthenticatedImageUrl(scene.paths?.screenshot || scene.paths?.preview, scene.id, 'scene') || '',
      previewVideo: createAuthenticatedVideoUrl(scene.paths?.preview) || '',
      views: '0',
      rating: scene.rating100 ? scene.rating100 / 10 : 0,
      tagSimilarity: scene.tagMatches || 0,
      sceneData: scene
    }));
  }, [recommendedData, normalizedVideo, recommendedLoading, recommendedError]);

  const handleVideoSelect = (selectedVideo: any) => {
    if (onVideoSelect) {
      // Navigate to the selected video
      onVideoSelect(selectedVideo);
    } else {
      // Fallback to going back to browse
      onBack();
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Desktop Recommended Sidebar */}
      <div className="hidden lg:block" style={{ display: window.innerWidth >= 1024 ? 'block' : 'none' }}>
        <RecommendedSidebar videos={recommendedVideos} onVideoSelect={handleVideoSelect} onBack={onBack} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="flex-shrink-0 border-b border-white/10 bg-gradient-to-r from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" style={{ display: window.innerWidth < 1024 ? 'block' : 'none' }}>
          <div className="flex items-center gap-2 px-3 py-2">
            {/* Mobile Recommended Button */}
            <Sheet open={recommendedOpen} onOpenChange={setRecommendedOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300">
                  <List className="w-5 h-5 text-purple-300" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] border-white/10 p-0">
                <div className="h-full overflow-hidden">
                  <RecommendedSidebar
                    videos={recommendedVideos}
                    onVideoSelect={(selectedVideo) => {
                      handleVideoSelect(selectedVideo);
                      setRecommendedOpen(false);
                    }}
                    onBack={onBack}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Bar - Mobile */}
            <div className="flex-1">
              <SearchBar
                selectedTags={selectedTags}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                onClearAll={handleClearAllTags}
                availableTags={[]} // TODO: Pass real tags
                isPlayerMode={true}
              />
            </div>
          </div>
        </div>

        {/* Desktop Top Bar */}
        <div className="flex-shrink-0 border-b border-white/10 bg-gradient-to-r from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" style={{ display: window.innerWidth >= 1024 ? 'block' : 'none' }}>
          <SearchBar
            selectedTags={selectedTags}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            onClearAll={handleClearAllTags}
            availableTags={[]} // TODO: Pass real tags
            isPlayerMode={true}
          />
        </div>

        {/* Compact Scene Metadata - Much smaller */}
        <div className="flex-shrink-0 max-h-20 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-2">
            {sceneError ? (
              <div className="text-red-400 text-sm">
                Error loading scene: {sceneError.message}
              </div>
            ) : sceneLoading ? (
              <div className="text-gray-400 text-sm">Loading scene...</div>
            ) : videoData ? (
              <SceneMetadata video={videoData} compact={true} />
            ) : (
              <div className="text-gray-400 text-sm">No scene data available</div>
            )}
          </div>
        </div>

        {/* Larger Video Player - Takes up most of the space */}
        <div className="flex-1 overflow-hidden">
          {sceneError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-400">
                <div>Error loading video: {sceneError.message}</div>
                <div className="text-sm text-gray-400 mt-2">
                  Check browser console for details
                </div>
              </div>
            </div>
          ) : sceneLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading video...</div>
            </div>
          ) : videoData ? (
            <VideoPlayer video={videoData} onBack={onBack} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">No video available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
