import { useRef, memo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Performer {
  id: string;
  name: string;
  image?: string;
}

interface PerformerScrollerProps {
  performers: Performer[];
  selectedPerformer: string | null;
  onPerformerSelect: (performer: string | null) => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

const PerformerScroller = memo(function PerformerScroller({
  performers,
  selectedPerformer,
  onPerformerSelect,
  hasMore = false,
  isLoading = false,
  onLoadMore
}: PerformerScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle horizontal scroll to load more
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !onLoadMore) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

      // Load more when scrolled 80% to the right
      if (scrollPercentage > 0.8 && hasMore && !isLoading && !loadingRef.current) {
        loadingRef.current = true;
        onLoadMore();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore]);

  // Reset loading ref when loading completes
  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  return (
    <div className="py-3 px-3 md:py-4 md:px-6 relative group/scroller">
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <div className="text-xs md:text-sm uppercase tracking-wider text-gray-400">Performers</div>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 via-transparent to-transparent" />
      </div>
      
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-[#0a0a0f] to-transparent opacity-0 group-hover/scroller:opacity-100 transition-opacity duration-300 hover:scale-110"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-purple-400" />
      </button>
      
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-l from-[#0a0a0f] to-transparent opacity-0 group-hover/scroller:opacity-100 transition-opacity duration-300 hover:scale-110"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-purple-400" />
      </button>

      <div 
        ref={scrollRef}
        className="flex gap-3 md:gap-4 pb-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {performers.map((performer) => (
          <button
            key={performer.id}
            onClick={() => onPerformerSelect(selectedPerformer === performer.id ? null : performer.id)}
            className={`flex-shrink-0 group transition-all duration-300 ${
              selectedPerformer === performer.id ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <div className="relative">
              <div className={`w-20 h-28 md:w-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden ring-2 transition-all duration-300 ${
                selectedPerformer === performer.id
                  ? 'ring-amber-500 ring-offset-2 md:ring-offset-4 ring-offset-[#0a0a0f]'
                  : 'ring-purple-500/30 group-hover:ring-blue-500/50'
              }`}>
                <ImageWithFallback
                  src={performer.image}
                  alt={performer.name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {selectedPerformer === performer.id && (
                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 animate-pulse" />
              )}
            </div>
            <div className={`mt-1 md:mt-2 text-center text-xs md:text-sm transition-colors duration-300 ${
              selectedPerformer === performer.id
                ? 'text-amber-400'
                : 'text-gray-300 group-hover:text-white'
            }`}>
              {performer.name}
            </div>
          </button>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex-shrink-0 flex items-center justify-center w-20 md:w-28">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* End indicator */}
        {!hasMore && performers.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-center w-20 md:w-28 text-xs text-gray-500">
            •
          </div>
        )}
      </div>
    </div>
  );
});

export default PerformerScroller;
