import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import SongCard from "@/components/SongCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/song";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlay = (song: Song) => {
    // Play functionality
  };

  const handleDownload = (song: Song) => {
    // Download functionality
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Search</h1>
        
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSongs.map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song}
                  onPlay={handlePlay}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center text-muted-foreground mt-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Search for songs, artists, or albums</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
