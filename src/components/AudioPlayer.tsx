import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Song } from "@/types/song";

interface AudioPlayerProps {
  currentSong: Song | null;
  queue: Song[];
  onNext: () => void;
  onPrevious: () => void;
}

const AudioPlayer = ({ currentSong, queue, onNext, onPrevious }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="audio-player fixed bottom-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border/50 shadow-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3">
        {/* Progress bar */}
        <div className="mb-2 sm:mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 sm:mt-1.5">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Song info */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0 max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.songName}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-md object-cover shadow-lg flex-shrink-0"
            />
            <div className="min-w-0 flex-1 hidden sm:block">
              <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{currentSong.songName}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{currentSong.artistName}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrevious}
              disabled={queue.length === 0}
              className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="icon"
              variant="default"
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full hover-glow shadow-lg"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onNext}
              disabled={queue.length === 0}
              className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0 max-w-[140px] sm:max-w-[160px] md:max-w-[180px]">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
