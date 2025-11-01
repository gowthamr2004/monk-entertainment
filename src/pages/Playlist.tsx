import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Music, ArrowLeft, Play, Menu } from "lucide-react";
import { Playlist as PlaylistType, Song } from "@/types/song";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "@/components/SongCard";
import AudioPlayer from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";

interface PlaylistProps {
  onMenuClick?: () => void;
}

const Playlist = ({ onMenuClick }: PlaylistProps) => {
  const { isAdmin, user } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistType | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch playlists");
      return;
    }

    const userPlaylists: PlaylistType[] = data.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      songs: playlist.song_ids,
      createdAt: new Date(playlist.created_at),
    }));

    setPlaylists(userPlaylists);
  };

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistSongs(selectedPlaylist.songs);
    }
  }, [selectedPlaylist]);

  const fetchPlaylistSongs = async (songIds: string[]) => {
    if (songIds.length === 0) {
      setPlaylistSongs([]);
      return;
    }

    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .in("id", songIds);

    if (error) {
      toast.error("Failed to fetch songs");
      return;
    }

    const songs: Song[] = data.map((song) => ({
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

    setPlaylistSongs(songs);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create playlists");
      return;
    }

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: user.id,
        name: newPlaylistName,
        song_ids: [],
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create playlist");
      return;
    }

    const newPlaylist: PlaylistType = {
      id: data.id,
      name: data.name,
      songs: data.song_ids,
      createdAt: new Date(data.created_at),
    };

    setPlaylists([newPlaylist, ...playlists]);
    setNewPlaylistName("");
    toast.success("Playlist created!");
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setQueue(playlistSongs);
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

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      setCurrentSong(playlistSongs[0]);
      setQueue(playlistSongs);
    }
  };

  const handleDelete = async (songId: string) => {
    if (!selectedPlaylist) return;

    const updatedSongs = selectedPlaylist.songs.filter(id => id !== songId);
    
    const { error } = await supabase
      .from("playlists")
      .update({ song_ids: updatedSongs })
      .eq("id", selectedPlaylist.id);

    if (error) {
      toast.error("Failed to remove song from playlist");
      return;
    }

    const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs };
    const updatedPlaylists = playlists.map(p => 
      p.id === selectedPlaylist.id ? updatedPlaylist : p
    );
    
    setPlaylists(updatedPlaylists);
    setSelectedPlaylist(updatedPlaylist);
    toast.success("Song removed from playlist");
  };

  if (selectedPlaylist) {
    return (
      <div className="min-h-screen pb-32">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0"
              onClick={onMenuClick}
            >
              <Menu className="w-6 h-6" />
            </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedPlaylist(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Playlists
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-8">

          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              {selectedPlaylist.name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">
                {playlistSongs.length} {playlistSongs.length === 1 ? "song" : "songs"}
              </p>
              {playlistSongs.length > 0 && (
                <Button onClick={handlePlayAll} className="gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  Play All
                </Button>
              )}
            </div>
          </div>

          {playlistSongs.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">No songs in this playlist</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add songs from the home page using the "Add to Playlist" button
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {playlistSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={handlePlaySong}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  isAdmin={true}
                />
              ))}
            </div>
          )}
        </div>

        {currentSong && (
          <AudioPlayer
            currentSong={currentSong}
            queue={queue}
            onNext={() => {
              const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
              if (currentIndex < queue.length - 1) {
                setCurrentSong(queue[currentIndex + 1]);
              }
            }}
            onPrevious={() => {
              const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
              if (currentIndex > 0) {
                setCurrentSong(queue[currentIndex - 1]);
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0"
              onClick={onMenuClick}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              Your Playlists
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 animate-fade-in">
          <p className="text-muted-foreground">Create and manage your music collections</p>
        </div>

        {/* Create Playlist */}
        <Card className="p-6 mb-8 bg-card border-border animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Create New Playlist</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()}
              className="bg-secondary"
            />
            <Button onClick={handleCreatePlaylist} className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </Card>

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No playlists yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first playlist to organize your favorite songs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <Card
                key={playlist.id}
                className="p-6 bg-card border-border hover:bg-card/80 transition-all cursor-pointer hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Music className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;
