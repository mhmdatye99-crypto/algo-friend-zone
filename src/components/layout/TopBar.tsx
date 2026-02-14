import { Bell, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const pageTitles: Record<string, string> = {
  "/": "",
  "/markets": "الأسواق",
  "/chart-vision": "رؤية الشارت",
  "/signals": "الإشارات",
  "/community": "غرفة العمليات",
  "/academy": "الأكاديمية",
  "/goal-planner": "Nexus Growth Path",
  "/morning-brief": "الملخص الصباحي",
  "/profile": "الملف الشخصي",
  "/risk-calculator": "حاسبة المخاطر",
  "/subscription": "الاشتراك",
  "/admin": "لوحة الإدارة",
  "/hub": "المزيد",
  "/trade-journal": "سجل الصفقات",
  "/my-analyses": "سجل التحليلات",
};

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assets = useLivePrices();
  const topAssets = assets.slice(0, 8);
  const { user } = useAuth();
  const { stats } = useGoalPlanner();

  const isHome = location.pathname === "/";
  const currentTitle = pageTitles[location.pathname] || "Nexus Trade AI";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "صباح الخير";
    if (h < 17) return "مساء الخير";
    return "مساء الخير";
  };

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "hsla(240, 15%, 2%, 0.85)",
        backdropFilter: "blur(30px)",
        borderBottom: "1px solid hsla(43, 100%, 50%, 0.08)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        {/* Left: Profile */}
        <button
          onClick={() => navigate("/hub")}
          className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center border border-primary/25 hover:bg-primary/25 transition-colors"
          style={{ boxShadow: "0 0 12px hsl(43 100% 50% / 0.1)" }}
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

        {/* Right: Notification */}
        <button
          className="relative w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </button>
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
    </header>
  );
};

export default TopBar;
