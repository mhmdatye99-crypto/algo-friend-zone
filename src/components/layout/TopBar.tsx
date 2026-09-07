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
  "/markets": "الأسواق",
  "/signals": "الإشارات",
  "/community": "المجتمع",
  "/learning": "الأكاديمية",
  "/subscription": "الاشتراك",
  "/admin": "لوحة التحكم",
  "/tools": "الأدوات",
  "/journal": "سجل الصفقات",
  "/morning-brief": "الإحاطة اليومية",
  "/chart-analysis": "تحليل الشارت",
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
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-3 h-14 max-w-lg mx-auto">
          <button
            onClick={() => setShowDrawer(true)}
            aria-label="القائمة"
            className="nx-tap flex items-center justify-center rounded-xl hover:bg-secondary transition-colors"
          >
            <Menu className="w-[22px] h-[22px] text-foreground" strokeWidth={1.8} />
          </button>

          {isHome ? (
            <div className="text-center leading-tight">
              <p className="text-[17px] font-bold tracking-[0.3em] text-primary">NEXUS</p>
              <p className="text-[12px] text-muted-foreground -mt-0.5">Trading Intelligence</p>
            </div>
          ) : (
            <p className="text-[17px] font-semibold text-foreground">{currentTitle}</p>
          )}

          <div className="flex items-center">
            <button onClick={() => setShowSearch(true)} aria-label="بحث" className="nx-tap flex items-center justify-center rounded-xl hover:bg-secondary transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
            </button>
            <button onClick={toggle} aria-label="تبديل السمة" className="nx-tap flex items-center justify-center rounded-xl hover:bg-secondary transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-primary" strokeWidth={1.8} /> : <Moon className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />}
            </button>
            <button onClick={() => setShowNotifications(true)} aria-label="التنبيهات" className="relative nx-tap flex items-center justify-center rounded-xl hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
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
