import { useState, useEffect } from "react";
import { Play, User, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Song, Playlist } from "@/types/song";
import { toast } from "sonner";
import SongCard from "@/components/SongCard";
import AudioPlayer from "@/components/AudioPlayer";
import ParticleBackground from "@/components/ParticleBackground";
import RecentlyPlayed from "@/components/RecentlyPlayed";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSongs();
    loadHistory();
    if (user) {
      fetchUserAvatar();
    }
  }, [user]);

  const fetchUserAvatar = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

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

  const saveToHistory = async (song: Song) => {
    // Save to local state
    const updatedHistory = [song, ...history.filter((s) => s.id !== song.id)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("playHistory", JSON.stringify(updatedHistory));

    // Save to database if user is logged in
    if (user) {
      try {
        // @ts-ignore - play_history table exists but types may not be synced
        const response: any = await supabase.from("play_history").insert({
          user_id: user.id,
          song_id: song.id,
        });
        
        if (response.error) {
          console.error("Error saving to play history:", response.error);
        }
      } catch (error) {
        console.error("Error saving to play history:", error);
      }
    }
  };

  const filteredSongs = songs;

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setQueue(filteredSongs);
    saveToHistory(song);
    toast.success(`Now playing: ${song.songName}`);
  };

  const handleDownload = async (song: Song) => {
    try {
      toast.info("Starting download...");
      
      // Fetch the audio file as a blob
      const response = await fetch(song.audioUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${song.songName} - ${song.artistName}.mp3`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("Download completed!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download. Please try again.");
    }
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
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Avatar - triggers sidebar on all devices */}
            <button
              className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all hover:ring-2 hover:ring-primary/50"
              onClick={onMenuClick}
            >
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
                <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-green-400">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </AvatarFallback>
              </Avatar>
            </button>

            {/* Channel Name */}
            <div className="flex flex-col leading-none">
              <span className="font-bebas text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-wider">
                MONK
              </span>
              <span className="font-bebas text-sm sm:text-base md:text-lg bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-widest -mt-1">
                ENTERTAINMENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Recently Played Section */}
        <RecentlyPlayed onPlay={handlePlay} />

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
