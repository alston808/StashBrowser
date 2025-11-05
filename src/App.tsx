import { useState } from 'react';
import BrowseScreen from './components/BrowseScreen';
import VideoPlayerScreen from './components/VideoPlayerScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'browse' | 'player'>('browse');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    setCurrentScreen('player');
  };

  const handleBackToBrowse = () => {
    setCurrentScreen('browse');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0f] touch-manipulation">
      {currentScreen === 'browse' ? (
        <BrowseScreen onVideoSelect={handleVideoSelect} />
      ) : (
        <VideoPlayerScreen
          video={selectedVideo}
          onBack={handleBackToBrowse}
          onVideoSelect={handleVideoSelect}
        />
      )}
    </div>
  );
}
