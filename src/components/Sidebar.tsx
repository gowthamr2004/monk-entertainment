import { Home, ListMusic, Upload, History, Info, LogOut, LogIn, Plus, Music, User, X } from "lucide-react";
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
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
    <>
      {/* Backdrop - only on mobile/tablet when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-[280px] md:w-[200px] lg:w-[260px] xl:w-[280px] bg-sidebar-background border-r border-sidebar-border flex flex-col overflow-hidden transition-transform duration-300 ease-in-out z-50 shadow-xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Close button - only on mobile/tablet */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 md:hidden"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Logo section removed */}

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 space-y-1 pt-4">
        {/* Create Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
              variant="secondary" 
                className="w-full justify-start gap-2 md:gap-3 mb-3 h-10 sm:h-11 font-semibold px-3"
              >
                <Plus className="w-5 h-5" />
                <span>Create</span>
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
              `flex items-center justify-start gap-2 md:gap-3 px-3 md:px-4 py-2 sm:py-2.5 rounded-md mb-0.5 transition-all ${
                isActive
                  ? "bg-sidebar-accent text-primary font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-sidebar-border bg-sidebar-background">
        {user ? (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-start gap-2 md:gap-3 px-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
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
              className="w-full justify-start gap-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground px-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Sign Out</span>
            </Button>
          </div>
        ) : (
          <NavLink to="/auth">
            <Button
              variant="default"
              className="w-full justify-start gap-2 font-semibold px-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Button>
          </NavLink>
        )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
