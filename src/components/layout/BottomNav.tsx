import { Home, BarChart3, Zap, Briefcase, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/community", icon: Users, label: "المجتمع" },
  { path: "/portfolio", icon: Briefcase, label: "المحفظة" },
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/signals", icon: Zap, label: "الإشارات" },
  { path: "/markets", icon: BarChart3, label: "الأسواق" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-[50px] mx-2 mb-1.5 bg-card/95 backdrop-blur-lg border border-border/20" style={{ borderRadius: '4px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center gap-[2px] w-14 h-11 transition-all duration-100"
              >
                {active && (
                  <div className="absolute -top-px w-6 h-[1px] bg-primary" />
                )}
                <Icon className={cn(
                  "w-[17px] h-[17px] transition-colors duration-100",
                  active ? "text-primary" : "text-muted-foreground/40"
                )} strokeWidth={active ? 2 : 1.4} />
                <span className={cn(
                  "text-[8px] font-mono font-medium transition-colors duration-100 leading-none tracking-wide",
                  active ? "text-primary" : "text-muted-foreground/30"
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
