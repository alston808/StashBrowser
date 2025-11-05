import { useState, memo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Video {
  id: string;
  title: string;
  studio: string;
  performers: string[];
  tags: string[];
  duration: string;
  thumbnail: string;
  videoUrl: string;
  views: string;
  rating: number;
  description: string;
  scenes?: Array<{
    time: string;
    description: string;
    thumbnail: string;
    seconds: number;
  }>;
}

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
}

const VideoPlayer = memo(function VideoPlayer({ video, onBack }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  if (!video) return null;

  const handleTimeUpdate = () => {
    if (videoRef) {
      const progressPercent = (videoRef.currentTime / videoRef.duration) * 100;
      setProgress(progressPercent);
      setCurrentTime(videoRef.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef) {
      setDuration(videoRef.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    if (videoRef) {
      const newTime = (newProgress / 100) * videoRef.duration;
      videoRef.currentTime = newTime;
    }
  };

  const handlePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef) {
      videoRef.currentTime = Math.max(0, Math.min(videoRef.duration, videoRef.currentTime + seconds));
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Video Player Container */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {/* Video Element */}
        {video.videoUrl ? (
          <video
            ref={setVideoRef}
            src={video.videoUrl}
            poster={video.thumbnail}
            className="max-w-full max-h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
        ) : (
          <ImageWithFallback
            src={video.thumbnail}
            alt={video.title}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-3 left-3 md:top-6 md:left-6 p-2 md:p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 group z-10"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-amber-400 transition-colors duration-300" />
        </button>

        {/* Play/Pause Overlay (only show when video is available but not playing) */}
        {video.videoUrl && !isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl shadow-amber-500/50">
              <Play className="w-8 h-8 md:w-12 md:h-12 text-white fill-white ml-1 md:ml-2" />
            </div>
          </button>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-3 md:p-6">
          {/* Progress Bar */}
          <div className="mb-2 md:mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                md:[&::-webkit-slider-thumb]:w-4
                md:[&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gradient-to-r
                [&::-webkit-slider-thumb]:from-amber-500
                [&::-webkit-slider-thumb]:to-yellow-600
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-amber-500/50
                hover:[&::-webkit-slider-thumb]:scale-125
                [&::-webkit-slider-thumb]:transition-transform"
              style={{
                background: `linear-gradient(to right, rgb(245, 158, 11) ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`
              }}
            />
          </div>

          {/* Control Buttons */}
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handlePlayPause}
                disabled={!video.videoUrl}
                className="p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                disabled={!video.videoUrl}
                className="p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                disabled={!video.videoUrl}
                className="p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>

              <button
                onClick={handleMuteToggle}
                disabled={!video.videoUrl}
                className="p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </button>

              {/* Time Display */}
              <div className="text-white text-sm font-mono ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <button className="p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110">
              <Maximize className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Scene Timeline */}
      {video.scenes && video.scenes.length > 0 && (
        <div className="flex-shrink-0 border-t border-white/10 bg-[#0a0a0f]">
          <ScrollArea className="w-full">
            <div className="flex gap-2 md:gap-4 p-2 md:p-4">
              {video.scenes.map((scene, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (videoRef && scene.seconds !== undefined) {
                      videoRef.currentTime = scene.seconds;
                    }
                  }}
                  disabled={!video.videoUrl}
                  className="flex-shrink-0 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-28 md:w-40 rounded-lg overflow-hidden ring-2 ring-purple-500/30 hover:ring-amber-500/50 transition-all duration-300 hover:scale-105">
                    <div className="relative aspect-video">
                      <ImageWithFallback
                        src={scene.thumbnail}
                        alt={scene.description}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 md:px-2 py-0.5 rounded bg-black/70 text-xs text-white">
                        {scene.time}
                      </div>
                    </div>
                    <div className="p-1.5 md:p-2 bg-[#12121a]">
                      <p className="text-xs text-gray-300 line-clamp-2 group-hover:text-amber-400 transition-colors duration-300">
                        {scene.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;
