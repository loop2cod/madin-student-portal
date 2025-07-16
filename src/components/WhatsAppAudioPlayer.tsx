"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface WhatsAppAudioPlayerProps {
  src: string;
  duration?: number;
  className?: string;
}

const WhatsAppAudioPlayer: React.FC<WhatsAppAudioPlayerProps> = ({ 
  src, 
  duration,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <button
        onClick={togglePlayPause}
        className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
        disabled={isLoading}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={audioDuration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1 h-1.5 appearance-none bg-gray-300 rounded-full accent-green-500"
            disabled={isLoading}
          />
          <span className="text-xs text-gray-500 min-w-[40px] text-right">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
        </div>
      </div>
      
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default WhatsAppAudioPlayer;
