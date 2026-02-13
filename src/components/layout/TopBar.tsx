import { Bell, User, Sun, Brain, Shield, Target, Crown, Settings, MoreHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const pageTitles: Record<string, string> = {
  "/": "الرئيسية",
  "/markets": "الأسواق",
  "/chart-vision": "رؤية الشارت",
  "/signals": "الإشارات",
  "/community": "غرفة العمليات",
  "/academy": "الأكاديمية",
  "/goal-planner": "الأوديسة المالية",
  "/morning-brief": "الملخص الصباحي",
  "/profile": "الملف الشخصي",
  "/risk-calculator": "حاسبة المخاطر",
  "/subscription": "الاشتراك",
  "/admin": "لوحة الإدارة",
  "/more": "المزيد",
};

const quickActions = [
  { icon: Sun, label: "الملخص الصباحي", path: "/morning-brief", color: "text-warning" },
  { icon: Brain, label: "الأكاديمية", path: "/academy", color: "text-primary" },
  { icon: Target, label: "الأوديسة المالية", path: "/goal-planner", color: "text-warning" },
  { icon: Shield, label: "حاسبة المخاطر", path: "/risk-calculator", color: "text-success" },
  { icon: Crown, label: "الاشتراك", path: "/subscription", color: "text-primary" },
  { icon: Settings, label: "الإعدادات", path: "/more", color: "text-muted-foreground" },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assets = useLivePrices();
  const topAssets = assets.slice(0, 8);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentTitle = pageTitles[location.pathname] || "TradeJourney";

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

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
        <div className="flex items-center gap-1.5 relative" ref={menuRef}>
          {/* Quick access icons */}
          <button
            onClick={() => navigate("/morning-brief")}
            className="w-8 h-8 rounded-[10px] bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
            title="الملخص الصباحي"
          >
            <Sun className="w-4 h-4 text-warning" />
          </button>
          <button
            className="w-8 h-8 rounded-[10px] bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-[10px] bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
          {/* More menu */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-8 h-8 rounded-[10px] bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-52 rounded-xl overflow-hidden z-50"
                style={{
                  background: "hsla(240, 15%, 4%, 0.95)",
                  backdropFilter: "blur(30px)",
                  border: "1px solid hsla(43, 100%, 50%, 0.12)",
                  boxShadow: "0 10px 40px hsla(0, 0%, 0%, 0.5)",
                }}
              >
                {quickActions.map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-secondary/40 transition-colors text-right"
                  >
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="text-[12px] font-mono text-foreground">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
