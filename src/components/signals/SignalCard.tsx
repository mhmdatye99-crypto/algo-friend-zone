import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronLeft, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
  winProbability?: number;
}

interface Props {
  signal: Signal;
}

const SignalCard = ({ signal }: Props) => {
  const [showCalc, setShowCalc] = useState(false);
  const [capital, setCapital] = useState(1000);
  const [riskPct, setRiskPct] = useState(2);

  const entry = parseFloat(signal.entry.replace(/,/g, "")) || 0;
  const tp1 = parseFloat(signal.target1.replace(/,/g, "")) || 0;
  const tp2 = parseFloat(signal.target2.replace(/,/g, "")) || 0;
  const sl = parseFloat(signal.sl.replace(/,/g, "")) || 0;

  const totalRange = Math.abs(tp2 - sl) || 1;
  const entryFromSL = Math.abs(entry - sl);
  const tp1FromSL = Math.abs(tp1 - sl);
  const tp1Progress = Math.min(100, Math.round((tp1FromSL / totalRange) * 100));
  const entryProgress = Math.min(100, Math.round((entryFromSL / totalRange) * 100));

  const isBullish = signal.direction === "صعودي";

  // Portfolio Impact Calculator
  const riskPerUnit = Math.abs(entry - sl);
  const riskAmount = capital * (riskPct / 100);
  const lotSize = riskPerUnit > 0 ? parseFloat((riskAmount / riskPerUnit).toFixed(4)) : 0;
  const potentialProfit = lotSize * Math.abs(tp1 - entry);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border/20 bg-card/60 p-3 hover-lift"
    >
      {/* Row 1: Pair + Direction + R:R */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {signal.icon && (
            <span className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-sm">{signal.icon}</span>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-mono font-bold">{signal.pair}</span>
              <span className="text-[8px] font-mono text-muted-foreground">{signal.timeFrame}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1",
            isBullish ? "bg-success/8 text-success" : "bg-destructive/8 text-destructive"
          )}>
            {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isBullish ? "LONG" : "SHORT"}
          </span>
          <span className="text-[9px] font-mono font-bold bg-primary/8 text-primary px-1.5 py-0.5 rounded-sm">
            R:R {signal.rr}
          </span>
          <span className={cn(
            "text-[10px] font-mono font-bold",
            signal.confidence >= 85 ? "text-success" : signal.confidence >= 70 ? "text-primary" : "text-warning"
          )}>
            {signal.confidence}%
          </span>
        </div>
      </div>

      {/* Row 2: Entry + TP Progress Bar */}
      <div className="mb-2.5">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[16px] font-mono font-bold tabular-nums">{signal.entry}</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-muted/40 overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-destructive/20 rounded-l-full" style={{ width: `${Math.max(5, 100 - tp1Progress)}%` }} />
          <div className="absolute right-0 top-0 h-full bg-success/15 rounded-r-full" style={{ width: `${tp1Progress}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-primary" style={{ right: `${entryProgress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1 text-[8px] font-mono text-muted-foreground">
          <span className="text-destructive">SL {signal.sl}</span>
          <div className="flex gap-2">
            <span className="text-success/70">TP1 {signal.target1}</span>
            <span className="text-success">TP2 {signal.target2}</span>
          </div>
        </div>
      </div>

      {/* Row 3: X-Insight Badges + Portfolio Impact Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          <span className={cn(
            "text-[7px] font-mono px-1.5 py-0.5 rounded-sm border",
            signal.convergence >= 4 ? "bg-success/6 text-success border-success/10" :
            signal.convergence >= 3 ? "bg-primary/6 text-primary border-primary/10" :
            "bg-muted/40 text-muted-foreground border-border/10"
          )}>
            تقارب {signal.convergence}/5
          </span>
          <span className={cn(
            "text-[7px] font-mono px-1.5 py-0.5 rounded-sm border",
            signal.rsi > 70 ? "bg-destructive/6 text-destructive border-destructive/10" :
            signal.rsi < 30 ? "bg-success/6 text-success border-success/10" :
            "bg-muted/40 text-muted-foreground border-border/10"
          )}>
            RSI {signal.rsi}
          </span>
          {signal.alphaScore >= 90 && (
            <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-sm bg-primary/8 text-primary border border-primary/10">
              α+
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowCalc(!showCalc); }}
            className="text-[8px] font-mono text-primary/60 flex items-center gap-0.5 hover:text-primary transition-colors px-1.5 py-0.5 rounded-sm hover:bg-primary/5"
          >
            <Calculator className="w-3 h-3" /> الحجم
          </button>
          <button className="text-[8px] font-mono text-muted-foreground flex items-center gap-0.5 hover:text-primary transition-colors">
            التفاصيل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Portfolio Impact Calculator (expandable) */}
      {showCalc && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="mt-2.5 pt-2.5 border-t border-border/10 space-y-2"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Calculator className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] font-mono font-semibold text-primary/70">حاسبة تأثير المحفظة</span>
          </div>
          <div className="flex gap-1">
            {[500, 1000, 5000, 10000].map(c => (
              <button key={c} onClick={() => setCapital(c)}
                className={cn("px-2 py-1 rounded-sm text-[8px] font-mono transition-colors",
                  capital === c ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground/50"
                )}>
                ${c.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-muted-foreground/50">المخاطرة: {riskPct}%</span>
            <input type="range" min={0.5} max={5} step={0.5} value={riskPct}
              onChange={e => setRiskPct(parseFloat(e.target.value))}
              className="w-24 h-1 accent-primary" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-muted/20 rounded-sm px-2 py-1.5 text-center">
              <p className="text-[7px] font-mono text-muted-foreground/40">حجم اللوت</p>
              <p className="text-[10px] font-mono font-bold text-primary">{lotSize}</p>
            </div>
            <div className="bg-muted/20 rounded-sm px-2 py-1.5 text-center">
              <p className="text-[7px] font-mono text-muted-foreground/40">مخاطرة</p>
              <p className="text-[10px] font-mono font-bold text-destructive">${riskAmount.toFixed(0)}</p>
            </div>
            <div className="bg-muted/20 rounded-sm px-2 py-1.5 text-center">
              <p className="text-[7px] font-mono text-muted-foreground/40">ربح TP1</p>
              <p className="text-[10px] font-mono font-bold text-success">${potentialProfit.toFixed(0)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SignalCard;
