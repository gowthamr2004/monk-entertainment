import { Zap, TrendingUp, Clock, Settings as SettingsIcon, LogOut, ChevronRight, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const menuItems = [
    { icon: Zap, label: "Your Premium", badge: "Family" },
    { icon: TrendingUp, label: "What's new" },
    { icon: TrendingUp, label: "Your Sound Capsule" },
    { icon: Clock, label: "Recents" },
    { icon: SettingsIcon, label: "Settings and privacy" },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-24 pt-16 md:pt-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Profile Section */}
        {user && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 bg-purple-500">
                <AvatarFallback className="bg-purple-500 text-white text-2xl">
                  {user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.email?.split('@')[0]}</h1>
                <Button variant="link" className="p-0 h-auto text-muted-foreground">
                  View profile
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Add Account Button */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center border-2 border-dashed border-border">
                <UserIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-base text-muted-foreground">Add account</span>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start h-auto py-4 px-2 hover:bg-card/50"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <item.icon className="w-6 h-6" />
                  <span className="text-base">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {item.badge}
                  </span>
                )}
                {!item.badge && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </div>
            </Button>
          ))}
        </div>

        {user && (
          <>
            <Separator className="my-6" />
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
