import { Home, Radar, Camera, GraduationCap, User, Network } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "القيادة" },
  { path: "/signals", icon: Radar, label: "إشارات" },
  { path: "/community", icon: Network, label: "المجتمع", glow: true },
  { path: "/chart-vision", icon: Camera, label: "الشارت" },
  { path: "/academy", icon: GraduationCap, label: "الأكاديمية" },
  { path: "/profile", icon: User, label: "المحلل" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl glow-gold"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {'glow' in tab && tab.glow && !isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: "0 0 12px hsl(190 100% 50% / 0.2), 0 0 4px hsl(190 100% 50% / 0.1)" }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <Icon className={cn("w-[20px] h-[20px] relative z-10", 'glow' in tab && tab.glow && !isActive && "text-accent")} />
              <span className="text-[9px] font-medium relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
