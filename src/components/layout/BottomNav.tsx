import { Home, Brain, Crosshair, Users, Crown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/nexus-brain", icon: Brain, label: "الذكاء" },
  { path: "/trade-center", icon: Crosshair, label: "التداول", center: true },
  { path: "/community", icon: Users, label: "الساحة" },
  { path: "/hub", icon: Crown, label: "المقر" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom max-w-lg mx-auto">
      <div
        className="flex items-center justify-around h-16 rounded-[10px] px-2 bg-card/90 backdrop-blur-[30px] border border-border/30 shadow-lg dark:shadow-[0_-4px_30px_hsla(0,0%,0%,0.4)]"
      >
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          if (tab.center) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center -mt-7"
              >
                <div
                  className="absolute w-[72px] h-[72px] rounded-full animate-pulse-slow pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, hsla(43, 100%, 50%, 0.12) 0%, transparent 70%)",
                  }}
                />
                <motion.div
                  className={cn(
                    "w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    active
                      ? "bg-primary text-primary-foreground border-primary/40"
                      : "text-primary border-primary/40 bg-card"
                  )}
                  style={{
                    boxShadow: active
                      ? "0 0 28px hsl(43 100% 50% / 0.35)"
                      : "0 0 16px hsl(43 100% 50% / 0.1)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-7 h-7" />
                </motion.div>
                <span className={cn(
                  "text-[9px] font-mono font-bold mt-1",
                  active ? "text-primary" : "text-muted-foreground"
                )}>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-[10px] transition-all duration-300"
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-[10px] bg-accent/10 border border-accent/15"
                  style={{
                    boxShadow: "0 0 16px hsl(190 100% 50% / 0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-300",
                active ? "text-accent" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-mono font-medium relative z-10 transition-colors duration-300",
                active ? "text-accent" : "text-muted-foreground"
              )}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
