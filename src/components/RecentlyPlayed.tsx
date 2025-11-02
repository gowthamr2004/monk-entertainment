import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/song";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface RecentlyPlayedProps {
  onPlay: (song: Song) => void;
  currentSongId?: string;
}

const RecentlyPlayed = ({ onPlay, currentSongId }: RecentlyPlayedProps) => {
  const { user } = useAuth();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentlyPlayed();
    }
  }, [user]);

  const fetchRecentlyPlayed = async () => {
    if (!user) return;

    setLoading(true);
    
    // Fetch recent play history with song details
    const { data, error } = await supabase
      .from("play_history")
      .select(`
        song_id,
        played_at,
        songs (
          id,
          song_name,
          artist_name,
          movie_name,
          type,
          language,
          image_url,
          audio_url,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching recently played:", error);
      setLoading(false);
      return;
    }

    // Remove duplicates and format songs
    const uniqueSongs = new Map<string, Song>();
    data?.forEach((item: any) => {
      if (item.songs && !uniqueSongs.has(item.songs.id)) {
        uniqueSongs.set(item.songs.id, {
          id: item.songs.id,
          songName: item.songs.song_name,
          artistName: item.songs.artist_name,
          movieName: item.songs.movie_name,
          type: item.songs.type as "Song" | "BGM",
          language: item.songs.language,
          imageUrl: item.songs.image_url,
          audioUrl: item.songs.audio_url,
          uploadedAt: new Date(item.songs.created_at),
        });
      }
    });

    setRecentlyPlayed(Array.from(uniqueSongs.values()).slice(0, 6));
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="animate-fade-in">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 md:mb-5">
          Recently Played
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg aspect-square mb-2"></div>
              <div className="bg-muted h-4 rounded mb-1"></div>
              <div className="bg-muted h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!user || recentlyPlayed.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          Recently Played
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {recentlyPlayed.map((song, index) => (
          <div
            key={song.id}
            className={`group relative bg-card rounded-lg p-2 sm:p-3 md:p-4 hover:bg-card/80 transition-all cursor-pointer animate-fade-in border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md ${
              index >= 4 ? "hidden sm:block" : ""
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => onPlay(song)}
          >
            <div className="relative aspect-square mb-2 sm:mb-3 rounded overflow-hidden">
              <img
                src={song.imageUrl}
                alt={song.songName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {currentSongId === song.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg"></div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg hover-glow"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-xs sm:text-sm truncate mb-0.5 sm:mb-1 text-foreground">
              {song.songName}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {song.artistName}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayed;
