import { Settings as SettingsIcon, LogOut, Upload, Instagram, Youtube, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface SettingsProps {
  onMenuClick?: () => void;
}

const Settings = ({ onMenuClick }: SettingsProps = {}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const instagramUrl = "https://www.instagram.com/monk_entertainment/";
  const youtubeUrl = "https://youtube.com/@monkentertainment1163?si=jeZWuqOZFIPoZljT";
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, phone_number")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setUsername(data.full_name || "");
      setOriginalUsername(data.full_name || "");
      setPhoneNumber(data.phone_number || "");
      setOriginalPhoneNumber(data.phone_number || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("song-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("song-images")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      toast.success("Profile picture updated");
    } catch (error) {
      toast.error("Error uploading avatar");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: username,
          phone_number: phoneNumber,
        })
        .eq("id", user.id);

      if (error) throw error;

      setOriginalUsername(username);
      setOriginalPhoneNumber(phoneNumber);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUsername(originalUsername);
    setPhoneNumber(originalPhoneNumber);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Settings</h1>
        </div>

        <Card className="mb-6 bg-card/50 border-border/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
            <CardDescription className="text-sm">Manage your profile and social links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="text-lg sm:text-xl">{username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Label htmlFor="avatar">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    asChild
                  >
                    <span className="cursor-pointer text-xs sm:text-sm">
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {uploading ? "Uploading..." : "Change Picture"}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted text-sm"
              />
            </div>

            {/* Username (Editable) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="username" className="text-sm">Username</Label>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Edit</span>
                  </Button>
                )}
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={!isEditing}
                className={`text-sm ${!isEditing ? "bg-muted" : ""}`}
              />
            </div>

            {/* Mobile Number (Editable) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your mobile number"
                disabled={!isEditing}
                className={`text-sm ${!isEditing ? "bg-muted" : ""}`}
              />
            </div>

            {/* Save/Cancel Buttons (Only in Edit Mode) */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 text-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={saving}
                  className="sm:w-auto text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            {/* About Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">About</h3>
              
              <div className="flex flex-col gap-2 sm:gap-3">
                {/* Instagram Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                  asChild
                >
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Follow on Instagram</span>
                  </a>
                </Button>

                {/* YouTube Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                  asChild
                >
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Subscribe on YouTube</span>
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        {user && (
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
};

export default Settings;
