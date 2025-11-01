import { Home, ListMusic, Upload, History, Info, LogOut, LogIn, Plus, Music, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const baseMenuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ListMusic, label: "Playlist", path: "/playlist" },
    { icon: History, label: "History", path: "/history" },
    { icon: Info, label: "About", path: "/about" },
  ];

  const menuItems = isAdmin
    ? [
        ...baseMenuItems.slice(0, 2),
        { icon: Upload, label: "Upload", path: "/upload" },
        ...baseMenuItems.slice(2),
      ]
    : baseMenuItems;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
          MONK ENTERTAINMENT
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {/* Create Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-3 mb-3 h-11 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-56 bg-popover border-border z-50"
            >
              <DropdownMenuItem asChild>
                <NavLink to="/playlist" className="flex items-center gap-2 cursor-pointer">
                  <ListMusic className="w-4 h-4" />
                  <span>New Playlist</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/playlist" className="flex items-center gap-2 cursor-pointer">
                  <Music className="w-4 h-4" />
                  <span>Playlist Folder</span>
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-md mb-0.5 transition-all ${
                isActive
                  ? "bg-sidebar-accent text-primary font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-background/80">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user.email?.split('@')[0]}
                </p>
                {isAdmin && (
                  <span className="text-xs text-primary font-medium">Admin Access</span>
                )}
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        ) : (
          <NavLink to="/auth">
            <Button
              variant="default"
              className="w-full justify-center gap-2 font-semibold"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </NavLink>
        )}
        
        <div className="mt-4 pt-3 border-t border-sidebar-border/50">
          <p className="text-xs text-muted-foreground/60 text-center">
            © 2024 Monk Entertainment
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
