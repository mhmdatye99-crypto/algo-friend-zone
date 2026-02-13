import { motion } from "framer-motion";
import {
  Brain, Activity, Anchor, ArrowUpRight, ArrowDownRight,
  Sun, Gauge, Radar, BookOpenCheck, Pen, ChevronLeft,
  TrendingUp, TrendingDown, Eye, Zap, AlertTriangle, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

type AssetCategory = "الكل" | "كريبتو" | "فوركس" | "سلع";

const allAssets = [
  { pair: "BTC/USDT", price: "67,450.00", change: +2.34, up: true, vol: "$2.4B", rsi: 62, macd: "صعودي", signal: "شراء", category: "كريبتو" as AssetCategory },
  { pair: "ETH/USDT", price: "3,245.80", change: +1.87, up: true, vol: "$1.1B", rsi: 58, macd: "صعودي", signal: "شراء", category: "كريبتو" as AssetCategory },
  { pair: "SOL/USDT", price: "148.32", change: -1.23, up: false, vol: "$380M", rsi: 38, macd: "هبوطي", signal: "محايد", category: "كريبتو" as AssetCategory },
  { pair: "BNB/USDT", price: "612.40", change: +0.95, up: true, vol: "$290M", rsi: 54, macd: "صعودي", signal: "شراء", category: "كريبتو" as AssetCategory },
  { pair: "XRP/USDT", price: "0.5234", change: -0.45, up: false, vol: "$180M", rsi: 41, macd: "هبوطي", signal: "محايد", category: "كريبتو" as AssetCategory },
  { pair: "EUR/USD", price: "1.0845", change: -0.12, up: false, vol: "$890M", rsi: 44, macd: "هبوطي", signal: "بيع", category: "فوركس" as AssetCategory },
  { pair: "GBP/USD", price: "1.2634", change: +0.18, up: true, vol: "$620M", rsi: 52, macd: "صعودي", signal: "شراء", category: "فوركس" as AssetCategory },
  { pair: "USD/JPY", price: "154.82", change: +0.34, up: true, vol: "$780M", rsi: 71, macd: "صعودي", signal: "تشبع شرائي", category: "فوركس" as AssetCategory },
  { pair: "AUD/USD", price: "0.6543", change: -0.28, up: false, vol: "$210M", rsi: 36, macd: "هبوطي", signal: "بيع", category: "فوركس" as AssetCategory },
  { pair: "GOLD", price: "2,345.60", change: +0.45, up: true, vol: "$540M", rsi: 67, macd: "صعودي", signal: "شراء", category: "سلع" as AssetCategory },
  { pair: "SILVER", price: "27.84", change: +1.12, up: true, vol: "$120M", rsi: 59, macd: "صعودي", signal: "شراء", category: "سلع" as AssetCategory },
  { pair: "OIL", price: "78.45", change: -0.67, up: false, vol: "$340M", rsi: 45, macd: "هبوطي", signal: "محايد", category: "سلع" as AssetCategory },
];

const whaleActivity = [
  { asset: "BTC", amount: "1,200 BTC", value: "$80.9M", direction: "in", exchange: "Binance", time: "منذ 2 د", type: "تجميع" },
  { asset: "ETH", amount: "15,000 ETH", value: "$48.7M", direction: "out", exchange: "Coinbase", time: "منذ 5 د", type: "تفريغ" },
  { asset: "USDT", amount: "50M USDT", value: "$50M", direction: "in", exchange: "Kraken", time: "منذ 8 د", type: "تحويل" },
  { asset: "BTC", amount: "800 BTC", value: "$53.9M", direction: "in", exchange: "OKX", time: "منذ 12 د", type: "تجميع" },
  { asset: "SOL", amount: "200K SOL", value: "$29.6M", direction: "out", exchange: "Binance", time: "منذ 15 د", type: "تفريغ" },
  { asset: "XRP", amount: "80M XRP", value: "$41.8M", direction: "in", exchange: "Bitstamp", time: "منذ 20 د", type: "تجميع" },
];

const researchQuests = [
  { label: "تحليل شارت واحد عبر رؤية AI", done: true },
  { label: "مراجعة 3 إشارات ألفا تنبؤية", done: true },
  { label: "تدوين ملاحظة في يوميات المتداول", done: false },
  { label: "إكمال وحدة من الأكاديمية الكمّية", done: false },
];

const assetCategories: AssetCategory[] = ["الكل", "كريبتو", "فوركس", "سلع"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");

  const filteredAssets = activeCategory === "الكل"
    ? allAssets
    : allAssets.filter(a => a.category === activeCategory);

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
          {allAssets.slice(0, 8).map((asset, i) => (
            <div key={i} className="flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2 border border-border/10">
              <span className="text-[11px] font-mono font-bold">{asset.pair}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{asset.price}</span>
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
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-lg">تحديث مباشر</span>
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
            تدفق المعنويات العالمية
          </h3>
          <button onClick={() => navigate("/signals")} className="text-[10px] text-primary flex items-center gap-1 font-mono">
            خطة المعركة <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* تبويبات التصنيف */}
        <div className="flex gap-1.5 mb-3">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all duration-300",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="glass rounded-xl divide-y divide-border/20">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>الزوج</span>
            <span className="w-16 text-start">السعر</span>
            <span className="w-12 text-start">التغيّر</span>
            <span className="w-8 text-start">RSI</span>
            <span className="w-12 text-start">MACD</span>
          </div>
          {filteredAssets.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-[10px] font-bold font-mono text-foreground">
                    {item.pair.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] font-mono font-medium block leading-tight">{item.pair}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{item.vol}</span>
                </div>
              </div>
              <span className="text-[12px] font-mono font-medium w-16 text-start">{item.price}</span>
              <span className={cn("text-[11px] font-mono font-medium w-12 text-start", item.up ? "text-success" : "text-destructive")}>
                {item.up ? "+" : ""}{item.change}%
              </span>
              <span className={cn(
                "text-[11px] font-mono w-8 text-start",
                item.rsi > 70 ? "text-destructive" : item.rsi < 30 ? "text-success" : "text-muted-foreground"
              )}>
                {item.rsi}
              </span>
              <span className={cn(
                "text-[10px] font-mono w-12 text-start",
                item.macd === "صعودي" ? "text-success" : "text-destructive"
              )}>
                {item.macd}
              </span>
            </div>
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

      {/* تحذير عدم التنفيذ */}
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
