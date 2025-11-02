import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Song, Playlist } from "@/types/song";
import { Play, Music } from "lucide-react";
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
  const navigate = useNavigate();
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistImages, setPlaylistImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentlyPlayed();
      fetchPlaylists();
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

  const fetchPlaylists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) return;

    const userPlaylists: Playlist[] = data.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      songs: playlist.song_ids,
      createdAt: new Date(playlist.created_at),
    }));

    setPlaylists(userPlaylists);
    fetchPlaylistImages(userPlaylists);
  };

  const fetchPlaylistImages = async (playlists: Playlist[]) => {
    const images: Record<string, string> = {};
    
    for (const playlist of playlists) {
      if (playlist.songs.length > 0) {
        const { data } = await supabase
          .from("songs")
          .select("image_url")
          .eq("id", playlist.songs[0])
          .single();
        
        if (data?.image_url) {
          images[playlist.id] = data.image_url;
        }
      }
    }
    
    setPlaylistImages(images);
  };

  if (!user || loading) return null;
  if (recentSongs.length === 0 && playlists.length === 0) return null;

  // Combine songs and playlists, limiting to 6 total items
  const combinedItems = [...recentSongs, ...playlists].slice(0, 6);

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          Recently Played
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {combinedItems.map((item, index) => {
          // Check if item is a Song or Playlist
          const isSong = 'songName' in item;
          
          if (isSong) {
            const song = item as Song;
            return (
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
            );
          } else {
            const playlist = item as Playlist;
            return (
              <div
                key={playlist.id}
                className="group relative bg-card rounded-lg p-2 sm:p-3 md:p-4 hover:bg-card/80 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate('/playlist')}
              >
                <div className="relative aspect-square mb-2 sm:mb-3 rounded overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {playlistImages[playlist.id] ? (
                    <img 
                      src={playlistImages[playlist.id]} 
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-primary" />
                  )}
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
                  {playlist.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                </p>
              </div>
            );
          }
        })}
      </div>
    </section>
  );
};

export default RecentlyPlayed;
