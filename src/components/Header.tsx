import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
  onMenuClick?: () => void;
}

const Header = ({
  selectedType,
  onTypeChange,
  selectedLanguage,
  onLanguageChange,
  onMenuClick,
}: HeaderProps) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4 p-4">
        {/* Profile Icon for Mobile/Tablet - triggers sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden rounded-full flex-shrink-0 p-0"
          onClick={onMenuClick}
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={avatarUrl || undefined} alt="Profile" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-green-400">
              <User className="w-5 h-5 text-black" />
            </AvatarFallback>
          </Avatar>
        </Button>

        {/* Filters */}
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-32 bg-secondary">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Song">Song</SelectItem>
            <SelectItem value="BGM">BGM</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-32 bg-secondary">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Tamil">Tamil</SelectItem>
            <SelectItem value="Telugu">Telugu</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Malayalam">Malayalam</SelectItem>
            <SelectItem value="English">English</SelectItem>
          </SelectContent>
        </Select>

        {/* Profile */}
        <Button variant="ghost" size="icon" className="rounded-full p-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl || undefined} alt="Profile" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-green-400">
              <User className="w-4 h-4 text-black" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
};

export default Header;
