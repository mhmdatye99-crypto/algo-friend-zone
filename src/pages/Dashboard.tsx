import { motion } from "framer-motion";
import {
  Brain, Activity, Anchor, ArrowUpRight, ArrowDownRight,
  Sun, Gauge, Radar, BookOpenCheck, Pen, ChevronLeft,
  TrendingUp, TrendingDown, Eye, Zap, AlertTriangle, Globe, Search, X, Star, Target, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLivePrices, formatPrice, assetCategories, type AssetCategory } from "@/hooks/useLivePrices";
import MiniChart from "@/components/MiniChart";
import { useFavorites } from "@/hooks/useFavorites";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const marketPulse = {
  index: 73,
  label: "صعودي معتدل",
  subMetrics: [
    { label: "تدفق المؤسسات", value: 81, color: "text-success" },
    { label: "زخم التقنيات", value: 68, color: "text-primary" },
    { label: "معنويات التجزئة", value: 55, color: "text-warning" },
    { label: "تقلّب المخاطر", value: 42, color: "text-accent" },
  ],
};

const whaleActivity = [
  { asset: "BTC", amount: "1,200 BTC", value: "$80.9M", direction: "in", exchange: "Binance", time: "منذ 2 د", type: "تجميع" },
  { asset: "ETH", amount: "15,000 ETH", value: "$48.7M", direction: "out", exchange: "Coinbase", time: "منذ 5 د", type: "تفريغ" },
  { asset: "USDT", amount: "50M USDT", value: "$50M", direction: "in", exchange: "Kraken", time: "منذ 8 د", type: "تحويل" },
  { asset: "BTC", amount: "800 BTC", value: "$53.9M", direction: "in", exchange: "OKX", time: "منذ 12 د", type: "تجميع" },
  { asset: "SOL", amount: "200K SOL", value: "$29.6M", direction: "out", exchange: "Binance", time: "منذ 15 د", type: "تفريغ" },
];

