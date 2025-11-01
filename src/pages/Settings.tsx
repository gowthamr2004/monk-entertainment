import { Settings as SettingsIcon, User, Bell, Lock, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const settingsSections = [
    {
      icon: User,
      title: "Account",
      description: "Manage your account settings",
      items: ["Profile", "Email & Password", "Privacy"],
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notifications",
      items: ["Push Notifications", "Email Updates"],
    },
    {
      icon: Lock,
      title: "Security",
      description: "Keep your account secure",
      items: ["Two-Factor Authentication", "Login History"],
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help with the app",
      items: ["FAQ", "Contact Support", "Report a Problem"],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>

        {user && (
          <Card className="mb-6 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="space-y-4">
          {settingsSections.map((section) => (
            <Card key={section.title} className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {user && (
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full mt-6"
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
