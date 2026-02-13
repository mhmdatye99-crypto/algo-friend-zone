import { Bell, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { motion } from "framer-motion";

const pageTitles: Record<string, string> = {
  "/": "الرئيسية",
  "/markets": "الأسواق",
  "/chart-vision": "رؤية الشارت",
  "/signals": "الإشارات",
  "/more": "المزيد",
  "/community": "غرفة العمليات",
  "/academy": "الأكاديمية",
  "/goal-planner": "الأوديسة المالية",
  "/morning-brief": "الملخص الصباحي",
  "/profile": "الملف الشخصي",
};

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assets = useLivePrices();
  const topAssets = assets.slice(0, 8);

  const currentTitle = pageTitles[location.pathname] || "TradeJourney";

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "hsla(240, 15%, 2%, 0.85)",
        backdropFilter: "blur(30px)",
        borderBottom: "1px solid hsla(43, 100%, 50%, 0.08)",
      }}
    >
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-primary/15 flex items-center justify-center border border-primary/20">
            <span className="text-primary font-bold text-sm font-mono">TJ</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground leading-tight">{currentTitle}</p>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">TradeJourney AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-[10px] bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-[10px] bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
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
    </header>
  );
};

export default TopBar;
