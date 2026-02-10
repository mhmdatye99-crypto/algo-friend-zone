import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Users, Brain, Target, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const mockSignals = [
  { pair: "BTC/USDT", action: "شراء", confidence: 87, price: "67,450", target: "68,500", urgent: true },
  { pair: "EUR/USD", action: "بيع", confidence: 82, price: "1.0845", target: "1.0790", urgent: false },
  { pair: "GOLD", action: "شراء", confidence: 91, price: "2,345", target: "2,380", urgent: true },
];

const mockMarket = [
  { pair: "BTC/USDT", price: "67,450.00", change: +2.34, up: true },
  { pair: "ETH/USDT", price: "3,245.80", change: +1.87, up: true },
  { pair: "EUR/USD", price: "1.0845", change: -0.12, up: false },
  { pair: "GOLD", price: "2,345.60", change: +0.45, up: true },
  { pair: "SOL/USDT", price: "148.32", change: -1.23, up: false },
];

const Dashboard = () => {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-12 pb-4 space-y-5 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">صباح الخير 👋</p>
          <h1 className="text-xl font-bold text-foreground">متداول محترف</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
          م
        </div>
      </motion.div>

      {/* Portfolio Card */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5 glow-gold">
        <p className="text-xs text-muted-foreground mb-1">قيمة المحفظة</p>
        <h2 className="text-3xl font-bold font-mono text-gradient-gold">$24,750.00</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 text-success text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            +$1,234.50
          </span>
          <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">+5.24%</span>
        </div>
        <div className="flex gap-3 mt-4">
          {[
            { icon: Zap, label: "صفقة", color: "from-primary to-orange-500" },
            { icon: Brain, label: "AI", color: "from-cyan-500 to-blue-500" },
            { icon: Users, label: "مجتمع", color: "from-purple-500 to-pink-500" },
            { icon: Target, label: "أهداف", color: "from-emerald-500 to-green-500" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", item.color)}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* AI Signals Pulse */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            توصيات AI الحية
          </h3>
          <button className="text-xs text-primary flex items-center gap-1">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {mockSignals.map((signal, i) => (
            <div
              key={i}
              className={cn(
                "glass rounded-xl p-3 min-w-[200px] flex-shrink-0 border",
                signal.urgent ? "border-primary/30 glow-gold" : "border-border/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold text-sm">{signal.pair}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    signal.action === "شراء"
                      ? "bg-success/20 text-success"
                      : "bg-destructive/20 text-destructive"
                  )}
                >
                  {signal.action}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] text-primary font-mono">{signal.confidence}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>الدخول: {signal.price}</span>
                <span>الهدف: {signal.target}</span>
              </div>
              {signal.urgent && (
                <div className="mt-2 text-[10px] text-warning flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  تنتهي خلال 5 دقائق
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Market Overview */}
      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold mb-3">لمحة السوق</h3>
        <div className="glass rounded-xl divide-y divide-border/30">
          {mockMarket.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-[10px] font-bold font-mono text-foreground">
                    {item.pair.slice(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-medium">{item.pair}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-mono font-medium">{item.price}</p>
                <p
                  className={cn(
                    "text-xs font-mono",
                    item.up ? "text-success" : "text-destructive"
                  )}
                >
                  {item.up ? "+" : ""}{item.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Journey Progress */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">تقدم الرحلة</h3>
          <span className="text-xs text-primary font-mono">65%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-yellow-400 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          متبقي 3 أيام للهدف الأسبوعي · <span className="text-success">+$850</span> حتى الآن
        </p>
      </motion.div>

      {/* Community Pulse */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">
            <span className="font-mono text-foreground font-semibold">12,453</span> متداول متصل الآن
          </span>
        </div>
        <div className="flex -space-x-2 rtl:space-x-reverse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 border-2 border-background flex items-center justify-center text-[9px] font-bold text-foreground"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[9px] text-muted-foreground">
            +99
          </div>
        </div>
      </motion.div>

      {/* Daily Quests */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          🎮 مهام اليوم
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">2/3</span>
        </h3>
        <div className="space-y-2">
          {[
            { label: "افتح صفقة واحدة", done: true },
            { label: "أكمل درساً في الأكاديمية", done: true },
            { label: "شارك تحليلاً مع المجتمع", done: false },
          ].map((q, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  q.done
                    ? "bg-success border-success text-success-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {q.done && <span className="text-[10px]">✓</span>}
              </div>
              <span className={cn("text-sm", q.done && "line-through text-muted-foreground")}>{q.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
