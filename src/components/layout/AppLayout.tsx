import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import NexusSplash from "./NexusSplash";
import LiveTickerBar from "./LiveTickerBar";
import { NexusAIProvider, useNexusAI } from "@/contexts/NexusAIContext";
import NexusAIFloatingButton from "@/components/nexus-ai/NexusAIFloatingButton";
import NexusAIFullscreen from "@/components/nexus-ai/NexusAIFullscreen";
import ChartAnalysisEdgeTab from "@/components/nexus-ai/ChartAnalysisEdgeTab";

const LayoutShell = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const shown = sessionStorage.getItem("nexus-splash-shown");
    return !shown;
  });
  const location = useLocation();
  const { open: aiOpen } = useNexusAI();

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("nexus-splash-shown", "1");
    setShowSplash(false);
  }, []);

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      {showSplash && <NexusSplash onComplete={handleSplashComplete} />}
      <TopBar />
      <LiveTickerBar />
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ChartAnalysisEdgeTab />
      <NexusAIFloatingButton />
      <NexusAIFullscreen />

      {!aiOpen && <BottomNav />}
    </div>
  );
};

const AppLayout = () => (
  <NexusAIProvider>
    <LayoutShell />
  </NexusAIProvider>
);

export default AppLayout;
