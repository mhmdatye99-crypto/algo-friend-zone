import { Home, BarChart3, GraduationCap, Users, Vault } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/profile", icon: Vault, label: "الخزنة" },
  { path: "/community", icon: Users, label: "الساحة" },
  { path: "/", icon: Home, label: "المحور" },
  { path: "/trade-center", icon: BarChart3, label: "المحطة" },
  { path: "/learning", icon: GraduationCap, label: "الأكاديمية" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-14 mx-3 mb-2 rounded-xl bg-card/95 backdrop-blur-[40px] border border-border/20 shadow-[0_-2px_20px_hsla(0,0%,0%,0.3)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 transition-all duration-200"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={cn(
                  "w-[18px] h-[18px] transition-colors duration-200",
                  active ? "text-accent" : "text-muted-foreground/60"
                )} strokeWidth={active ? 2.5 : 1.8} />
                <span className={cn(
                  "text-[10px] font-semibold transition-colors duration-200",
                  active ? "text-accent" : "text-muted-foreground/50"
                )}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
