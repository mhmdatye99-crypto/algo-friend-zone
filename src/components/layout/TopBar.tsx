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
  "/chart-analysis/result": "نتيجة التحليل",
  "/chart-analysis/result/:id": "نتيجة التحليل",
};

const TopBar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { isDark, toggle } = useThemeMode();

  const isHome = location.pathname === "/";
  const currentTitle = pageTitles[location.pathname] || (location.pathname.startsWith("/chart-analysis/result/") ? "نتيجة التحليل" : "");

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="grid grid-cols-[44px_1fr_132px] items-center px-4 h-14 max-w-lg mx-auto">
          <button
            onClick={() => setShowDrawer(true)}
            aria-label="القائمة"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-[22px] h-[22px] text-foreground" strokeWidth={1.8} />
          </button>

          {isHome ? (
            <div className="text-center leading-tight min-w-0">
              <p className="text-[17px] font-bold tracking-[0.18em] text-primary nx-ltr">NEXUS</p>
              <p className="text-[13px] text-muted-foreground nx-ltr">Trading Intelligence</p>
            </div>
          ) : (
            <p className="text-[17px] font-semibold text-foreground text-center truncate px-2">{currentTitle}</p>
          )}

          <div className="flex items-center justify-end">
            <button onClick={() => setShowSearch(true)} aria-label="بحث" className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <Search className="w-[21px] h-[21px] text-muted-foreground" strokeWidth={1.8} />
            </button>
            <button onClick={toggle} aria-label="تبديل السمة" className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              {isDark ? <Sun className="w-[21px] h-[21px] text-primary" strokeWidth={1.8} /> : <Moon className="w-[21px] h-[21px] text-muted-foreground" strokeWidth={1.8} />}
            </button>
            <button onClick={() => setShowNotifications(true)} aria-label="التنبيهات" className="relative w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-[21px] h-[21px] text-muted-foreground" strokeWidth={1.8} />
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
