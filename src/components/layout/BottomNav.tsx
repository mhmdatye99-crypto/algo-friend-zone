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
        <div className="flex items-center justify-around h-[52px] mx-2 mb-1.5 rounded-xl bg-card/90 backdrop-blur-xl border border-border/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center gap-[3px] w-14 h-11 transition-colors duration-150"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-px w-5 h-[2px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={cn(
                  "w-[18px] h-[18px] transition-colors duration-150",
                  active ? "text-primary" : "text-muted-foreground/50"
                )} strokeWidth={active ? 2.2 : 1.5} />
                <span className={cn(
                  "text-[9px] font-medium transition-colors duration-150 leading-none",
                  active ? "text-primary" : "text-muted-foreground/40"
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