const researchQuests = [
  { label: "تحليل شارت واحد عبر رؤية AI", done: true },
  { label: "مراجعة 3 إشارات ألفا تنبؤية", done: true },
  { label: "تدوين ملاحظة في يوميات المتداول", done: false },
  { label: "إكمال وحدة من الأكاديمية الكمّية", done: false },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const assets = useLivePrices();
  const { favorites, toggle: toggleFavorite, isLoggedIn } = useFavorites();
  const { goal, stats } = useGoalPlanner();

  // Countdown timer
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!goal?.target_date) return;
    const tick = () => {
      const diff = new Date(goal.target_date!).getTime() - Date.now();
      if (diff <= 0) { setCountdown("انتهى"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [goal?.target_date]);

  const filteredAssets = assets
    .filter(a => activeCategory === "الكل" || a.category === activeCategory)
    .filter(a => !searchQuery || a.pair.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(a => !showFavOnly || favorites.has(a.pair));

  const favoriteAssets = assets.filter(a => favorites.has(a.pair));

  const pulseColor = marketPulse.index >= 70
    ? "text-success" : marketPulse.index >= 45
    ? "text-primary" : "text-destructive";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-10 pb-28 space-y-5 max-w-lg mx-auto"
    >
      {/* العنوان */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">مركز القيادة</p>
          <h1 className="text-xl font-bold text-foreground">TradeJourney AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/morning-brief")}
            className="flex items-center gap-1.5 text-[11px] font-mono text-warning bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20 hover:bg-warning/15 transition-colors"
          >
            <Sun className="w-3.5 h-3.5" />
            الملخص الصباحي
          </button>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">مباشر</span>
          </span>
        </div>
      </motion.div>

      {/* شريط الأسعار السريع - Ticker Bar */}
      <motion.div variants={fadeUp} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {assets.slice(0, 10).map((asset, i) => (
            <div key={i} onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)} className="flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2 border border-border/10 cursor-pointer hover:bg-secondary/60 transition-colors">
              <span className="text-sm font-bold">{asset.icon}</span>
              <span className="text-[11px] font-mono font-bold">{asset.pair}</span>
              <MiniChart data={asset.sparkline} up={asset.up} width={40} height={16} />
              <span className={cn("text-[10px] font-mono font-medium", asset.up ? "text-success" : "text-destructive")}>
                {asset.up ? "+" : ""}{asset.change}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* نبض الذكاء السوقي */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">نبض الذكاء السوقي</p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            تحديث مباشر
          </span>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className={cn("text-4xl font-bold font-mono", pulseColor)}>{marketPulse.index}</span>
          <div className="mb-1">
            <span className={cn("text-sm font-mono font-semibold", pulseColor)}>{marketPulse.label}</span>
            <p className="text-[10px] text-muted-foreground font-mono">مؤشر ثقة AI المركّب</p>
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-destructive via-warning to-success"
            initial={{ width: 0 }}
            animate={{ width: `${marketPulse.index}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {marketPulse.subMetrics.map((m, i) => (
            <div key={i} className="bg-secondary/40 rounded-lg px-2 py-2 text-center border border-border/10">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider leading-tight mb-1">{m.label}</p>
              <p className={cn("text-base font-bold font-mono", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* إجراءات سريعة */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
        {[
          { icon: Radar, label: "تحليل استراتيجية", path: "/signals" },
          { icon: Eye, label: "رؤية الشارت", path: "/chart-vision" },
          { icon: Brain, label: "الأكاديمية الكمّية", path: "/academy" },
          { icon: Pen, label: "يوميات المتداول", path: "/profile" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/20"
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* تدفق المعنويات العالمية */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            الأسواق العالمية — مباشر
          </h3>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={() => setShowFavOnly(!showFavOnly)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  showFavOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                <Star className={cn("w-4 h-4", showFavOnly && "fill-current")} />
              </button>
            )}
            <button
              onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                showSearch ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/signals")} className="text-[10px] text-primary flex items-center gap-1 font-mono">
              خطة المعركة <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* شريط البحث */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن عملة... BTC, EUR, GOLD"
                className="w-full bg-secondary/60 border border-border/30 rounded-xl pr-10 pl-10 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[10px] font-mono text-muted-foreground mt-1.5">
                {filteredAssets.length} نتيجة لـ "{searchQuery}"
              </p>
            )}
          </motion.div>
        )}

        {/* تبويبات التصنيف */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all duration-300 whitespace-nowrap",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {cat}
              <span className="text-[10px] opacity-60 mr-1">
                ({activeCategory === "الكل" ? assets.length : assets.filter(a => a.category === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* قائمة المفضلة */}
        {isLoggedIn && favoriteAssets.length > 0 && !showFavOnly && (
          <div className="mb-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-primary fill-primary" /> المفضلة ({favoriteAssets.length})
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {favoriteAssets.map((asset) => (
                <div key={asset.pair} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 min-w-max">
                  <span className="text-sm">{asset.icon}</span>
                  <span className="text-[11px] font-mono font-bold">{asset.pair}</span>
                  <MiniChart data={asset.sparkline} up={asset.up} width={36} height={14} />
                  <span className={cn("text-[10px] font-mono font-medium", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-xl divide-y divide-border/20">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            <span className="w-5"></span>
            <span>الأصل</span>
            <span className="w-16 text-start">السعر</span>
            <span className="w-[60px] text-center">الشارت</span>
            <span className="w-14 text-start">التغيّر</span>
          </div>
          {filteredAssets.slice(0, 15).map((item, i) => (
            <motion.div
              key={item.pair}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 items-center px-4 py-2.5 hover:bg-secondary/20 transition-colors cursor-pointer"
            >
              <button
                onClick={(e) => { e.stopPropagation(); isLoggedIn && toggleFavorite(item.pair); }}
                className={cn(
                  "w-5 h-5 flex items-center justify-center transition-colors",
                  favorites.has(item.pair) ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"
                )}
              >
                <Star className={cn("w-3.5 h-3.5", favorites.has(item.pair) && "fill-current")} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border/20">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <div>
                  <span className="text-[12px] font-mono font-medium block leading-tight">{item.pair}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{item.vol}</span>
                </div>
              </div>
              <span className="text-[12px] font-mono font-medium w-16 text-start tabular-nums">
                {formatPrice(item.price)}
              </span>
              <div className="w-[60px] flex justify-center">
                <MiniChart data={item.sparkline} up={item.up} width={50} height={20} />
              </div>
              <span className={cn("text-[11px] font-mono font-medium w-14 text-start tabular-nums", item.up ? "text-success" : "text-destructive")}>
                {item.up ? "+" : ""}{item.change}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* مراقب الحيتان */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
            <Anchor className="w-4 h-4 text-accent" />
            مراقب الحيتان — تدفقات On-Chain
          </h3>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">مباشر</span>
          </span>
        </div>
        <div className="glass rounded-xl divide-y divide-border/20">
          {whaleActivity.map((whale, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  whale.direction === "in" ? "bg-success/15" : "bg-destructive/15"
                )}>
                  {whale.direction === "in" ? (
                    <ArrowDownRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono font-medium">{whale.amount}</span>
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded-md",
                      whale.direction === "in" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {whale.type}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">{whale.exchange} · {whale.time}</p>
                </div>
              </div>
              <span className="text-[12px] font-mono font-medium">{whale.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* الأوديسة المالية - Countdown */}
      {goal && stats && (
        <motion.div
          variants={fadeUp}
          onClick={() => navigate("/goal-planner")}
          className="glass rounded-xl p-4 cursor-pointer hover:bg-secondary/20 transition-colors border border-primary/10"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              الأوديسة المالية
            </h3>
            <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-mono font-bold text-primary">{countdown}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))",
                    boxShadow: "0 0 8px hsl(43 100% 50% / 0.4)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </div>
            <span className="text-[12px] font-mono font-bold text-primary">{stats.progress.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
            <span>${goal.current_balance.toLocaleString()}</span>
            <span>الهدف: ${goal.target_goal.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* مهام البحث السوقي */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <BookOpenCheck className="w-4 h-4 text-primary" />
          مهام البحث السوقي
          <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-md font-mono">
            {researchQuests.filter(q => q.done).length}/{researchQuests.length}
          </span>
        </h3>
        <div className="space-y-2">
          {researchQuests.map((q, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                  q.done
                    ? "bg-success border-success text-success-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {q.done && <span className="text-[10px]">✓</span>}
              </div>
              <span className={cn("text-[12px] font-mono", q.done && "line-through text-muted-foreground")}>{q.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* تحذير */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/30 border border-border/10">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-[10px] text-muted-foreground font-mono">
          مركز دعم القرار فقط — لا يتم تنفيذ أي صفقات أو عمليات مالية من خلال هذه المنصة
        </p>
      </motion.div>

      {/* نبض المجتمع */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] text-muted-foreground font-mono">
            <span className="font-bold text-foreground font-mono">12,453</span> محلل متصل الآن
          </span>
        </div>
        <div className="flex -space-x-1.5 rtl:space-x-reverse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-lg bg-secondary border border-background flex items-center justify-center text-[10px] font-bold font-mono text-muted-foreground"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <div className="w-7 h-7 rounded-lg bg-secondary border border-background flex items-center justify-center text-[10px] font-mono text-muted-foreground">
            +99
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
