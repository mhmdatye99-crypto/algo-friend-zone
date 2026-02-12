import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Zap, Brain, Activity, Target,
  ChevronLeft, Anchor, ArrowUpRight, ArrowDownRight, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const mockSignals = [
  { pair: "BTC/USDT", action: "LONG", confidence: 87, price: "67,450", target: "68,500", alpha: 92, urgent: true },
  { pair: "EUR/USD", action: "SHORT", confidence: 82, price: "1.0845", target: "1.0790", alpha: 78, urgent: false },
  { pair: "GOLD", action: "LONG", confidence: 91, price: "2,345", target: "2,380", alpha: 95, urgent: true },
];

const mockMarket = [
  { pair: "BTC/USDT", price: "67,450.00", change: +2.34, up: true, vol: "2.4B", rsi: 62 },
  { pair: "ETH/USDT", price: "3,245.80", change: +1.87, up: true, vol: "1.1B", rsi: 58 },
  { pair: "EUR/USD", price: "1.0845", change: -0.12, up: false, vol: "890M", rsi: 44 },
  { pair: "GOLD", price: "2,345.60", change: +0.45, up: true, vol: "540M", rsi: 67 },
  { pair: "SOL/USDT", price: "148.32", change: -1.23, up: false, vol: "380M", rsi: 38 },
];

const whaleActivity = [
  { asset: "BTC", amount: "1,200 BTC", value: "$80.9M", direction: "in", exchange: "Binance", time: "2m ago" },
  { asset: "ETH", amount: "15,000 ETH", value: "$48.7M", direction: "out", exchange: "Coinbase", time: "5m ago" },
  { asset: "USDT", amount: "50M USDT", value: "$50M", direction: "in", exchange: "Kraken", time: "8m ago" },
];

const Dashboard = () => {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-10 pb-4 space-y-4 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">Trading Terminal</p>
          <h1 className="text-lg font-bold text-foreground">Performance Dashboard</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </motion.div>

      {/* Portfolio Card */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Total Portfolio Value</p>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">24H</span>
        </div>
        <h2 className="text-2xl font-bold font-mono text-foreground">$24,750.00</h2>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-success text-xs font-mono font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +$1,234.50
          </span>
          <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded">+5.24%</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { icon: Zap, label: "Quick Trade", shortcut: "⌘T" },
            { icon: Brain, label: "AI Analysis", shortcut: "⌘A" },
            { icon: Activity, label: "Whale Watch", shortcut: "⌘W" },
            { icon: Target, label: "Targets", shortcut: "⌘G" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/20"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-[8px] text-muted-foreground font-mono">{item.shortcut}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Predictive Alpha Signals */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Predictive Alpha Signals
          </h3>
          <button className="text-[10px] text-primary flex items-center gap-1 font-mono">
            View All <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {mockSignals.map((signal, i) => (
            <div
              key={i}
              className={cn(
                "glass rounded-lg p-3 min-w-[210px] flex-shrink-0 border",
                signal.urgent ? "border-primary/20" : "border-border/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm">{signal.pair}</span>
                <span
                  className={cn(
                    "text-[9px] font-bold font-mono px-2 py-0.5 rounded",
                    signal.action === "LONG"
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  )}
                >
                  {signal.action}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <div className="flex-1 w-20 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-primary font-mono">{signal.confidence}%</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">α{signal.alpha}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                <span>Entry: {signal.price}</span>
                <span>TP: {signal.target}</span>
              </div>
              {signal.urgent && (
                <div className="mt-2 text-[9px] text-warning flex items-center gap-1 font-mono">
                  <span className="w-1 h-1 rounded-full bg-warning animate-pulse" />
                  EXPIRES IN 5 MIN
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Market Sentiment & Flow Analysis */}
      <motion.div variants={fadeUp}>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono">
          Market Sentiment & Flow Analysis
        </h3>
        <div className="glass rounded-lg divide-y divide-border/20">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>Pair</span>
            <span className="w-16 text-left">Price</span>
            <span className="w-12 text-left">Chg%</span>
            <span className="w-10 text-left">RSI</span>
          </div>
          {mockMarket.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                  <span className="text-[8px] font-bold font-mono text-foreground">
                    {item.pair.slice(0, 2)}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium">{item.pair}</span>
              </div>
              <span className="text-xs font-mono font-medium w-16 text-left">{item.price}</span>
              <span
                className={cn(
                  "text-[11px] font-mono font-medium w-12 text-left",
                  item.up ? "text-success" : "text-destructive"
                )}
              >
                {item.up ? "+" : ""}{item.change}%
              </span>
              <span className={cn(
                "text-[11px] font-mono w-10 text-left",
                item.rsi > 70 ? "text-destructive" : item.rsi < 30 ? "text-success" : "text-muted-foreground"
              )}>
                {item.rsi}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Whale Watcher */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
            <Anchor className="w-3 h-3 text-accent" />
            Whale Watcher
          </h3>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">LIVE</span>
        </div>
        <div className="glass rounded-lg divide-y divide-border/20">
          {whaleActivity.map((whale, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5">
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
                  <p className="text-[11px] font-mono font-medium">{whale.amount}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{whale.exchange} · {whale.time}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium">{whale.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Journey Progress */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono">Performance Streak</h3>
          <span className="text-[10px] text-primary font-mono">65%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          3 days to weekly target · <span className="text-success">+$850</span> realized
        </p>
      </motion.div>

      {/* Community Pulse */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">
            <span className="font-bold text-foreground">12,453</span> traders online
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

      {/* Daily Quests */}
      <motion.div variants={fadeUp} className="glass rounded-lg p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
          Daily Objectives
          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono">2/3</span>
        </h3>
        <div className="space-y-1.5">
          {[
            { label: "Execute 1 trade", done: true },
            { label: "Complete 1 academy module", done: true },
            { label: "Share analysis with community", done: false },
          ].map((q, i) => (
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
              <span className={cn("text-xs font-mono", q.done && "line-through text-muted-foreground")}>{q.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
