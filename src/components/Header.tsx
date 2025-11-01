import { Home, Search, Bell, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 sm:left-[70px] md:left-[200px] lg:left-[260px] xl:left-[280px] right-0 z-40 bg-black/95 backdrop-blur-md border-b border-border/30">
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-black/40 hover:bg-black/60"
            onClick={() => navigate("/")}
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="What do you want to play?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-card/50 border-border/50 rounded-full"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hidden sm:flex"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-primary"
            onClick={() => navigate("/settings")}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
