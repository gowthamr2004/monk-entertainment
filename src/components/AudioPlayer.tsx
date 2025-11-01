import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Plus, ListMusic, Mic2, MoreHorizontal, Maximize2 } from "lucide-react";
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
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
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

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="audio-player fixed bottom-16 left-0 right-0 z-50 bg-black border-t border-border/50 shadow-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />
      
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Song Info */}
          <div className="flex items-center gap-3 min-w-[200px] flex-1">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.songName}
              className="w-14 h-14 rounded object-cover shadow-lg flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-foreground truncate">{currentSong.songName}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artistName}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-muted h-8 w-8 flex-shrink-0"
              title="Add to playlist"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[700px]">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleShuffle}
                className={`hover:bg-muted h-8 w-8 ${isShuffled ? 'text-primary' : ''}`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onPrevious}
                disabled={queue.length === 0}
                className="hover:bg-muted h-8 w-8"
                title="Previous"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="default"
                className="w-10 h-10 rounded-full hover-glow shadow-lg"
                onClick={togglePlay}
                title={isPlaying ? "Pause" : "Play"}
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
                className="hover:bg-muted h-8 w-8"
                title="Next"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleRepeat}
                className={`hover:bg-muted h-8 w-8 ${repeatMode !== 'off' ? 'text-primary' : ''}`}
                title={repeatMode === 'off' ? 'Repeat' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 'one' && (
                  <span className="absolute text-[10px] font-bold">1</span>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-muted-foreground font-medium min-w-[40px] text-right">
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

          {/* Right: Additional Controls */}
          <div className="flex items-center gap-2 min-w-[200px] flex-1 justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-muted h-8 w-8"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-muted h-8 w-8 hidden md:flex"
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-muted h-8 w-8 hidden lg:flex"
              title="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="hover:bg-muted h-8 w-8"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24 cursor-pointer hidden sm:block"
            />
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-muted h-8 w-8 hidden xl:flex"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
