import { ImageWithFallback } from './figma/ImageWithFallback';
import { Clock, Eye, Star, Users } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  studio: string;
  performers: string[];
  tags: string[];
  duration: string;
  views: string;
  rating: number;
  description: string;
}

interface SceneMetadataProps {
  video: Video;
  compact?: boolean;
  onPerformerClick?: (performer: string) => void;
  onTagClick?: (tag: string) => void;
}

export default function SceneMetadata({ video, compact = false, onPerformerClick, onTagClick }: SceneMetadataProps) {
  if (!video) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm text-white truncate">{video.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{video.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-amber-400">{video.rating}</span>
            </div>
            <span className="truncate">{video.studio}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {video.performers.slice(0, 2).map((performer) => (
            <span key={performer} className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded">
              {performer}
            </span>
          ))}
          {video.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4">
      {/* Title and Basic Info */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
        <div className="flex-1 space-y-1.5 md:space-y-2">
          <h1 className="text-lg md:text-2xl text-white">{video.title}</h1>
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>{video.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 md:w-4 md:h-4" />
              <span>{video.views} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-400">{video.rating}</span>
            </div>
          </div>
        </div>

        {/* Studio Badge */}
        <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Studio</div>
          <div className="text-xs md:text-sm text-white">{video.studio}</div>
        </div>
      </div>

      {/* Description - Desktop Only */}
      <p className="hidden md:block text-gray-300 text-sm leading-relaxed">
        {video.description}
      </p>

      {/* Performers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
          <span className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Performers</span>
        </div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {video.performers.map((performer) => (
            <button
              key={performer}
              onClick={() => onPerformerClick?.(performer)}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-xs md:text-sm text-amber-300 hover:border-amber-400/50 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all duration-300 hover:scale-105"
            >
              {performer}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Tags</div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {video.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-xs md:text-sm text-purple-300 hover:border-purple-400/50 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 hover:scale-105"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
