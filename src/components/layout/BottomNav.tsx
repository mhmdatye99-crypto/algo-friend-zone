import { Home, BarChart3, ScanLine, Zap, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/markets", icon: BarChart3, label: "الأسواق" },
  { path: "/chart-vision", icon: ScanLine, label: "الشارت", center: true },
  { path: "/signals", icon: Zap, label: "الإشارات" },
  { path: "/community", icon: Users, label: "المجتمع" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom max-w-lg mx-auto">
      <div
        className="flex items-center justify-around h-16 rounded-[10px] px-2"
        style={{
          background: "hsla(240, 15%, 3%, 0.85)",
          backdropFilter: "blur(30px)",
          border: "1px solid hsla(43, 100%, 50%, 0.1)",
          boxShadow: "0 -4px 30px hsla(0,0%,0%,0.4), inset 0 1px 0 hsla(43,100%,50%,0.06)",
        }}
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
                className="relative flex flex-col items-center justify-center -mt-5"
              >
                <motion.div
                  className={cn(
                    "w-14 h-14 rounded-[10px] flex items-center justify-center transition-all duration-300",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/15 text-primary border border-primary/30"
                  )}
                  style={{
                    boxShadow: active
                      ? "0 0 24px hsl(43 100% 50% / 0.4), 0 0 60px hsl(43 100% 50% / 0.15)"
                      : "0 0 12px hsl(43 100% 50% / 0.15)",
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-mono font-medium mt-1",
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
                  className="absolute inset-0 rounded-[10px]"
                  style={{
                    background: "hsla(190, 100%, 50%, 0.08)",
                    boxShadow: "0 0 16px hsl(190 100% 50% / 0.15), inset 0 0 8px hsl(190 100% 50% / 0.05)",
                    border: "1px solid hsla(190, 100%, 50%, 0.15)",
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
