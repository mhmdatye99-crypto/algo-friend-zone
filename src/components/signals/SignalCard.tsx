import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Signal {
  pair: string;
  direction: string;
  icon?: string;
  confidence: number;
  entry: string;
  target1: string;
  target2: string;
  sl: string;
  rr: string;
  timeFrame: string;
  alphaScore: number;
  rsi: number;
  rsiSignal: string;
  macd: string;
  macdHist: string;
  bbPosition: string;
  volume: string;
  sentiment: number;
  liquidity: string;
  convergence: number;
  reasons: string[];
  risk: string;
  category?: string;
}

interface Props {
  signal: Signal;
}

const SignalCard = ({ signal }: Props) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      className={cn(
        "glass rounded-xl p-3 border transition-all duration-300",
        signal.alphaScore >= 90 ? "border-primary/15" : "border-border/8"
      )}
    >
      {/* Header: One-Glance Summary */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {signal.icon && (
            <span className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-sm border border-border/15">{signal.icon}</span>
          )}
          <span className="font-mono font-bold text-sm">{signal.pair}</span>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{signal.timeFrame}</span>
          {signal.alphaScore >= 90 && (
            <span className="text-[8px] bg-primary/12 text-primary px-1.5 py-0.5 rounded font-mono font-bold">α+</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[10px] font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1",
              signal.direction === "صعودي"
                ? "bg-success/8 text-success"
                : "bg-destructive/8 text-destructive"
            )}
          >
            {signal.direction === "صعودي" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {signal.direction}
          </span>
          <span className={cn(
            "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
            signal.confidence >= 85 ? "text-success" : signal.confidence >= 70 ? "text-primary" : "text-warning"
          )}>
            {signal.confidence}%
          </span>
        </div>
      </div>

      {/* Technical Confluence Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        <span className={cn(
          "text-[8px] font-mono px-1.5 py-0.5 rounded border",
          signal.rsi > 70 ? "bg-destructive/8 text-destructive border-destructive/15" :
          signal.rsi < 30 ? "bg-success/8 text-success border-success/15" :
          "bg-secondary/60 text-muted-foreground border-border/15"
        )}>
          RSI {signal.rsi} — {signal.rsiSignal}
        </span>
        <span className={cn(
          "text-[8px] font-mono px-1.5 py-0.5 rounded border",
          signal.macd === "صعودي" ? "bg-success/8 text-success border-success/15" :
          signal.macd === "هبوطي" ? "bg-destructive/8 text-destructive border-destructive/15" :
          "bg-secondary/60 text-muted-foreground border-border/15"
        )}>
          MACD {signal.macd}
        </span>
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/15">
          BB {signal.bbPosition}
        </span>
        <span className={cn(
          "text-[8px] font-mono px-1.5 py-0.5 rounded border",
          signal.convergence >= 4 ? "bg-success/8 text-success border-success/15" :
          signal.convergence >= 3 ? "bg-primary/8 text-primary border-primary/15" :
          "bg-warning/8 text-warning border-warning/15"
        )}>
          تقارب {signal.convergence}/5
        </span>
        {signal.reasons.slice(0, 2).map((r, i) => (
          <span key={i} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground border border-border/10">
            {r}
          </span>
        ))}
      </div>

      {/* Price Levels - Compact Grid */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        <div className="bg-secondary/20 rounded-md px-1.5 py-1 text-center">
          <p className="text-[7px] font-mono text-muted-foreground">دخول</p>
          <p className="text-[10px] font-mono font-semibold tabular-nums">{signal.entry}</p>
        </div>
        <div className="bg-success/5 rounded-md px-1.5 py-1 text-center">
          <p className="text-[7px] font-mono text-muted-foreground">TP1</p>
          <p className="text-[10px] font-mono font-semibold text-success tabular-nums">{signal.target1}</p>
        </div>
        <div className="bg-success/5 rounded-md px-1.5 py-1 text-center">
          <p className="text-[7px] font-mono text-muted-foreground">TP2</p>
          <p className="text-[10px] font-mono font-semibold text-success tabular-nums">{signal.target2}</p>
        </div>
        <div className="bg-destructive/5 rounded-md px-1.5 py-1 text-center">
          <p className="text-[7px] font-mono text-muted-foreground">SL</p>
          <p className="text-[10px] font-mono font-semibold text-destructive tabular-nums">{signal.sl}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono">
          <span>R:R {signal.rr}</span>
          <span className={cn(
            signal.risk === "منخفض" ? "text-success" : signal.risk === "متوسط" ? "text-warning" : "text-destructive"
          )}>
            {signal.risk}
          </span>
        </div>
        <button className="text-[9px] font-mono font-bold bg-secondary/40 text-foreground/80 px-2.5 py-1 rounded-md hover:bg-secondary/60 transition-colors flex items-center gap-1 border border-border/15">
          <Eye className="w-3 h-3" />
          التفاصيل
        </button>
      </div>
    </motion.div>
  );
};

export default SignalCard;
