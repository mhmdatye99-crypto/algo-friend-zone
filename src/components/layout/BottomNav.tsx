import { Home, Radar, Camera, GraduationCap, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "مركز القيادة" },
  { path: "/signals", icon: Radar, label: "إشارات ألفا" },
  { path: "/chart-vision", icon: Camera, label: "رؤية الشارت" },
  { path: "/academy", icon: GraduationCap, label: "الأكاديمية الكمّية" },
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
              <Icon className="w-[22px] h-[22px] relative z-10" />
              <span className="text-[11px] font-medium relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
