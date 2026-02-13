import { motion } from "framer-motion";
import {
  Brain, Activity, Anchor, ArrowUpRight, ArrowDownRight,
  Sun, Gauge, Radar, BookOpenCheck, Pen, ChevronLeft,
  TrendingUp, TrendingDown, Eye, Zap, AlertTriangle, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
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

const globalSentiment = [
  { pair: "BTC/USDT", price: "67,450.00", change: +2.34, up: true, vol: "$2.4B", rsi: 62, macd: "صعودي", signal: "شراء" },
  { pair: "ETH/USDT", price: "3,245.80", change: +1.87, up: true, vol: "$1.1B", rsi: 58, macd: "صعودي", signal: "شراء" },
  { pair: "EUR/USD", price: "1.0845", change: -0.12, up: false, vol: "$890M", rsi: 44, macd: "هبوطي", signal: "بيع" },
  { pair: "GOLD", price: "2,345.60", change: +0.45, up: true, vol: "$540M", rsi: 67, macd: "صعودي", signal: "شراء" },
  { pair: "SOL/USDT", price: "148.32", change: -1.23, up: false, vol: "$380M", rsi: 38, macd: "هبوطي", signal: "محايد" },
];

const whaleActivity = [
  { asset: "BTC", amount: "1,200 BTC", value: "$80.9M", direction: "in", exchange: "Binance", time: "منذ 2 د", type: "تجميع" },
  { asset: "ETH", amount: "15,000 ETH", value: "$48.7M", direction: "out", exchange: "Coinbase", time: "منذ 5 د", type: "تفريغ" },
  { asset: "USDT", amount: "50M USDT", value: "$50M", direction: "in", exchange: "Kraken", time: "منذ 8 د", type: "تحويل" },
  { asset: "BTC", amount: "800 BTC", value: "$53.9M", direction: "in", exchange: "OKX", time: "منذ 12 د", type: "تجميع" },
];

const researchQuests = [
  { label: "تحليل شارت واحد عبر رؤية AI", done: true },
  { label: "مراجعة 3 إشارات ألفا تنبؤية", done: true },
  { label: "تدوين ملاحظة في يوميات المتداول", done: false },
  { label: "إكمال وحدة من الأكاديمية الكمّية", done: false },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const pulseColor = marketPulse.index >= 70
    ? "text-success" : marketPulse.index >= 45
    ? "text-primary" : "text-destructive";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-10 pb-4 space-y-3 max-w-lg mx-auto"
    >
      {/* العنوان */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">مركز القيادة</p>
          <h1 className="text-lg font-bold text-foreground">TradeJourney AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/morning-brief")}
            className="flex items-center gap-1 text-[10px] font-mono text-warning bg-warning/10 px-2 py-1 rounded border border-warning/20 hover:bg-warning/15 transition-colors"
          >
            <Sun className="w-3 h-3" />
            الملخص الصباحي
          </button>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[9px] font-mono text-muted-foreground">مباشر</span>
          </span>
        </div>
      </motion.div>

      {/* نبض الذكاء السوقي */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">نبض الذكاء السوقي</p>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">تحديث مباشر</span>
        </div>
        
        <div className="flex items-end gap-3 mb-3">
          <span className={cn("text-4xl font-bold font-mono", pulseColor)}>{marketPulse.index}</span>
          <div className="mb-1">
            <span className={cn("text-xs font-mono font-semibold", pulseColor)}>{marketPulse.label}</span>
            <p className="text-[9px] text-muted-foreground font-mono">مؤشر ثقة AI المركّب</p>
          </div>
        </div>

        <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-destructive via-warning to-success"
            initial={{ width: 0 }}
            animate={{ width: `${marketPulse.index}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {marketPulse.subMetrics.map((m, i) => (
            <div key={i} className="bg-secondary/40 rounded px-2 py-1.5 text-center border border-border/10">
              <p className="text-[7px] text-muted-foreground font-mono uppercase tracking-wider leading-tight">{m.label}</p>
              <p className={cn("text-sm font-bold font-mono", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* إجراءات سريعة */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-1.5">
        {[
          { icon: Radar, label: "تحليل استراتيجية", path: "/signals" },
          { icon: Eye, label: "رؤية الشارت", path: "/chart-vision" },
          { icon: Brain, label: "الأكاديمية الكمّية", path: "/academy" },
          { icon: Pen, label: "يوميات المتداول", path: "/profile" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/20"
          >
            <item.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-[7px] text-muted-foreground font-mono uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* تدفق المعنويات العالمية */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-accent" />
            تدفق المعنويات العالمية
          </h3>
          <button onClick={() => navigate("/signals")} className="text-[9px] text-primary flex items-center gap-1 font-mono">
            خطة المعركة <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="glass rounded-lg divide-y divide-border/20">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-1.5 px-3 py-1.5 text-[8px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>الزوج</span>
            <span className="w-16 text-start">السعر</span>
            <span className="w-10 text-start">التغيّر</span>
            <span className="w-8 text-start">RSI</span>
            <span className="w-10 text-start">MACD</span>
          </div>
          {globalSentiment.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-1.5 items-center px-3 py-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center">
                  <span className="text-[7px] font-bold font-mono text-foreground">
                    {item.pair.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono font-medium block leading-tight">{item.pair}</span>
                  <span className="text-[8px] font-mono text-muted-foreground">{item.vol}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium w-16 text-start">{item.price}</span>
              <span className={cn("text-[10px] font-mono font-medium w-10 text-start", item.up ? "text-success" : "text-destructive")}>
                {item.up ? "+" : ""}{item.change}%
              </span>
              <span className={cn(
                "text-[10px] font-mono w-8 text-start",
                item.rsi > 70 ? "text-destructive" : item.rsi < 30 ? "text-success" : "text-muted-foreground"
              )}>
                {item.rsi}
              </span>
              <span className={cn(
                "text-[9px] font-mono w-10 text-start",
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Anchor className="w-3 h-3 text-accent" />
            مراقب الحيتان — تدفقات On-Chain
          </h3>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
            <span className="text-[8px] font-mono text-muted-foreground">مباشر</span>
          </span>
        </div>
        <div className="glass rounded-lg divide-y divide-border/20">
          {whaleActivity.map((whale, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center",
                  whale.direction === "in" ? "bg-success/15" : "bg-destructive/15"
                )}>
                  {whale.direction === "in" ? (
                    <ArrowDownRight className="w-3 h-3 text-success" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-medium">{whale.amount}</span>
                    <span className={cn(
                      "text-[7px] font-mono px-1 py-0.5 rounded",
                      whale.direction === "in" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {whale.type}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground">{whale.exchange} · {whale.time}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium">{whale.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* مهام البحث السوقي */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
          <BookOpenCheck className="w-3 h-3 text-primary" />
          مهام البحث السوقي
          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono">
            {researchQuests.filter(q => q.done).length}/{researchQuests.length}
          </span>
        </h3>
        <div className="space-y-1.5">
          {researchQuests.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-all",
                  q.done
                    ? "bg-success border-success text-success-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {q.done && <span className="text-[8px]">✓</span>}
              </div>
              <span className={cn("text-[11px] font-mono", q.done && "line-through text-muted-foreground")}>{q.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* تحذير عدم التنفيذ */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/10">
        <AlertTriangle className="w-3 h-3 text-muted-foreground shrink-0" />
        <p className="text-[8px] text-muted-foreground font-mono">
          مركز دعم القرار فقط — لا يتم تنفيذ أي صفقات أو عمليات مالية من خلال هذه المنصة
        </p>
      </motion.div>

      {/* نبض المجتمع */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">
            <span className="font-bold text-foreground font-mono">12,453</span> محلل متصل الآن
          </span>
        </div>
        <div className="flex -space-x-1.5 rtl:space-x-reverse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded bg-secondary border border-background flex items-center justify-center text-[8px] font-bold font-mono text-muted-foreground"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <div className="w-6 h-6 rounded bg-secondary border border-background flex items-center justify-center text-[8px] font-mono text-muted-foreground">
            +99
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
