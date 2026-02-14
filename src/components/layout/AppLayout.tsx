import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import NexusSplash from "./NexusSplash";

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
      <main className="pb-24 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
