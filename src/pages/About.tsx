import { Card } from "@/components/ui/card";
import { Music, Download, Search, Upload, Users, Headphones, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AboutProps {
  onMenuClick?: () => void;
}

const About = ({ onMenuClick }: AboutProps) => {
  const features = [
    {
      icon: Search,
      title: "Advanced Search",
      description: "Filter songs by language, type, artist, and more",
    },
    {
      icon: Headphones,
      title: "Built-in Player",
      description: "Seamless music playback with queue management",
    },
    {
      icon: Download,
      title: "Easy Downloads",
      description: "Download your favorite songs instantly",
    },
    {
      icon: Upload,
      title: "Admin Upload",
      description: "Authorized admins can upload new content",
    },
    {
      icon: Users,
      title: "Personal Playlists",
      description: "Create and manage your own collections",
    },
    {
      icon: Music,
      title: "Vast Library",
      description: "Songs and BGMs across multiple languages",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0"
              onClick={onMenuClick}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              About Us
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-8">
        {/* Hero Section */}
        <div className="mb-16 text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            MONK ENTERTAINMENT
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your ultimate destination for streaming and downloading high-quality music and BGMs
          </p>
        </div>

        {/* About Section */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-card to-secondary/20 border-border animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            MONK ENTERTAINMENT is a premium music platform designed for music lovers and content creators. 
            We provide a vast collection of songs and background music across multiple languages including 
            Tamil, Telugu, Hindi, Malayalam, and English.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform features a modern, Spotify-inspired interface with advanced search capabilities, 
            seamless playback, and easy downloads. Whether you're looking for the latest hits or timeless 
            classics, MONK ENTERTAINMENT has you covered.
          </p>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="p-6 bg-card border-border hover:bg-card/80 transition-all hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* YouTube Channel */}
        <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-green-400/10 border-border animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Follow Us on YouTube</h2>
          <p className="text-muted-foreground mb-4">
            Subscribe to MONK ENTERTAINMENT for the latest music updates
          </p>
          <a
            href="https://youtube.com/@monkentertainment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover-scale"
          >
            Visit Channel
          </a>
        </Card>
      </div>
    </div>
  );
};

export default About;
