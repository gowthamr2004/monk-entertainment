import { useState, useEffect } from "react";
import { Play, User, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Song, Playlist } from "@/types/song";
import { toast } from "sonner";
import SongCard from "@/components/SongCard";
import AudioPlayer from "@/components/AudioPlayer";
import ParticleBackground from "@/components/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  onMenuClick?: () => void;
}

const Home = ({ onMenuClick }: HomeProps = {}) => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistImages, setPlaylistImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
    loadHistory();
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch songs");
      setLoading(false);
      return;
    }

    const formattedSongs: Song[] = data.map((song) => ({
      id: song.id,
      songName: song.song_name,
      artistName: song.artist_name,
      movieName: song.movie_name,
      type: song.type as "Song" | "BGM",
      language: song.language,
      imageUrl: song.image_url,
      audioUrl: song.audio_url,
      uploadedAt: new Date(song.created_at),
    }));

    setSongs(formattedSongs);
    setLoading(false);
  };

  const loadHistory = () => {
    const savedHistory = localStorage.getItem("playHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  };

  const fetchPlaylists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
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

  const saveToHistory = (song: Song) => {
    const updatedHistory = [song, ...history.filter((s) => s.id !== song.id)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("playHistory", JSON.stringify(updatedHistory));
  };

  const filteredSongs = songs;

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setQueue(filteredSongs);
    saveToHistory(song);
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

    setSongs(songs.filter((song) => song.id !== id));
    toast.success("Song deleted successfully");
  };

  const handleNext = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      setCurrentSong(nextSong);
      saveToHistory(nextSong);
    }
  };

  const handlePrevious = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      setCurrentSong(prevSong);
      saveToHistory(prevSong);
    }
  };


  // Group songs for sections
  const recentSongs = filteredSongs.slice(0, 6);
  const recentHistory = history.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ParticleBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-b from-background via-background to-sidebar-background">
      <ParticleBackground />
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            {/* Menu Icon - triggers sidebar on all devices */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0"
              onClick={onMenuClick}
            >
              <User className="w-6 h-6" />
            </Button>

            {/* Channel Name */}
            <div className="flex flex-col leading-none">
              <span className="font-bebas text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-wider">
                MONK
              </span>
              <span className="font-bebas text-xs sm:text-sm md:text-base bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-widest -mt-1">
                ENTERTAINMENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Recent Songs Section */}
        {(recentHistory.length > 0 || playlists.length > 0) && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Recent songs</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {/* Recent Songs */}
              {recentHistory.map((song, index) => (
                <div
                  key={song.id}
                  className="group relative bg-card rounded-lg p-2 sm:p-3 md:p-4 hover:bg-card/80 transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handlePlay(song)}
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
                  <h3 className="font-semibold text-xs sm:text-sm truncate mb-0.5 sm:mb-1">{song.songName}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{song.artistName}</p>
                </div>
              ))}
              
              {/* Playlists */}
              {playlists.map((playlist, index) => (
                <div
                  key={playlist.id}
                  className="group relative bg-card rounded-lg p-2 sm:p-3 md:p-4 hover:bg-card/80 transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${(recentHistory.length + index) * 0.05}s` }}
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
                  <h3 className="font-semibold text-xs sm:text-sm truncate mb-0.5 sm:mb-1">{playlist.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Songs Section */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">Browse All</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filteredSongs.length} {filteredSongs.length === 1 ? "song" : "songs"} available
              </p>
            </div>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <p className="text-lg sm:text-xl text-muted-foreground">No songs found</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                >
                  <SongCard
                    song={song}
                    onPlay={handlePlay}
                    onDownload={handleDownload}
                    onDelete={isAdmin ? handleDelete : undefined}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
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

export default Home;
