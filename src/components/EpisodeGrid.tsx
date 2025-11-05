import { useState, memo } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  studio: string;
  studioImage?: string;
  performers: string[];
  tags: string[];
  duration: string;
  thumbnail: string;
  hoverVideo?: string;
  views: string;
  rating: number;
}

interface EpisodeGridProps {
  episodes: Episode[];
  onEpisodeSelect: (episode: Episode) => void;
  onTagClick?: (tag: string) => void;
  loadMoreRef?: React.RefObject<Element>;
  hasMore?: boolean;
  isLoading?: boolean;
}

const EpisodeGrid = memo(function EpisodeGrid({ episodes, onEpisodeSelect, onTagClick, loadMoreRef, hasMore, isLoading }: EpisodeGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <ScrollArea className="h-full">
      <div className="p-3 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-6">
          {episodes.map((episode, index) => {
            return (
              <div
                key={episode.id || `episode-${index}`}
                className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
                onMouseEnter={() => setHoveredId(episode.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail / Video Preview */}
                <button
                  onClick={() => onEpisodeSelect(episode)}
                  className="w-full relative aspect-[4/3] overflow-hidden bg-gray-800"
                >
                  <ImageWithFallback
                    src={hoveredId === episode.id && episode.previewVideo ? episode.previewVideo : episode.thumbnail}
                    alt={episode.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{
                      width: 'var(--scene-thumbnail-width)',
                      height: 'var(--scene-thumbnail-height)'
                    }}
                    loading="lazy"
                    decoding="async"
                  />


                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl shadow-amber-500/50">
                        <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg bg-black/70 backdrop-blur-sm text-xs text-white">
                    {episode.duration}
                  </div>
                </button>

                {/* Info */}
                <div className="p-2 md:p-4 space-y-1 md:space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Studio Logo */}
                    <div className="flex-shrink-0 w-10 md:w-12 aspect-[3/2] rounded-lg bg-black/80 backdrop-blur-sm overflow-hidden flex items-center justify-center border border-white/20 shadow-lg">
                      {episode.studioImage ? (
                        <ImageWithFallback
                          src={episode.studioImage}
                          alt={episode.studio}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="text-sm text-white">🎬</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onEpisodeSelect(episode)}
                      className="text-sm md:text-base text-white line-clamp-1 group-hover:text-amber-400 transition-colors duration-300 cursor-pointer flex-1 min-w-0"
                    >
                      {episode.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(episode.tags)].slice(0, 3).map((tag) => (
                      <button
                        key={`${tag}-${episode.id || index}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick?.(tag);
                        }}
                        className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-xs text-purple-300 hover:border-purple-400/60 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 hover:scale-105"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-500/50" />
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 blur-xl" />
                </div>
              </div>
            );
          })}
        </div>

        {episodes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl">No episodes found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && episodes.length > 0 && (
          <div
            ref={loadMoreRef as React.RefObject<HTMLDivElement>}
            className="flex items-center justify-center py-8"
          >
            {isLoading ? (
              <div className="text-gray-400">Loading more scenes...</div>
            ) : (
              <div className="text-gray-500 text-sm">Scroll for more</div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
});

export default EpisodeGrid;
