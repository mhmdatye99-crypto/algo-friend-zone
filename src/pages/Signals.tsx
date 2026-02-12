import { motion } from "framer-motion";
import { Filter, Clock, TrendingUp, TrendingDown, Star, Activity, BarChart3, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const filters = ["All", "Forex", "Crypto", "Equities", "Commodities"];

const signals = [
  {
    pair: "BTC/USDT",
    action: "LONG",
    confidence: 87,
    entry: "67,450",
    target: "68,500",
    sl: "67,100",
    rr: "1:3.2",
    timeLeft: "04:32",
    executors: 24,
    isVip: true,
    alphaScore: 92,
    rsi: 62,
    macd: "Bullish",
    bbPosition: "Upper",
    sentiment: 78,
    liquidity: "+$2.4M",
    reasons: ["Resistance breakout", "Volume surge +45%", "RSI non-overbought"],
  },
  {
    pair: "EUR/USD",
    action: "SHORT",
    confidence: 82,
    entry: "1.0845",
    target: "1.0790",
    sl: "1.0875",
    rr: "1:2.5",
    timeLeft: "12:15",
    executors: 18,
    isVip: false,
    alphaScore: 78,
    rsi: 44,
    macd: "Bearish",
    bbPosition: "Lower",
    sentiment: 32,
    liquidity: "-$890K",
    reasons: ["Support break", "MACD divergence", "Bearish sentiment flow"],
  },
  {
    pair: "GOLD",
    action: "LONG",
    confidence: 91,
    entry: "2,345",
    target: "2,380",
    sl: "2,330",
    rr: "1:2.3",
    timeLeft: "02:45",
    executors: 31,
    isVip: true,
    alphaScore: 95,
    rsi: 67,
    macd: "Bullish",
    bbPosition: "Mid",
    sentiment: 85,
    liquidity: "+$1.8M",
    reasons: ["Ascending triangle", "USD weakness", "Increasing demand"],
  },
  {
    pair: "SOL/USDT",
    action: "LONG",
    confidence: 74,
    entry: "148.32",
    target: "155.00",
    sl: "145.50",
    rr: "1:2.4",
    timeLeft: "18:00",
    executors: 12,
    isVip: false,
    alphaScore: 68,
    rsi: 55,
    macd: "Neutral",
    bbPosition: "Mid",
    sentiment: 61,
    liquidity: "+$420K",
    reasons: ["Fibonacci breakout", "Double bottom pattern"],
  },
];

const Signals = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">Signal Engine</p>
          <h1 className="text-lg font-bold">Predictive Alpha Signals</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            LIVE · 30s
          </span>
          <button className="w-8 h-8 rounded-lg glass flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-3 py-1 rounded text-[10px] font-mono font-medium whitespace-nowrap transition-all duration-300",
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Signal Cards */}
      <motion.div
        className="space-y-2.5"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        {signals.map((signal, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className={cn(
              "glass rounded-lg p-3 border transition-all duration-300",
              signal.isVip ? "border-primary/20" : "border-border/10"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {signal.isVip && (
                  <span className="text-[8px] bg-primary/15 text-primary px-1 py-0.5 rounded font-mono font-bold tracking-wider">ALPHA</span>
                )}
                <span className="font-mono font-bold text-sm">{signal.pair}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1",
                    signal.action === "LONG"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {signal.action === "LONG" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {signal.action}
                </span>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Alpha Score & Confidence */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 flex-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      signal.confidence >= 85
                        ? "bg-success"
                        : signal.confidence >= 70
                        ? "bg-primary"
                        : "bg-warning"
                    )}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-primary">{signal.confidence}%</span>
              </div>
              <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                α{signal.alphaScore}
              </span>
            </div>

            {/* Technical Convergence - Mini Indicators */}
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 bg-secondary/50 rounded px-2 py-1">
                <p className="text-[8px] font-mono text-muted-foreground">RSI</p>
                <p className={cn(
                  "text-[11px] font-mono font-bold",
                  signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-success" : "text-foreground"
                )}>{signal.rsi}</p>
              </div>
              <div className="flex-1 bg-secondary/50 rounded px-2 py-1">
                <p className="text-[8px] font-mono text-muted-foreground">MACD</p>
                <p className={cn(
                  "text-[11px] font-mono font-bold",
                  signal.macd === "Bullish" ? "text-success" : signal.macd === "Bearish" ? "text-destructive" : "text-muted-foreground"
                )}>{signal.macd}</p>
              </div>
              <div className="flex-1 bg-secondary/50 rounded px-2 py-1">
                <p className="text-[8px] font-mono text-muted-foreground">BB</p>
                <p className="text-[11px] font-mono font-bold">{signal.bbPosition}</p>
              </div>
            </div>

            {/* Sentiment Flow + Liquidity */}
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 bg-secondary/30 rounded px-2 py-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono text-muted-foreground flex items-center gap-0.5">
                    <Waves className="w-2.5 h-2.5" /> Sentiment
                  </span>
                  <span className="text-[9px] font-mono">{signal.sentiment}%</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-destructive via-warning to-success" style={{ width: `${signal.sentiment}%` }} />
                </div>
              </div>
              <div className="flex-shrink-0 bg-secondary/30 rounded px-2 py-1.5 flex flex-col justify-center">
                <span className="text-[8px] font-mono text-muted-foreground flex items-center gap-0.5">
                  <Activity className="w-2.5 h-2.5" /> Liquidity
                </span>
                <span className={cn(
                  "text-[11px] font-mono font-bold",
                  signal.liquidity.startsWith("+") ? "text-success" : "text-destructive"
                )}>{signal.liquidity}</span>
              </div>
            </div>

            {/* Price Levels */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="bg-secondary/30 rounded px-2 py-1.5 text-center">
                <p className="text-[8px] font-mono text-muted-foreground">ENTRY</p>
                <p className="text-[11px] font-mono font-semibold">{signal.entry}</p>
              </div>
              <div className="bg-success/5 rounded px-2 py-1.5 text-center">
                <p className="text-[8px] font-mono text-muted-foreground">TARGET</p>
                <p className="text-[11px] font-mono font-semibold text-success">{signal.target}</p>
              </div>
              <div className="bg-destructive/5 rounded px-2 py-1.5 text-center">
                <p className="text-[8px] font-mono text-muted-foreground">STOP</p>
                <p className="text-[11px] font-mono font-semibold text-destructive">{signal.sl}</p>
              </div>
            </div>

            {/* Reasons */}
            <div className="flex flex-wrap gap-1 mb-2">
              {signal.reasons.map((r, ri) => (
                <span key={ri} className="text-[8px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                  {r}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {signal.timeLeft}
                </span>
                <span>R:R {signal.rr}</span>
                <span>{signal.executors} executed</span>
              </div>
              <button className="text-[10px] font-mono font-bold bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">
                EXECUTE
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Signals;
