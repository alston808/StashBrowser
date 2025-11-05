import { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  studio: string;
  studioImage?: string;
  tags: string[];
  duration: string;
  thumbnail: string;
  hoverVideo?: string;
  views: string;
}

interface RecommendedSidebarProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  onTagClick?: (tag: string) => void;
}

export default function RecommendedSidebar({ videos, onVideoSelect, onTagClick }: RecommendedSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full lg:w-80 flex-shrink-0 lg:border-r border-white/10 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]">
      <div className="h-16 lg:h-20 flex items-center justify-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="text-lg lg:text-xl">💎</div>
          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent text-xs lg:text-sm tracking-wider">
            RECOMMENDED
          </span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
        <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
          {videos.map((video) => {
            return (
              <div
                key={video.id}
                className="group w-full rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail / Video Preview */}
                <button
                  onClick={() => onVideoSelect(video)}
                  className="w-full relative aspect-[4/3] overflow-hidden"
                >
                  <ImageWithFallback
                    src={hoveredId === video.id && video.previewVideo ? video.previewVideo : video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{
                      width: 'var(--scene-thumbnail-width)',
                      height: 'var(--scene-thumbnail-height)'
                    }}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Studio Logo */}
                  <div className={`absolute bottom-2 left-2 transition-all duration-300 ${
                    hoveredId === video.id ? 'opacity-100 scale-110' : 'opacity-60'
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-black/70 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                      {video.studioImage ? (
                        <ImageWithFallback
                          src={video.studioImage}
                          alt={video.studio}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="text-xs text-white">🎬</span>
                      )}
                    </div>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl shadow-amber-500/50">
                        <Play className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-xs text-white">
                    {video.duration}
                  </div>
                </button>

                {/* Info */}
                <div className="p-2 lg:p-3 space-y-1">
                  <h4 
                    onClick={() => onVideoSelect(video)}
                    className="text-sm text-white line-clamp-2 text-left group-hover:text-amber-400 transition-colors duration-300 cursor-pointer"
                  >
                    {video.title}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {video.tags?.slice(0, 2).map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick?.(tag);
                        }}
                        className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-xs text-purple-300 hover:border-purple-400/60 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 hover:scale-105"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-xl ring-1 ring-purple-500/50" />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
