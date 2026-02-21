import { useState } from "react";
import { Bell, Moon, Sun, Search, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useThemeMode } from "@/hooks/useTheme";
import NotificationsSheet from "@/components/notifications/NotificationsSheet";
import UniversalSearch from "@/components/layout/UniversalSearch";
import SideDrawer from "@/components/layout/SideDrawer";

const pageTitles: Record<string, string> = {
  "/": "",
  "/markets": "MARKETS",
  "/signals": "SIGNALS",
  "/community": "COMMUNITY",
  "/portfolio": "PORTFOLIO",
  "/learning": "ACADEMY",
  "/subscription": "SUBSCRIPTION",
  "/admin": "ADMIN",
  "/tools": "TOOLS",
  "/journal": "JOURNAL",
  "/morning-brief": "BRIEFING",
  "/chart-analysis": "CHART",
};

const TopBar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { isDark, toggle } = useThemeMode();

  const isHome = location.pathname === "/";
  const currentTitle = pageTitles[location.pathname] || "";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center justify-between px-4 h-11 max-w-lg mx-auto">
          {/* Left: Menu */}
          <button
            onClick={() => setShowDrawer(true)}
            className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <Menu className="w-[18px] h-[18px] text-foreground/60" strokeWidth={1.5} />
          </button>

          {/* Center */}
          {isHome ? (
            <p className="text-[11px] font-mono font-semibold tracking-[0.3em] text-foreground/50 uppercase">
              Nexus
            </p>
          ) : (
            <p className="text-[10px] font-mono font-medium tracking-[0.2em] text-foreground/50 uppercase">{currentTitle}</p>
          )}

          {/* Right */}
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSearch(true)} className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
              <Search className="w-[15px] h-[15px] text-foreground/40" strokeWidth={1.5} />
            </button>
            <button onClick={toggle} className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
              {isDark ? <Sun className="w-[15px] h-[15px] text-primary/60" strokeWidth={1.5} /> : <Moon className="w-[15px] h-[15px] text-foreground/40" strokeWidth={1.5} />}
            </button>
            <button onClick={() => setShowNotifications(true)} className="relative w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
              <Bell className="w-[15px] h-[15px] text-foreground/40" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
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
