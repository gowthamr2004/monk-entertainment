import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload as UploadIcon } from "lucide-react";

const Upload = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    songName: "",
    artistName: "",
    movieName: "",
    type: "Song" as "Song" | "BGM",
    language: "Tamil",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to upload songs
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Only admin users can upload songs. Please contact an administrator
            to request access.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.songName ||
      !formData.artistName ||
      !formData.movieName ||
      !imageFile ||
      !audioFile
    ) {
      toast.error("Please fill all fields and upload files");
      return;
    }

    setIsUploading(true);

    try {
      // Upload image
      const imageExt = imageFile.name.split(".").pop();
      const imagePath = `${user.id}/${Date.now()}.${imageExt}`;
      const { error: imageError } = await supabase.storage
        .from("song-images")
        .upload(imagePath, imageFile);

      if (imageError) throw imageError;

      // Upload audio
      const audioExt = audioFile.name.split(".").pop();
      const audioPath = `${user.id}/${Date.now()}.${audioExt}`;
      const { error: audioError } = await supabase.storage
        .from("song-audio")
        .upload(audioPath, audioFile);

      if (audioError) throw audioError;

      // Get public URLs
      const { data: imageUrlData } = supabase.storage
        .from("song-images")
        .getPublicUrl(imagePath);

      const { data: audioUrlData } = supabase.storage
        .from("song-audio")
        .getPublicUrl(audioPath);

      // Insert song record
      const { error: insertError } = await supabase.from("songs").insert({
        song_name: formData.songName,
        artist_name: formData.artistName,
        movie_name: formData.movieName,
        type: formData.type,
        language: formData.language,
        image_url: imageUrlData.publicUrl,
        audio_url: audioUrlData.publicUrl,
        uploaded_by: user.id,
      });

      if (insertError) throw insertError;

      toast.success("Song uploaded successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload song");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            Upload New Song
          </h1>
          <p className="text-muted-foreground">
            Add a new song or BGM to the library
          </p>
        </div>

        <Card className="p-6 bg-card border-border animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="songName">Song Name *</Label>
                <Input
                  id="songName"
                  placeholder="Enter song name"
                  value={formData.songName}
                  onChange={(e) =>
                    setFormData({ ...formData, songName: e.target.value })
                  }
                  className="bg-secondary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist Name *</Label>
                <Input
                  id="artistName"
                  placeholder="Enter artist name"
                  value={formData.artistName}
                  onChange={(e) =>
                    setFormData({ ...formData, artistName: e.target.value })
                  }
                  className="bg-secondary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movieName">Movie Name *</Label>
              <Input
                id="movieName"
                placeholder="Enter movie name"
                value={formData.movieName}
                onChange={(e) =>
                  setFormData({ ...formData, movieName: e.target.value })
                }
                className="bg-secondary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Song" | "BGM") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Song">Song</SelectItem>
                    <SelectItem value="BGM">BGM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Malayalam">Malayalam</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Thumbnail Image *</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="bg-secondary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio">Audio File (MP3) *</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="bg-secondary"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading} className="flex-1">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload Song
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
