import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/song";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface RecentlyPlayedProps {
  onPlay: (song: Song) => void;
}

interface PlayHistoryRecord {
  song_id: string;
}

const RecentlyPlayed = ({ onPlay }: RecentlyPlayedProps) => {
  const { user } = useAuth();
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentlyPlayed();
    }
  }, [user]);

  const fetchRecentlyPlayed = async () => {
    if (!user) return;

    try {
      // Get recently played song IDs from play_history
      // @ts-ignore - play_history table exists but types may not be synced
      const response: any = await supabase
        // @ts-ignore
        .from("play_history")
        .select("song_id")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(6);

      const historyData: PlayHistoryRecord[] | null = response.data;
      const historyError = response.error;

      if (historyError) throw historyError;

      if (!historyData || historyData.length === 0) {
        setRecentSongs([]);
        setLoading(false);
        return;
      }

      // Get unique song IDs (in case a song was played multiple times)
      const uniqueSongIds = [...new Set(historyData.map((h) => h.song_id))];
      const limitedIds = uniqueSongIds.slice(0, 6);

      // Fetch the actual song data
      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select("*")
        .in("id", limitedIds);

      if (songsError) throw songsError;

      // Map to Song type and preserve order from play_history
      const orderedSongs: Song[] = limitedIds
        .map((songId) => {
          const song = songsData?.find((s: any) => s.id === songId);
          if (!song) return null;
          return {
            id: song.id,
            songName: song.song_name,
            artistName: song.artist_name,
            movieName: song.movie_name,
            type: song.type as "Song" | "BGM",
            language: song.language,
            imageUrl: song.image_url,
            audioUrl: song.audio_url,
            uploadedAt: new Date(song.created_at),
          };
        })
        .filter((song): song is Song => song !== null);

      setRecentSongs(orderedSongs);
    } catch (error) {
      console.error("Error fetching recently played:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;
  if (recentSongs.length === 0) return null;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          Recently Played
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {recentSongs.map((song, index) => (
          <div
            key={song.id}
            className="group relative bg-card rounded-lg p-2 sm:p-3 md:p-4 hover:bg-card/80 transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => onPlay(song)}
          >
            <div className="relative aspect-square mb-2 sm:mb-3 rounded overflow-hidden">
              <img
                src={song.imageUrl}
                alt={song.songName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-xs sm:text-sm truncate mb-0.5 sm:mb-1">
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
