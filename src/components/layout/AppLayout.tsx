import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import NexusSplash from "./NexusSplash";
import LiveTickerBar from "./LiveTickerBar";

const AppLayout = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const shown = sessionStorage.getItem("nexus-splash-shown");
    return !shown;
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("nexus-splash-shown", "1");
    setShowSplash(false);
  }, []);

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      {showSplash && <NexusSplash onComplete={handleSplashComplete} />}
      <div className="deep-space-overlay" />
      <TopBar />
      <div className="relative z-10 border-b border-border/10 bg-card/50 backdrop-blur-sm">
        <LiveTickerBar />
      </div>
      <main className="pb-24 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
