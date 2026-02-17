import { useState } from "react";
import { Home, ScanLine, Brain, Trophy, User, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/ai-scan", icon: ScanLine, label: "AI Scan" },
  { path: "/mentor", icon: Brain, label: "المُرشد" },
  { path: "/community", icon: Trophy, label: "المجتمع" },
  { path: "/profile", icon: User, label: "الملف" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom max-w-lg mx-auto">
      <div className="flex items-center justify-around h-16 rounded-[10px] px-2 bg-card/95 backdrop-blur-[30px] border border-border/30 shadow-lg dark:shadow-[0_-4px_30px_hsla(0,0%,0%,0.5)]">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-[10px] transition-all duration-300"
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-[10px] bg-primary/8 border border-primary/15"
                  style={{ boxShadow: "0 0 16px hsl(135 100% 55% / 0.08)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-300",
                active ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-mono font-medium relative z-10 transition-colors duration-300",
                active ? "text-primary" : "text-muted-foreground"
              )}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
