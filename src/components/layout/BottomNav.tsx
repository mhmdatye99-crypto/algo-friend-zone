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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-[68px] px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-1.5 flex-1 min-w-[56px] h-[56px] rounded-xl transition-colors active:bg-secondary"
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span
                  className={cn(
                    "text-[12px] font-medium leading-none transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
