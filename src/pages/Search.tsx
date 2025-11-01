import { useState } from "react";
import { Search as SearchIcon, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SongCard from "@/components/SongCard";
import AudioPlayer from "@/components/AudioPlayer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/song";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SearchProps {
  onMenuClick?: () => void;
}

const Search = ({ onMenuClick }: SearchProps = {}) => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);

  const { data: songs = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map((song) => ({
        id: song.id,
        songName: song.song_name,
        artistName: song.artist_name,
        movieName: song.movie_name,
        type: song.type as 'Song' | 'BGM',
        language: song.language,
        imageUrl: song.image_url,
        audioUrl: song.audio_url,
        uploadedAt: new Date(song.created_at),
      })) as Song[];
    },
  });

  const filteredSongs = songs.filter(
    (song) =>
      song.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.movieName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setQueue(filteredSongs);
    toast.success(`Now playing: ${song.songName}`);
  };

  const handleDownload = (song: Song) => {
    const link = document.createElement("a");
    link.href = song.audioUrl;
    link.download = `${song.songName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("songs").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete song");
      return;
    }

    toast.success("Song deleted successfully");
    // The query will automatically refetch
  };

  const handleNext = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      setCurrentSong(nextSong);
    }
  };

  const handlePrevious = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      setCurrentSong(prevSong);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={onMenuClick}
          >
            <User className="w-6 h-6" />
          </Button>
          <h1 className="text-4xl font-bold">Search</h1>
        </div>
        
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card/50 border-border/50"
          />
        </div>

        {searchQuery && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {filteredSongs.length} results for "{searchQuery}"
            </h2>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No songs found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredSongs.map((song) => (
                  <SongCard 
                    key={song.id} 
                    song={song}
                    onPlay={handlePlay}
                    onDownload={handleDownload}
                    onDelete={isAdmin ? handleDelete : undefined}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <div className="text-center text-muted-foreground mt-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Search for songs, artists, or albums</p>
          </div>
        )}
      </div>

      {currentSong && (
        <AudioPlayer
          currentSong={currentSong}
          queue={queue}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default Search;
