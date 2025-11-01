import { useState, useEffect } from "react";
import { Search, Play, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/song";
import { toast } from "sonner";
import SongCard from "@/components/SongCard";
import AudioPlayer from "@/components/AudioPlayer";
import ParticleBackground from "@/components/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface HomeProps {
  onMenuClick?: () => void;
}

const Home = ({ onMenuClick }: HomeProps = {}) => {
  const { isAdmin } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
    loadHistory();
  }, []);

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

  const saveToHistory = (song: Song) => {
    const updatedHistory = [song, ...history.filter((s) => s.id !== song.id)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("playHistory", JSON.stringify(updatedHistory));
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.movieName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || song.type === selectedType;
    const matchesLanguage = selectedLanguage === "all" || song.language === selectedLanguage;
    return matchesSearch && matchesType && matchesLanguage;
  });

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

  // Get unique types and languages
  const types = ["all", ...Array.from(new Set(songs.map((s) => s.type)))];
  const languages = ["all", ...Array.from(new Set(songs.map((s) => s.language)))];

  // Group songs for sections
  const recentSongs = filteredSongs.slice(0, 6);
  const dailyMixes = filteredSongs.filter(s => s.type === "Song").slice(0, 4);
  const jumpBackIn = history.slice(0, 6);

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
    <div className="min-h-screen pb-32 md:pb-24 bg-background">
      <ParticleBackground />
      
      {/* Header - Fixed at top */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
          {/* Mobile/Tablet Header */}
          <div className="flex items-center justify-between gap-3 mb-3 md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0 hover:bg-accent"
              onClick={onMenuClick}
            >
              <User className="w-5 h-5" />
            </Button>

            <h1 className="text-base font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              MONK ENTERTAINMENT
            </h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search songs, artists, movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border h-10 rounded-lg text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="flex-1 md:w-32 bg-secondary border-border text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Types" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="flex-1 md:w-32 bg-secondary border-border text-sm">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang === "all" ? "All Languages" : lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8">
        {/* Jump Back In Section */}
        {jumpBackIn.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Jump Back In</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {jumpBackIn.map((song, index) => (
                <div
                  key={song.id}
                  className="group relative bg-card/50 rounded-lg p-3 hover:bg-card transition-all cursor-pointer animate-fade-in border border-border/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handlePlay(song)}
                >
                  <div className="relative aspect-square mb-3 rounded-md overflow-hidden">
                    <img
                      src={song.imageUrl}
                      alt={song.songName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        className="w-12 h-12 rounded-full shadow-lg"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm truncate mb-1">{song.songName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{song.artistName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Made For You Section */}
        {dailyMixes.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Made For You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dailyMixes.map((song, index) => (
                <div
                  key={song.id}
                  className="group relative bg-card/50 rounded-lg p-4 hover:bg-card transition-all cursor-pointer animate-fade-in border border-border/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handlePlay(song)}
                >
                  <div className="relative aspect-square mb-2 sm:mb-3 rounded overflow-hidden shadow-lg">
                    <img
                      src={song.imageUrl}
                      alt={song.songName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base truncate mb-0.5 sm:mb-1">{song.songName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{song.artistName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Songs Section */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              All Songs {filteredSongs.length > 0 && `(${filteredSongs.length})`}
            </h2>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No songs found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredSongs.map((song, index) => (
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
