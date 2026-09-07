import { Home, BarChart3, Zap, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/markets", icon: BarChart3, label: "الأسواق" },
  { path: "/signals", icon: Zap, label: "الإشارات" },
  { path: "/community", icon: Users, label: "المجتمع" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-[70px] px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname === tab.path;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-1.5 flex-1 min-w-[64px] h-[58px] rounded-xl transition-colors active:bg-secondary"
              >
                <Icon
                  className={cn("w-6 h-6 transition-colors", active ? "text-primary" : "text-muted-foreground")}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span
                  className={cn(
                    "text-[13px] font-semibold leading-none transition-colors",
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
