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
      className="nx-card hover-lift"
    >
      {/* Row 1: Pair + Direction + R:R */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {signal.icon && (
            <span className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-base">{signal.icon}</span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="nx-ltr font-mono font-bold text-[15px]">{signal.pair}</span>
              <span className="nx-meta">{signal.timeFrame}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(isBullish ? "nx-badge-long" : "nx-badge-short")}>
            {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isBullish ? "LONG" : "SHORT"}
          </span>
          <span className="nx-badge-gold nx-ltr">
            R:R {signal.rr}
          </span>
          <span className={cn(
            "font-mono font-bold text-[13px] nx-ltr",
            signal.confidence >= 85 ? "text-success" : signal.confidence >= 70 ? "text-primary" : "text-warning"
          )}>
            {signal.confidence}%
          </span>
        </div>
      </div>

      {/* Row 2: Entry + TP Progress Bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="nx-num-lg text-[22px] nx-ltr">{signal.entry}</span>
        </div>
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-destructive/25 rounded-l-full" style={{ width: `${Math.max(5, 100 - tp1Progress)}%` }} />
          <div className="absolute right-0 top-0 h-full bg-success/20 rounded-r-full" style={{ width: `${tp1Progress}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-primary" style={{ right: `${entryProgress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5 nx-meta nx-ltr">
          <span className="text-destructive">SL {signal.sl}</span>
          <div className="flex gap-3">
            <span className="text-success/70">TP1 {signal.target1}</span>
            <span className="text-success">TP2 {signal.target2}</span>
          </div>
        </div>
      </div>

      {/* Row 3: X-Insight Badges + Portfolio Impact Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "nx-badge",
            signal.convergence >= 4 ? "bg-success/10 text-success" :
            signal.convergence >= 3 ? "bg-primary/10 text-primary" :
            "bg-muted text-muted-foreground"
          )}>
            تقارب {signal.convergence}/5
          </span>
          <span className={cn(
            "nx-badge nx-ltr",
            signal.rsi > 70 ? "bg-destructive/10 text-destructive" :
            signal.rsi < 30 ? "bg-success/10 text-success" :
            "bg-muted text-muted-foreground"
          )}>
            RSI {signal.rsi}
          </span>
          {signal.alphaScore >= 90 && (
            <span className="nx-badge-gold">
              α+
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowCalc(!showCalc); }}
            className="nx-btn-ghost nx-btn-sm text-primary"
          >
            <Calculator className="w-3.5 h-3.5" /> الحجم
          </button>
          <button className="nx-btn-ghost nx-btn-sm">
            التفاصيل <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Portfolio Impact Calculator (expandable) */}
      {showCalc && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="mt-3 pt-3 border-t border-border space-y-2.5"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Calculator className="w-3.5 h-3.5 text-primary" />
            <span className="nx-label text-primary">حاسبة تأثير المحفظة</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[500, 1000, 5000, 10000].map(c => (
              <button key={c} onClick={() => setCapital(c)}
                className={cn("px-3 h-9 rounded-lg text-[13px] font-mono nx-ltr transition-colors",
                  capital === c ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                ${c.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="nx-meta">المخاطرة: {riskPct}%</span>
            <input type="range" min={0.5} max={5} step={0.5} value={riskPct}
              onChange={e => setRiskPct(parseFloat(e.target.value))}
              className="w-28 h-2 accent-primary" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted rounded-xl px-2 py-2 text-center">
              <p className="nx-label text-[12px]">حجم اللوت</p>
              <p className="font-mono font-bold text-primary nx-ltr">{lotSize}</p>
            </div>
            <div className="bg-muted rounded-xl px-2 py-2 text-center">
              <p className="nx-label text-[12px]">مخاطرة</p>
              <p className="font-mono font-bold text-destructive nx-ltr">${riskAmount.toFixed(0)}</p>
            </div>
            <div className="bg-muted rounded-xl px-2 py-2 text-center">
              <p className="nx-label text-[12px]">ربح TP1</p>
              <p className="font-mono font-bold text-success nx-ltr">${potentialProfit.toFixed(0)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SignalCard;
