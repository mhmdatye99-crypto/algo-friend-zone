import { motion } from "framer-motion";
import { Filter, Clock, TrendingUp, TrendingDown, Star, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const filters = ["الكل", "فوركس", "كريبتو", "أسهم", "سلع"];

const signals = [
  {
    pair: "BTC/USDT",
    action: "شراء",
    confidence: 87,
    entry: "67,450",
    target: "68,500",
    sl: "67,100",
    rr: "1:3.2",
    timeLeft: "04:32",
    executors: 24,
    isVip: true,
    reasons: ["اختراق المقاومة", "حجم تداول مرتفع +45%", "RSI عند 62"],
  },
  {
    pair: "EUR/USD",
    action: "بيع",
    confidence: 82,
    entry: "1.0845",
    target: "1.0790",
    sl: "1.0875",
    rr: "1:2.5",
    timeLeft: "12:15",
    executors: 18,
    isVip: false,
    reasons: ["كسر الدعم", "MACD سلبي", "مشاعر سوق هابطة"],
  },
  {
    pair: "GOLD",
    action: "شراء",
    confidence: 91,
    entry: "2,345",
    target: "2,380",
    sl: "2,330",
    rr: "1:2.3",
    timeLeft: "02:45",
    executors: 31,
    isVip: true,
    reasons: ["نمط المثلث الصاعد", "ضعف الدولار", "طلب متزايد"],
  },
  {
    pair: "SOL/USDT",
    action: "شراء",
    confidence: 74,
    entry: "148.32",
    target: "155.00",
    sl: "145.50",
    rr: "1:2.4",
    timeLeft: "18:00",
    executors: 12,
    isVip: false,
    reasons: ["اختراق مستوى فيبوناتشي", "نمط القاع المزدوج"],
  },
];

const Signals = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">توصيات AI</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            تحديث مباشر · منذ 30 ثانية
          </p>
        </div>
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300",
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Signal Cards */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {signals.map((signal, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className={cn(
              "glass rounded-2xl p-4 border transition-all duration-300",
              signal.isVip ? "border-primary/30 glow-gold" : "border-border/20"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {signal.isVip && (
                  <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">VIP</span>
                )}
                <span className="font-mono font-bold text-base">{signal.pair}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1",
                    signal.action === "شراء"
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  )}
                >
                  {signal.action === "شراء" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {signal.action}
                </span>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    signal.confidence >= 85
                      ? "bg-gradient-to-r from-success to-emerald-400"
                      : signal.confidence >= 70
                      ? "bg-gradient-to-r from-primary to-yellow-400"
                      : "bg-gradient-to-r from-warning to-orange-400"
                  )}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-primary">{signal.confidence}%</span>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-secondary/50 rounded-lg p-2 text-center">
                <p className="text-[9px] text-muted-foreground">الدخول</p>
                <p className="text-xs font-mono font-semibold">{signal.entry}</p>
              </div>
              <div className="bg-success/10 rounded-lg p-2 text-center">
                <p className="text-[9px] text-muted-foreground">الهدف</p>
                <p className="text-xs font-mono font-semibold text-success">{signal.target}</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-2 text-center">
                <p className="text-[9px] text-muted-foreground">وقف الخسارة</p>
                <p className="text-xs font-mono font-semibold text-destructive">{signal.sl}</p>
              </div>
            </div>

            {/* Reasons */}
            <div className="flex flex-wrap gap-1 mb-3">
              {signal.reasons.map((r, ri) => (
                <span key={ri} className="text-[9px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                  {r}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {signal.timeLeft}
                </span>
                <span>R:R {signal.rr}</span>
                <span>{signal.executors} نفذوا</span>
              </div>
              <button className="text-xs font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                تنفيذ
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Signals;
