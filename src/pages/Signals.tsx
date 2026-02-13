import { motion } from "framer-motion";
import { Filter, Clock, TrendingUp, TrendingDown, Star, Activity, Waves, AlertTriangle, Eye, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const filters = ["الكل", "فوركس", "كريبتو", "أسهم", "سلع"];

const signals = [
  {
    pair: "BTC/USDT", direction: "صعودي", confidence: 87, entry: "67,450", target1: "68,500", target2: "69,200", sl: "67,100", rr: "1:3.2",
    timeFrame: "4H", alphaScore: 92, rsi: 62, rsiSignal: "محايد", macd: "صعودي", macdHist: "+12.4", bbPosition: "نطاق علوي", volume: "+45%",
    sentiment: 78, liquidity: "+$2.4M", convergence: 4,
    reasons: ["اختراق مقاومة رئيسية", "تقاطع MACD إيجابي", "RSI غير مشبع شرائياً", "حجم تداول فوق المتوسط"],
    risk: "متوسط",
  },
  {
    pair: "EUR/USD", direction: "هبوطي", confidence: 82, entry: "1.0845", target1: "1.0790", target2: "1.0750", sl: "1.0875", rr: "1:2.5",
    timeFrame: "1H", alphaScore: 78, rsi: 44, rsiSignal: "محايد", macd: "هبوطي", macdHist: "-8.2", bbPosition: "نطاق سفلي", volume: "+22%",
    sentiment: 32, liquidity: "-$890K", convergence: 3,
    reasons: ["كسر دعم أفقي", "تباين سلبي على MACD", "تدفق معنويات سلبية"],
    risk: "منخفض",
  },
  {
    pair: "GOLD", direction: "صعودي", confidence: 91, entry: "2,345", target1: "2,380", target2: "2,410", sl: "2,330", rr: "1:2.3",
    timeFrame: "D1", alphaScore: 95, rsi: 67, rsiSignal: "قريب من التشبع", macd: "صعودي", macdHist: "+5.8", bbPosition: "وسط", volume: "+38%",
    sentiment: 85, liquidity: "+$1.8M", convergence: 5,
    reasons: ["مثلث صاعد مكتمل", "ضعف مؤشر الدولار DXY", "طلب مؤسسي متزايد", "تقارب 5 مؤشرات"],
    risk: "منخفض",
  },
  {
    pair: "SOL/USDT", direction: "صعودي", confidence: 74, entry: "148.32", target1: "155.00", target2: "160.00", sl: "145.50", rr: "1:2.4",
    timeFrame: "4H", alphaScore: 68, rsi: 55, rsiSignal: "محايد", macd: "محايد", macdHist: "+1.2", bbPosition: "وسط", volume: "+15%",
    sentiment: 61, liquidity: "+$420K", convergence: 2,
    reasons: ["ارتداد من فيبوناتشي 61.8%", "نمط قاع مزدوج"],
    risk: "مرتفع",
  },
];

const Signals = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">محرك التحليل التنبؤي</p>
          <h1 className="text-lg font-bold">إشارات ألفا التنبؤية</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            مباشر · 30 ثانية
          </span>
          <button className="w-8 h-8 rounded-lg glass flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* تحذير */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-secondary/40 border border-border/10 mb-3">
        <AlertTriangle className="w-3 h-3 text-muted-foreground shrink-0" />
        <p className="text-[8px] text-muted-foreground font-mono">توصيات تحليلية فقط — وليست أوامر تنفيذ</p>
      </div>

      {/* الفلاتر */}
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

      {/* بطاقات الإشارات */}
      <motion.div
        className="space-y-3"
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
              signal.alphaScore >= 90 ? "border-primary/20" : "border-border/10"
            )}
          >
            {/* رأس البطاقة */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {signal.alphaScore >= 90 && (
                  <span className="text-[7px] bg-primary/15 text-primary px-1 py-0.5 rounded font-mono font-bold tracking-wider">ألفا+</span>
                )}
                <span className="font-mono font-bold text-sm">{signal.pair}</span>
                <span className="text-[8px] font-mono text-muted-foreground bg-secondary px-1 py-0.5 rounded">{signal.timeFrame}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1",
                    signal.direction === "صعودي"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {signal.direction === "صعودي" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {signal.direction}
                </span>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* درجة ألفا والثقة */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 flex-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      signal.confidence >= 85 ? "bg-success" : signal.confidence >= 70 ? "bg-primary" : "bg-warning"
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

            {/* التقارب الفني */}
            <div className="mb-2">
              <div className="flex items-center gap-1 mb-1.5">
                <Radar className="w-3 h-3 text-accent" />
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">التقارب الفني</span>
                <span className={cn(
                  "text-[8px] font-mono px-1 py-0.5 rounded",
                  signal.convergence >= 4 ? "bg-success/10 text-success" : signal.convergence >= 3 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                )}>
                  {signal.convergence}/5 مؤشرات
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <div className="bg-secondary/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[7px] font-mono text-muted-foreground">RSI</p>
                  <p className={cn(
                    "text-[11px] font-mono font-bold",
                    signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-success" : "text-foreground"
                  )}>{signal.rsi}</p>
                  <p className="text-[7px] font-mono text-muted-foreground">{signal.rsiSignal}</p>
                </div>
                <div className="bg-secondary/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[7px] font-mono text-muted-foreground">MACD</p>
                  <p className={cn(
                    "text-[11px] font-mono font-bold",
                    signal.macd === "صعودي" ? "text-success" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
                  )}>{signal.macdHist}</p>
                  <p className={cn("text-[7px] font-mono", signal.macd === "صعودي" ? "text-success" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground")}>{signal.macd}</p>
                </div>
                <div className="bg-secondary/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[7px] font-mono text-muted-foreground">BB</p>
                  <p className="text-[11px] font-mono font-bold">{signal.bbPosition.replace("نطاق ", "")}</p>
                  <p className="text-[7px] font-mono text-muted-foreground">{signal.bbPosition.includes("علوي") ? "↑" : signal.bbPosition.includes("سفلي") ? "↓" : "—"}</p>
                </div>
                <div className="bg-secondary/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[7px] font-mono text-muted-foreground">الحجم</p>
                  <p className="text-[11px] font-mono font-bold text-foreground">{signal.volume}</p>
                  <p className="text-[7px] font-mono text-muted-foreground">vs المتوسط</p>
                </div>
              </div>
            </div>

            {/* المعنويات والسيولة */}
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 bg-secondary/30 rounded px-2 py-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono text-muted-foreground flex items-center gap-0.5">
                    <Waves className="w-2.5 h-2.5" /> المعنويات
                  </span>
                  <span className="text-[9px] font-mono">{signal.sentiment}%</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-l from-success via-warning to-destructive" style={{ width: `${signal.sentiment}%` }} />
                </div>
              </div>
              <div className="flex-shrink-0 bg-secondary/30 rounded px-2 py-1.5 flex flex-col justify-center">
                <span className="text-[8px] font-mono text-muted-foreground flex items-center gap-0.5">
                  <Activity className="w-2.5 h-2.5" /> السيولة
                </span>
                <span className={cn(
                  "text-[11px] font-mono font-bold",
                  signal.liquidity.startsWith("+") ? "text-success" : "text-destructive"
                )}>{signal.liquidity}</span>
              </div>
              <div className="flex-shrink-0 bg-secondary/30 rounded px-2 py-1.5 flex flex-col justify-center">
                <span className="text-[8px] font-mono text-muted-foreground">المخاطرة</span>
                <span className={cn(
                  "text-[11px] font-mono font-bold",
                  signal.risk === "منخفض" ? "text-success" : signal.risk === "متوسط" ? "text-warning" : "text-destructive"
                )}>{signal.risk}</span>
              </div>
            </div>

            {/* مستويات السعر */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              <div className="bg-secondary/30 rounded px-1.5 py-1 text-center">
                <p className="text-[7px] font-mono text-muted-foreground">الدخول المقترح</p>
                <p className="text-[11px] font-mono font-semibold">{signal.entry}</p>
              </div>
              <div className="bg-success/5 rounded px-1.5 py-1 text-center">
                <p className="text-[7px] font-mono text-muted-foreground">هدف 1</p>
                <p className="text-[11px] font-mono font-semibold text-success">{signal.target1}</p>
              </div>
              <div className="bg-success/5 rounded px-1.5 py-1 text-center">
                <p className="text-[7px] font-mono text-muted-foreground">هدف 2</p>
                <p className="text-[11px] font-mono font-semibold text-success">{signal.target2}</p>
              </div>
              <div className="bg-destructive/5 rounded px-1.5 py-1 text-center">
                <p className="text-[7px] font-mono text-muted-foreground">وقف الخسارة</p>
                <p className="text-[11px] font-mono font-semibold text-destructive">{signal.sl}</p>
              </div>
            </div>

            {/* الأسباب */}
            <div className="flex flex-wrap gap-1 mb-2">
              {signal.reasons.map((r, ri) => (
                <span key={ri} className="text-[8px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                  {r}
                </span>
              ))}
            </div>

            {/* التذييل */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono">
                <span>R:R {signal.rr}</span>
              </div>
              <button
                className="text-[10px] font-mono font-bold bg-secondary text-foreground px-3 py-1 rounded hover:bg-secondary/80 transition-colors flex items-center gap-1 border border-border/20"
              >
                <Eye className="w-3 h-3" />
                عرض خطة المعركة
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Signals;
