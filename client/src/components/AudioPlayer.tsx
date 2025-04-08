import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Download, AlertTriangle } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Reset error state when audio url changes
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (progressRef.current) {
      progressRef.current.value = "0";
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (progressRef.current && !isNaN(audio.duration)) {
        progressRef.current.value = (audio.currentTime / audio.duration * 100).toString();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressRef.current) {
        progressRef.current.value = "0";
      }
    };
    
    const handleError = () => {
      console.error("Audio error:", audio.error);
      setError("Failed to load audio. Please try again.");
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    if (progressRef.current) {
      progressRef.current.value = "0";
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const value = Number(e.target.value);
    const seekTime = (value / 100) * audio.duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'indonesian-speech.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border border-gray-200 p-5 bg-gray-50">
      <h3 className="font-nunito font-semibold text-lg mb-4">Generated Audio</h3>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <audio ref={audioRef} src={audioUrl} className="hidden" preload="auto" />
          
          <div className="flex items-center gap-3">
            {isPlaying ? (
              <Button 
                onClick={handlePlayPause}
                size="icon"
                className="accent-btn w-12 h-12"
                disabled={!!error}
              >
                <Pause className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={handlePlayPause}
                size="icon"
                className="accent-btn w-12 h-12"
                disabled={!!error}
              >
                <Play className="h-5 w-5" />
              </Button>
            )}
            
            <Button 
              onClick={handleStop}
              size="icon"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition ml-1"
              disabled={!!error}
            >
              <Square className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 ml-2">
              <div className="relative pt-1">
                <input 
                  ref={progressRef}
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="0" 
                  onChange={handleSeek}
                  className="w-full appearance-none bg-gray-300 h-2 rounded-full focus:outline-none cursor-pointer"
                  disabled={!!error}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleDownload}
          className="secondary-btn min-w-[140px] text-center"
          disabled={!!error}
        >
          <Download className="mr-2 h-4 w-4" />
          Download MP3
        </Button>
      </div>
    </div>
  );
}
