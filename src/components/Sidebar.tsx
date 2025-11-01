import { ListMusic, Search as SearchIcon, Plus, Menu } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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
    <aside className="fixed left-0 top-0 h-full w-[70px] sm:w-[70px] md:w-[200px] lg:w-[260px] xl:w-[280px] bg-black/95 backdrop-blur-xl border-r border-border/30 z-50 flex flex-col">
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <h2 className="text-base font-semibold hidden md:block text-muted-foreground">Your Library</h2>
        <div className="md:hidden flex items-center justify-center w-full">
          <ListMusic className="w-6 h-6" />
        </div>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="hidden md:flex rounded-full">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/upload")}>
                Create Playlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/upload")}>
                Upload Song
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="px-4 py-2 hidden md:block">
        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger value="playlists" className="data-[state=active]:bg-card">
              Playlists
            </TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-card">
              Artists
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-3 py-2 hidden md:block">
        <Button variant="ghost" size="icon" className="w-full justify-start rounded-lg">
          <SearchIcon className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {user && playlists.length > 0 ? (
            playlists.map((playlist) => (
              <NavLink
                key={playlist.id}
                to={`/playlist?id=${playlist.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex-shrink-0 flex items-center justify-center">
                  <ListMusic className="w-6 h-6" />
                </div>
                <div className="hidden md:flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{playlist.name}</span>
                  <span className="text-xs text-muted-foreground">Playlist</span>
                </div>
              </NavLink>
            ))
          ) : (
            <div className="hidden md:block p-4 text-center text-muted-foreground text-sm">
              {user ? "No playlists yet" : "Sign in to see your library"}
            </div>
          )}
        </div>
      </ScrollArea>

      {user && (
        <div className="p-2 border-t border-border/30 hidden md:block">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
