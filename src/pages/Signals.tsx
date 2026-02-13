import { motion } from "framer-motion";
import { Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SignalCard from "@/components/signals/SignalCard";

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
  {
    pair: "GBP/USD", direction: "صعودي", confidence: 79, entry: "1.2634", target1: "1.2710", target2: "1.2780", sl: "1.2580", rr: "1:2.7",
    timeFrame: "4H", alphaScore: 75, rsi: 52, rsiSignal: "محايد", macd: "صعودي", macdHist: "+3.1", bbPosition: "وسط", volume: "+18%",
    sentiment: 64, liquidity: "+$560K", convergence: 3,
    reasons: ["ارتداد من خط اتجاه صاعد", "تقاطع MA50 فوق MA200", "زخم إيجابي متزايد"],
    risk: "متوسط",
  },
  {
    pair: "USD/JPY", direction: "هبوطي", confidence: 76, entry: "154.82", target1: "153.80", target2: "153.00", sl: "155.50", rr: "1:2.7",
    timeFrame: "1H", alphaScore: 72, rsi: 71, rsiSignal: "تشبع شرائي", macd: "هبوطي", macdHist: "-4.5", bbPosition: "نطاق علوي", volume: "+12%",
    sentiment: 38, liquidity: "-$340K", convergence: 3,
    reasons: ["تشبع شرائي واضح على RSI", "تباين سلبي على الزخم", "مقاومة نفسية عند 155"],
    risk: "متوسط",
  },
  {
    pair: "ETH/USDT", direction: "صعودي", confidence: 84, entry: "3,245", target1: "3,400", target2: "3,520", sl: "3,150", rr: "1:2.9",
    timeFrame: "D1", alphaScore: 82, rsi: 58, rsiSignal: "محايد", macd: "صعودي", macdHist: "+8.7", bbPosition: "وسط", volume: "+32%",
    sentiment: 72, liquidity: "+$1.2M", convergence: 4,
    reasons: ["اختراق مثلث متماثل", "تزايد حجم التداول", "تدفقات مؤسسية إيجابية", "دعم قوي عند 3,100"],
    risk: "منخفض",
  },
  {
    pair: "SILVER", direction: "صعودي", confidence: 81, entry: "27.84", target1: "28.50", target2: "29.20", sl: "27.30", rr: "1:2.5",
    timeFrame: "4H", alphaScore: 77, rsi: 59, rsiSignal: "محايد", macd: "صعودي", macdHist: "+2.3", bbPosition: "نطاق علوي", volume: "+25%",
    sentiment: 69, liquidity: "+$280K", convergence: 3,
    reasons: ["تبعية إيجابية للذهب", "طلب صناعي متزايد", "كسر مقاومة 27.50"],
    risk: "متوسط",
  },
];

const Signals = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");

  return (
    <div className="px-4 pt-10 pb-28 max-w-lg mx-auto">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">محرك التحليل التنبؤي</p>
          <h1 className="text-xl font-bold">إشارات ألفا التنبؤية</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            مباشر · 30 ثانية
          </span>
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* تحذير */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/40 border border-border/10 mb-4">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-[10px] text-muted-foreground font-mono">توصيات تحليلية فقط — وليست أوامر تنفيذ</p>
      </div>

      {/* الفلاتر */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all duration-300",
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
        className="space-y-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {signals.map((signal, i) => (
          <SignalCard key={i} signal={signal} />
        ))}
      </motion.div>
    </div>
  );
};

export default Signals;
