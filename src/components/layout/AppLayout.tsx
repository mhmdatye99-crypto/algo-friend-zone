import { useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import NexusSplash from "./NexusSplash";
import LiveTickerBar from "./LiveTickerBar";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const AppLayout = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const shown = sessionStorage.getItem("nexus-splash-shown");
    return !shown;
  });
  const location = useLocation();

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("nexus-splash-shown", "1");
    setShowSplash(false);
  }, []);

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      {showSplash && <NexusSplash onComplete={handleSplashComplete} />}
      <TopBar />
      <div className="relative z-10 border-b border-border/10">
        <LiveTickerBar />
      </div>
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
