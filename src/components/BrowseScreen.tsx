import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useIntersectionObserver } from '../lib/useIntersectionObserver';
import StudioSidebar from './StudioSidebar';
import SearchBar from './SearchBar';
import PerformerScroller from './PerformerScroller';
import EpisodeGrid from './EpisodeGrid';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Filter, Grid3x3, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { createAuthenticatedImageUrl, createAuthenticatedVideoUrl } from '../lib/apolloClient';
import FindTagsForSearch from '../graphql/queries/FindTagsForSearch.gql';
import FindStudiosForSidebar from '../graphql/queries/FindStudiosForSidebar.gql';
import FindPerformersForScroller from '../graphql/queries/FindPerformersForScroller.gql';
import FindBrowseScenes from '../graphql/queries/FindBrowseScenes.gql';

interface BrowseScreenProps {
  onVideoSelect: (video: any) => void;
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


export default function BrowseScreen({ onVideoSelect }: BrowseScreenProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
	const [selectedPerformer, setSelectedPerformer] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [filterOpen, setFilterOpen] = useState(false);
	const PER_PAGE = 40;

	// GraphQL queries
	const { data: tagsData } = useQuery(FindTagsForSearch, {
		variables: { filter: { per_page: 200 } }
	});

	const { data: studiosData } = useQuery(FindStudiosForSidebar, {
		variables: { filter: { per_page: 100 } }
	});

	const { data: performersData } = useQuery(FindPerformersForScroller, {
		variables: { filter: { per_page: 100 } }
	});

	// Scenes query with infinite scroll
	const { data: scenesData, loading: scenesLoading, error: scenesError, fetchMore } = useQuery(FindBrowseScenes, {
		variables: useMemo(() => {
			const filter: any = {
				page: 1,
				per_page: PER_PAGE,
				sort: 'date',
				direction: 'DESC'
			};

			const scene_filter: any = {};

			if (searchQuery) {
				filter.q = searchQuery;
			}

			if (selectedTags.length > 0) {
				scene_filter.tags = {
					value: selectedTags,
					modifier: 'INCLUDES_ALL'
				};
			}

			if (selectedStudio) {
				scene_filter.studios = {
					value: [selectedStudio],
					modifier: 'INCLUDES_ALL'
				};
			}

			if (selectedPerformer) {
				scene_filter.performers = {
					value: [selectedPerformer],
					modifier: 'INCLUDES_ALL'
				};
			}

			return {
				filter,
				scene_filter: Object.keys(scene_filter).length > 0 ? scene_filter : undefined
			};
		}, [searchQuery, selectedTags, selectedStudio, selectedPerformer])
	});

	// Infinite scroll logic
	const scenes = scenesData?.findScenes?.scenes ?? [];
	const totalCount = scenesData?.findScenes?.count ?? 0;
	const hasMore = scenes.length < totalCount;

	const { ref: loadMoreRef, hasTriggered: shouldLoadMore, resetTrigger } = useIntersectionObserver({
		threshold: 0.1,
		rootMargin: '100px'
	});

	const loadMore = () => {
		if (scenesLoading || !hasMore) return;

		const currentPage = Math.ceil(scenes.length / PER_PAGE) + 1;

		fetchMore({
			variables: {
				filter: {
					page: currentPage,
					per_page: PER_PAGE,
					sort: 'date',
					direction: 'DESC',
					q: searchQuery || undefined
				},
				scene_filter: (() => {
					const scene_filter: any = {};
					if (selectedTags.length > 0) {
						scene_filter.tags = {
							value: selectedTags,
							modifier: 'INCLUDES_ALL'
						};
					}
					if (selectedStudio) {
						scene_filter.studios = {
							value: [selectedStudio],
							modifier: 'INCLUDES_ALL'
						};
					}
					if (selectedPerformer) {
						scene_filter.performers = {
							value: [selectedPerformer],
							modifier: 'INCLUDES_ALL'
						};
					}
					return Object.keys(scene_filter).length > 0 ? scene_filter : undefined;
				})()
			}
		}).then(() => {
			resetTrigger(); // Reset the trigger for next load
		}).catch((err) => {
			console.error('Error loading more scenes:', err);
			resetTrigger(); // Reset even on error so user can retry
		});
	};

	// Trigger load more when intersection observer detects visibility
	if (shouldLoadMore && hasMore && !scenesLoading) {
		loadMore();
	}

	// Transform data to match component interfaces
	const availableTags = tagsData?.findTags?.tags?.map((tag: any) => ({
		id: tag.id,
		name: tag.name
	})) || [];

	const studios = studiosData?.findStudios?.studios?.map((studio: any) => ({
		id: studio.id,
		name: studio.name,
		logo: '🎬', // Default logo, could be customized based on studio name
		image: createAuthenticatedImageUrl(studio.image_path, studio.id, 'studio') || ''
	})) || [];

	const rawPerformers = performersData?.findPerformers?.performers ?? []
	const uniquePerformers = rawPerformers.filter((p, i, a) => a.findIndex(x => x.id === p.id) === i)
	const performers = uniquePerformers.map(performer => ({
		id: performer.id,
		name: performer.name,
		image: createAuthenticatedImageUrl(performer.image_path, performer.id, 'performer') || ''
	}))

	// Transform scenes data to match EpisodeGrid interface
	const episodes = useMemo(() => {
		if (!scenesData?.findScenes?.scenes) return [];

		return scenesData.findScenes.scenes.map((scene: any) => {
			// Find the studio image from the studios array
			const studioData = studios.find(s => s.id === scene.studio?.id);

			return {
				id: scene.id,
				title: scene.title,
				studio: scene.studio?.name || '',
				studioImage: studioData?.image || '',
				performers: scene.performers?.map((p: any) => p.name) || [],
				tags: scene.tags?.map((t: any) => t.name) || [],
				duration: formatDuration(scene.files?.[0]?.duration || 0),
				thumbnail: createAuthenticatedImageUrl(scene.paths?.screenshot, scene.id, 'scene') || '',
				previewVideo: createAuthenticatedVideoUrl(scene.paths?.preview) || '',
				views: '0', // Stash doesn't track views
				rating: scene.rating100 ? scene.rating100 / 10 : 0,
				// Keep original scene data for video player
				sceneData: scene
			};
		});
	}, [scenesData, studios]);

	const handleHomeClick = () => {
		setSelectedTags([]);
		setSelectedStudio(null);
		setSelectedPerformer(null);
		setSearchQuery('');
	};

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

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

  return (
    <div className="flex h-full w-full">
      {/* Desktop Studio Sidebar */}
      <div className="hidden lg:block">
        <StudioSidebar
          studios={studios}
          selectedStudio={selectedStudio}
          onStudioSelect={(studioId) => {
            setSelectedStudio(studioId);
          }}
          onBackClick={handleHomeClick}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex-shrink-0 border-b border-white/10 bg-gradient-to-r from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]">
          <div className="flex items-center gap-2 lg:hidden px-4 py-3">
            {/* Mobile Filter Button */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300">
                  <Filter className="w-5 h-5 text-purple-300" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] border-white/10 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-amber-400 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Filter videos by studio and performer
                  </SheetDescription>
                </SheetHeader>
                
                {/* Studios Section */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Grid3x3 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">Studios</span>
                  </div>
                  <Select
                    value={selectedStudio || 'all'}
                    onValueChange={(value) => {
                      setSelectedStudio(value === 'all' ? null : value);
                    }}
                  >
                    <SelectTrigger className="w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 text-gray-300 hover:border-purple-500/50 focus:ring-purple-500/50">
                      <SelectValue placeholder="All Studios" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-purple-500/30 text-gray-300">
                      <SelectItem value="all" className="focus:bg-purple-500/20 focus:text-white">
                        All Studios
                      </SelectItem>
                      {studios.map((studio) => (
                      <SelectItem
                        key={studio.id}
                        value={studio.id}
                        className="focus:bg-purple-500/20 focus:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <span>{studio.logo}</span>
                          <span>{studio.name}</span>
                        </div>
                      </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStudio && (
                    <button
                      onClick={() => {
                        setSelectedStudio(null);
                      }}
                      className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                {/* Performers Section */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">Performers</span>
                  </div>
                  <Select
                    value={selectedPerformer || 'all'}
                    onValueChange={(value) => {
                      setSelectedPerformer(value === 'all' ? null : value);
                    }}
                  >
                    <SelectTrigger className="w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 text-gray-300 hover:border-purple-500/50 focus:ring-purple-500/50">
                      <SelectValue placeholder="All Performers" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-purple-500/30 text-gray-300 max-h-[300px]">
                      <SelectItem value="all" className="focus:bg-purple-500/20 focus:text-white">
                        All Performers
                      </SelectItem>
                      {performers.map((performer) => (
                        <SelectItem
                          key={performer.id}
                          value={performer.id}
                          className="focus:bg-purple-500/20 focus:text-white"
                        >
                          {performer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPerformer && (
                    <button
                      onClick={() => {
                        setSelectedPerformer(null);
                      }}
                      className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Bar - Mobile */}
            <div className="flex-1">
              <SearchBar
                selectedTags={selectedTags.map(tagId => availableTags.find(tag => tag.id === tagId)?.name || tagId)}
                onTagAdd={(tagName) => {
                  const tag = availableTags.find(t => t.name === tagName);
                  if (tag) handleTagAdd(tag.id);
                }}
                onTagRemove={(tagName) => {
                  const tag = availableTags.find(t => t.name === tagName);
                  if (tag) handleTagRemove(tag.id);
                }}
                onClearAll={handleClearAllTags}
                availableTags={availableTags.map(tag => tag.name)}
                onHomeClick={handleHomeClick}
                onPerformerSelect={(performerId) => {
                  setSelectedPerformer(performerId);
                }}
                onStudioSelect={(studioId) => {
                  setSelectedStudio(studioId);
                }}
              />
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block">
            <SearchBar
              selectedTags={selectedTags.map(tagId => availableTags.find(tag => tag.id === tagId)?.name || tagId)}
              onTagAdd={(tagName) => {
                const tag = availableTags.find(t => t.name === tagName);
                if (tag) handleTagAdd(tag.id);
              }}
              onTagRemove={(tagName) => {
                const tag = availableTags.find(t => t.name === tagName);
                if (tag) handleTagRemove(tag.id);
              }}
              onClearAll={handleClearAllTags}
              availableTags={availableTags.map(tag => tag.name)}
              onHomeClick={handleHomeClick}
              onPerformerSelect={(performerId) => {
                setSelectedPerformer(performerId);
              }}
              onStudioSelect={(studioId) => {
                setSelectedStudio(studioId);
              }}
            />
          </div>
        </div>

        {/* Performer Scroller - Desktop Only */}
        <div className="hidden lg:block flex-shrink-0 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm">
          <PerformerScroller
            performers={performers}
            selectedPerformer={selectedPerformer}
            onPerformerSelect={(performerId) => {
              setSelectedPerformer(performerId);
            }}
          />
        </div>

        {/* Episode Grid */}
        <div className="flex-1 overflow-hidden pb-0 lg:pb-0">
          {scenesError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-400">
                <div>Error loading scenes: {scenesError.message}</div>
                <div className="text-sm text-gray-400 mt-2">
                  Check browser console for details
                </div>
              </div>
            </div>
          ) : scenesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading scenes...</div>
            </div>
          ) : (
            <EpisodeGrid
              episodes={episodes}
              onEpisodeSelect={(episode) => onVideoSelect(episode.sceneData || episode)}
              onTagClick={(tagName) => {
                const tag = availableTags.find(t => t.name === tagName);
                if (tag) handleTagAdd(tag.id);
              }}
              loadMoreRef={loadMoreRef}
              hasMore={hasMore}
              isLoading={scenesLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
