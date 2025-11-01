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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="audio-player fixed bottom-0 md:bottom-0 left-0 right-0 z-50 bg-black/98 backdrop-blur-2xl border-t border-border/30 shadow-2xl pb-20 md:pb-0">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />
      
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
          {/* Song info - Left */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.songName}
              className="w-14 h-14 rounded object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1 hidden md:block">
              <h4 className="font-medium text-sm text-foreground truncate">{currentSong.songName}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artistName}</p>
            </div>
          </div>

          {/* Controls - Center */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={onPrevious}
                disabled={queue.length === 0}
                className="hover:bg-muted/50 h-8 w-8"
              >
                <SkipBack className="w-5 h-5" fill="currentColor" />
              </Button>
              <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-white hover:bg-white/90 text-black hover:scale-105 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onNext}
                disabled={queue.length === 0}
                className="hover:bg-muted/50 h-8 w-8"
              >
                <SkipForward className="w-5 h-5" fill="currentColor" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="hidden md:flex items-center gap-2 w-full">
              <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume - Right */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="hover:bg-muted/50"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24 cursor-pointer"
            />
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
