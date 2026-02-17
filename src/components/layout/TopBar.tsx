import { useState } from "react";
import { Bell, Coins, Moon, Sun, Search, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useNotifications } from "@/hooks/useNotifications";
import { useThemeMode } from "@/hooks/useTheme";
import NotificationsSheet from "@/components/notifications/NotificationsSheet";
import UniversalSearch from "@/components/layout/UniversalSearch";
import SideDrawer from "@/components/layout/SideDrawer";

const pageTitles: Record<string, string> = {
  "/": "",
  "/trade-center": "المحطة",
  "/community": "الساحة",
  "/learning": "الأكاديمية",
  "/profile": "الخزنة",
  "/subscription": "الاشتراك",
  "/admin": "لوحة الإدارة",
  "/tools": "الأدوات",
  "/journal": "اليومية",
  "/morning-brief": "الملخص الصباحي",
};

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { credits } = useCredits();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { isDark, toggle } = useThemeMode();

  const isHome = location.pathname === "/";
  const currentTitle = pageTitles[location.pathname] || "";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-[40px] border-b border-border/10">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
          {/* Left: Menu */}
          <button
            onClick={() => setShowDrawer(true)}
            className="w-8 h-8 rounded-lg bg-secondary/40 flex items-center justify-center border border-border/10 hover:bg-secondary/60 transition-colors"
          >
            <Menu className="w-4 h-4 text-muted-foreground/70" />
          </button>

          {/* Center */}
          <div className="flex flex-col items-center">
            {isHome ? (
              <p className="text-[13px] font-mono font-black tracking-[0.15em] text-foreground/90">
                <span className="text-accent">NEXUS</span> <span className="text-foreground/50">TRADE</span>
              </p>
            ) : (
              <p className="text-[12px] font-mono font-bold text-foreground/80">{currentTitle}</p>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSearch(true)} className="w-7 h-7 rounded-lg bg-secondary/30 flex items-center justify-center border border-border/10 hover:bg-secondary/50 transition-colors">
              <Search className="w-3.5 h-3.5 text-muted-foreground/60" />
            </button>
            <button onClick={toggle} className="w-7 h-7 rounded-lg bg-secondary/30 flex items-center justify-center border border-border/10 hover:bg-secondary/50 transition-colors">
              {isDark ? <Sun className="w-3.5 h-3.5 text-accent/70" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground/60" />}
            </button>
            <button onClick={() => navigate("/subscription")} className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-accent/8 border border-accent/10">
              <Coins className="w-3 h-3 text-accent/70" />
              <span className="text-[10px] font-mono font-bold text-accent/80 tabular-nums">{credits}</span>
            </button>
            <button onClick={() => setShowNotifications(true)} className="relative w-7 h-7 rounded-lg bg-secondary/30 flex items-center justify-center border border-border/10 hover:bg-secondary/50 transition-colors">
              <Bell className="w-3.5 h-3.5 text-muted-foreground/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-destructive flex items-center justify-center text-[8px] font-mono font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <NotificationsSheet open={showNotifications} onClose={() => setShowNotifications(false)} />
        <UniversalSearch open={showSearch} onClose={() => setShowSearch(false)} />
      </header>
      <SideDrawer open={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
};

export default TopBar;
