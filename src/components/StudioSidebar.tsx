import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Studio {
  id: string;
  name: string;
  logo: string;
  image?: string;
}

interface StudioSidebarProps {
  studios: Studio[];
  selectedStudio: string | null;
  onStudioSelect: (studio: string | null) => void;
  onBackClick?: () => void;
}

export default function StudioSidebar({ studios, selectedStudio, onStudioSelect, onBackClick }: StudioSidebarProps) {
  return (
    <div className="w-32 flex-shrink-0 border-r border-white/10 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]">
      <div className="h-20 flex items-center justify-center border-b border-white/10">
        <button 
          onClick={onBackClick}
          className="text-2xl hover:scale-110 transition-transform duration-300 cursor-pointer"
          title="Back to Home"
        >
          🤙🏾
        </button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-3 space-y-3">
          {studios.map((studio) => (
            <button
              key={studio.id}
              onClick={() => onStudioSelect(selectedStudio === studio.id ? null : studio.id)}
              className={`w-full aspect-[3/2] rounded-xl overflow-hidden flex items-center justify-center text-3xl transition-all duration-300 hover:scale-105 ${
                selectedStudio === studio.id
                  ? 'bg-gradient-to-br from-amber-500/30 to-yellow-600/30 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/50'
                  : 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 hover:from-purple-800/30 hover:to-blue-800/30'
              }`}
              title={studio.name}
            >
              {studio.image ? (
                <ImageWithFallback
                  src={studio.image}
                  alt={studio.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="drop-shadow-lg">{studio.logo}</span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
