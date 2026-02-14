import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Star, Activity, Waves, Radar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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

const SignalCardCollapsible = ({ signal }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Calculate progress toward target
  const entryNum = parseFloat(signal.entry.replace(/,/g, ""));
  const t1Num = parseFloat(signal.target1.replace(/,/g, ""));
  const slNum = parseFloat(signal.sl.replace(/,/g, ""));
  const totalRange = Math.abs(t1Num - slNum);
  const currentProgress = totalRange > 0 ? Math.min(Math.abs(entryNum - slNum) / totalRange * 100, 100) : 50;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className={cn(
        "glass rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
        signal.alphaScore >= 90 ? "border-primary/25 glow-gold" : "border-border/10"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Collapsed Header — Always visible */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {signal.icon && (
            <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base border border-border/20">
              {signal.icon}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[14px]">{signal.pair}</span>
              {signal.alphaScore >= 90 && (
                <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-mono font-bold">ألفا+</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-muted-foreground">{signal.entry}</span>
              <span className="text-[9px] font-mono text-muted-foreground/60">•</span>
              <span className="text-[10px] font-mono text-muted-foreground">{signal.timeFrame}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence Score Badge */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-[13px] border",
                signal.confidence >= 85
                  ? "bg-success/10 text-success border-success/20"
                  : signal.confidence >= 70
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-warning/10 text-warning border-warning/20"
              )}
            >
              {signal.confidence}
            </div>
            <span className="text-[8px] font-mono text-muted-foreground mt-0.5">ثقة%</span>
          </div>

          <span
            className={cn(
              "text-[11px] font-bold font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-1",
              signal.direction === "صعودي"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {signal.direction === "صعودي" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {signal.direction}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Progress bar — SL to TP */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-1">
          <span className="text-destructive">SL {signal.sl}</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-destructive via-warning to-success"
              style={{ width: `${currentProgress}%` }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-foreground border-2 border-background shadow-lg"
              style={{ left: `${currentProgress}%` }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-success">TP {signal.target1}</span>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/10 pt-3">
              {/* Confidence + Alpha */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        signal.confidence >= 85 ? "bg-success" : signal.confidence >= 70 ? "bg-primary" : "bg-warning"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${signal.confidence}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-primary">{signal.confidence}%</span>
                </div>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">α{signal.alphaScore}</span>
              </div>

              {/* Technical Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">RSI</p>
                  <p className={cn(
                    "text-[13px] font-mono font-bold",
                    signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-success" : "text-foreground"
                  )}>{signal.rsi}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{signal.rsiSignal}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">MACD</p>
                  <p className={cn(
                    "text-[13px] font-mono font-bold",
                    signal.macd === "صعودي" ? "text-success" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
                  )}>{signal.macdHist}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">BB</p>
                  <p className="text-[13px] font-mono font-bold">{signal.bbPosition.replace("نطاق ", "")}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">الحجم</p>
                  <p className="text-[13px] font-mono font-bold">{signal.volume}</p>
                </div>
              </div>

              {/* Sentiment & Liquidity */}
              <div className="flex gap-2">
                <div className="flex-1 bg-secondary/30 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Waves className="w-3 h-3" /> المعنويات
                    </span>
                    <span className="text-[11px] font-mono">{signal.sentiment}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-success via-warning to-destructive" style={{ width: `${signal.sentiment}%` }} />
                  </div>
                </div>
                <div className="flex-shrink-0 bg-secondary/30 rounded-lg px-3 py-2 flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" /> السيولة
                  </span>
                  <span className={cn(
                    "text-[12px] font-mono font-bold",
                    signal.liquidity.startsWith("+") ? "text-success" : "text-destructive"
                  )}>{signal.liquidity}</span>
                </div>
              </div>

              {/* Price Levels */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="bg-secondary/30 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">الدخول</p>
                  <p className="text-[12px] font-mono font-semibold">{signal.entry}</p>
                </div>
                <div className="bg-success/5 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">هدف 1</p>
                  <p className="text-[12px] font-mono font-semibold text-success">{signal.target1}</p>
                </div>
                <div className="bg-success/5 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">هدف 2</p>
                  <p className="text-[12px] font-mono font-semibold text-success">{signal.target2}</p>
                </div>
                <div className="bg-destructive/5 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">وقف الخسارة</p>
                  <p className="text-[12px] font-mono font-semibold text-destructive">{signal.sl}</p>
                </div>
              </div>

              {/* Reasons */}
              <div className="flex flex-wrap gap-1.5">
                {signal.reasons.map((r, ri) => (
                  <span key={ri} className="text-[10px] font-mono bg-secondary px-2 py-1 rounded-md text-muted-foreground">
                    {r}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                  <span>R:R {signal.rr}</span>
                  <span className={cn(
                    signal.risk === "منخفض" ? "text-success" : signal.risk === "متوسط" ? "text-warning" : "text-destructive"
                  )}>مخاطرة: {signal.risk}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/asset/${encodeURIComponent(signal.pair)}`); }}
                  className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  تفاصيل الأصل
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SignalCardCollapsible;
