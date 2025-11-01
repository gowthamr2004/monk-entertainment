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
    <div className="fixed bottom-0 left-[260px] right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border/50 shadow-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />
      
      <div className="container mx-auto px-6 py-3">
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          {/* Song info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.songName}
              className="w-16 h-16 rounded-md object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-base text-foreground truncate">{currentSong.songName}</h4>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artistName}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrevious}
              disabled={queue.length === 0}
              className="hover:bg-muted"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="default"
              className="w-11 h-11 rounded-full hover-glow shadow-lg"
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
              className="hover:bg-muted"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="hover:bg-muted"
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
              className="w-28 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
