import { useState } from "react";
import { Bell, User, Coins, Moon, Sun, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useNotifications } from "@/hooks/useNotifications";
import { useThemeMode } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import NotificationsSheet from "@/components/notifications/NotificationsSheet";
import UniversalSearch from "@/components/layout/UniversalSearch";

const pageTitles: Record<string, string> = {
  "/": "",
  "/markets": "الأسواق",
  "/nexus-brain": "مركز الذكاء",
  "/trade-center": "توصيات حية",
  "/chart-vision": "رؤية الشارت",
  "/signals": "الإشارات",
  "/community": "الساحة",
  "/academy": "الأكاديمية",
  "/goal-planner": "مسار النمو",
  "/morning-brief": "الملخص الصباحي",
  "/profile": "الملف الشخصي",
  "/risk-calculator": "حاسبة المخاطر",
  "/subscription": "الاشتراك",
  "/admin": "لوحة الإدارة",
  "/hub": "المقر",
  "/trade-journal": "سجل الصفقات",
  "/my-analyses": "سجل التحليلات",
  "/challenges": "التحديات والانضباط",
};

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assets = useLivePrices();
  const topAssets = assets.slice(0, 8);
  const { user } = useAuth();
  const { stats } = useGoalPlanner();
  const { credits } = useCredits();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { isDark, toggle } = useThemeMode();

  const isHome = location.pathname === "/";
  const currentTitle = pageTitles[location.pathname] || "Nexus Trade AI";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-[30px] border-b border-border/30">
      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        {/* Left: Profile */}
        <button
          onClick={() => navigate("/hub")}
          className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center border border-primary/25 hover:bg-primary/25 transition-colors"
        >
          <User className="w-5 h-5 text-primary" />
        </button>

        {/* Center: Title or Growth */}
        <div className="flex flex-col items-center">
          {isHome ? (
            <>
              <p className="text-[15px] font-display font-bold text-foreground leading-tight tracking-wide">
                <span className="text-gradient-gold">NEXUS</span> <span className="text-foreground/80">TRADE AI</span>
              </p>
              {stats && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-primary font-bold">{stats.progress.toFixed(0)}%</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-[14px] font-bold text-foreground">{currentTitle}</p>
          )}
        </div>

        {/* Right: Search + Theme + Credits + Notification */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
            aria-label="بحث"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
            aria-label="تبديل الوضع"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-primary" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={() => navigate("/subscription")}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20"
          >
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-mono font-bold text-primary">{credits}</span>
          </button>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive flex items-center justify-center text-[9px] font-mono font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="overflow-hidden border-t border-border/10">
        <motion.div
          className="flex gap-4 px-4 py-1.5 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...topAssets, ...topAssets].map((asset, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
              <span>{asset.icon}</span>
              <span className="text-muted-foreground">{asset.pair}</span>
              <span className="font-medium">{formatPrice(asset.price)}</span>
              <span className={asset.up ? "text-success" : "text-destructive"}>
                {asset.up ? "+" : ""}{asset.change}%
              </span>
            </span>
          ))}
        </motion.div>
      </div>

      <NotificationsSheet open={showNotifications} onClose={() => setShowNotifications(false)} />
      <UniversalSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
};

export default TopBar;
