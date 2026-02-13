import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Star, Activity, Waves, Eye, Radar } from "lucide-react";
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
}

interface Props {
  signal: Signal;
}

const SignalCard = ({ signal }: Props) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className={cn(
        "glass rounded-xl p-4 border transition-all duration-300",
        signal.alphaScore >= 90 ? "border-primary/20" : "border-border/10"
      )}
    >
      {/* رأس البطاقة */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {signal.alphaScore >= 90 && (
            <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-mono font-bold tracking-wider">ألفا+</span>
          )}
          {signal.icon && (
            <span className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-sm border border-border/20">{signal.icon}</span>
          )}
          <span className="font-mono font-bold text-base">{signal.pair}</span>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{signal.timeFrame}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg flex items-center gap-1",
              signal.direction === "صعودي"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {signal.direction === "صعودي" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {signal.direction}
          </span>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* درجة ألفا والثقة */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                signal.confidence >= 85 ? "bg-success" : signal.confidence >= 70 ? "bg-primary" : "bg-warning"
              )}
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-primary">{signal.confidence}%</span>
        </div>
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
          α{signal.alphaScore}
        </span>
      </div>

      {/* التقارب الفني */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Radar className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">التقارب الفني</span>
          <span className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded-md",
            signal.convergence >= 4 ? "bg-success/10 text-success" : signal.convergence >= 3 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
          )}>
            {signal.convergence}/5 مؤشرات
          </span>
        </div>
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
            <p className={cn("text-[10px] font-mono", signal.macd === "صعودي" ? "text-success" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground")}>{signal.macd}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground">BB</p>
            <p className="text-[13px] font-mono font-bold">{signal.bbPosition.replace("نطاق ", "")}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{signal.bbPosition.includes("علوي") ? "↑" : signal.bbPosition.includes("سفلي") ? "↓" : "—"}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground">الحجم</p>
            <p className="text-[13px] font-mono font-bold text-foreground">{signal.volume}</p>
            <p className="text-[10px] font-mono text-muted-foreground">vs المتوسط</p>
          </div>
        </div>
      </div>

      {/* المعنويات والسيولة */}
      <div className="flex gap-2 mb-3">
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
        <div className="flex-shrink-0 bg-secondary/30 rounded-lg px-3 py-2 flex flex-col justify-center">
          <span className="text-[10px] font-mono text-muted-foreground">المخاطرة</span>
          <span className={cn(
            "text-[12px] font-mono font-bold",
            signal.risk === "منخفض" ? "text-success" : signal.risk === "متوسط" ? "text-warning" : "text-destructive"
          )}>{signal.risk}</span>
        </div>
      </div>

      {/* مستويات السعر */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <div className="bg-secondary/30 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[10px] font-mono text-muted-foreground">الدخول المقترح</p>
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

      {/* الأسباب */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {signal.reasons.map((r, ri) => (
          <span key={ri} className="text-[10px] font-mono bg-secondary px-2 py-1 rounded-md text-muted-foreground">
            {r}
          </span>
        ))}
      </div>

      {/* التذييل */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span>R:R {signal.rr}</span>
        </div>
        <button
          className="text-[11px] font-mono font-bold bg-secondary text-foreground px-4 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1.5 border border-border/20"
        >
          <Eye className="w-3.5 h-3.5" />
          عرض خطة المعركة
        </button>
      </div>
    </motion.div>
  );
};

export default SignalCard;
