import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderNavProps {
  onMenuClick: () => void;
}

const HeaderNav = ({ onMenuClick }: HeaderNavProps) => {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full flex-shrink-0 md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            Music Library
          </h1>
        </div>
      </div>
    </div>
  );
};

export default HeaderNav;
