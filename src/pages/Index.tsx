import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Home from "./Home";
import Playlist from "./Playlist";
import Upload from "./Upload";
import History from "./History";
import About from "./About";
import Auth from "./Auth";
import Search from "./Search";
import Settings from "./Settings";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is on auth page and is already logged in, redirect to home
  if (user && location.pathname === "/auth") {
    return <Navigate to="/" replace />;
  }

  // Auth page doesn't need sidebar
  if (location.pathname === "/auth") {
    return <Auth />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-[200px] lg:ml-[260px] xl:ml-[280px]">
        <Routes>
          <Route path="/" element={<Home onMenuClick={() => setIsSidebarOpen(true)} />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
