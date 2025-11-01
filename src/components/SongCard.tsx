import { Download, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Song } from "@/types/song";
import { Badge } from "@/components/ui/badge";
import { AddToPlaylistDialog } from "./AddToPlaylistDialog";

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onDownload: (song: Song) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const SongCard = ({ song, onPlay, onDownload, onDelete, isAdmin }: SongCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-card border-border/50 hover:bg-card transition-all duration-300 hover-scale shadow-md hover:shadow-xl">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.imageUrl}
          alt={song.songName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="icon"
            variant="default"
            className="w-14 h-14 rounded-full hover-glow shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform"
            onClick={() => onPlay(song)}
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div className="min-h-[60px]">
          <h3 className="font-bold text-base text-foreground truncate mb-1">{song.songName}</h3>
          <p className="text-sm text-muted-foreground truncate">{song.artistName}</p>
          {song.movieName && (
            <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{song.movieName}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {song.type}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {song.language}
          </Badge>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8"
              onClick={() => onDownload(song)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            {isAdmin && onDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-3"
                onClick={() => onDelete(song.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <AddToPlaylistDialog songId={song.id} songName={song.songName} />
        </div>
      </div>
    </Card>
  );
};

export default SongCard;
