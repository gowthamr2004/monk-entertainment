import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4 p-4">
        {/* Profile Icon for Mobile/Tablet - triggers sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden rounded-full flex-shrink-0"
          onClick={onMenuClick}
        >
          <User className="w-6 h-6" />
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
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
