import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Music, ArrowLeft, Play, User, Trash2 } from "lucide-react";
import { Playlist as PlaylistType, Song } from "@/types/song";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "@/components/SongCard";
import AudioPlayer from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlaylistProps {
  onMenuClick?: () => void;
}

const Playlist = ({ onMenuClick }: PlaylistProps = {}) => {
  const { isAdmin, user } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistType | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [playlistImages, setPlaylistImages] = useState<Record<string, string>>({});
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);

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
    fetchPlaylistImages(userPlaylists);
  };

  const fetchPlaylistImages = async (playlists: PlaylistType[]) => {
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

  const handleDeletePlaylist = async (playlistId: string) => {
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlistId);

    if (error) {
      toast.error("Failed to delete playlist");
      return;
    }

    setPlaylists(playlists.filter(p => p.id !== playlistId));
    setDeletePlaylistId(null);
    toast.success("Playlist deleted");
  };

  if (selectedPlaylist) {
    return (
      <div className="min-h-screen p-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedPlaylist(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playlists
          </Button>

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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={onMenuClick}
          >
            <User className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              Your Playlists
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Create and manage your music collections</p>
          </div>
        </div>

        {/* Create Playlist */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-card border-border animate-fade-in">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Create New Playlist</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()}
              className="bg-secondary flex-1"
            />
            <Button onClick={handleCreatePlaylist} className="whitespace-nowrap w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </Card>

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg sm:text-xl text-muted-foreground">No playlists yet</p>
            <p className="text-sm text-muted-foreground mt-2 px-4">
              Create your first playlist to organize your favorite songs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {playlists.map((playlist, index) => (
              <Card
                key={playlist.id}
                className="p-3 bg-card border-border hover:bg-card/80 transition-all hover-scale animate-fade-in relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2 overflow-hidden">
                    {playlistImages[playlist.id] ? (
                      <img 
                        src={playlistImages[playlist.id]} 
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5 truncate">{playlist.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletePlaylistId(playlist.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deletePlaylistId} onOpenChange={() => setDeletePlaylistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePlaylistId && handleDeletePlaylist(deletePlaylistId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Playlist;
