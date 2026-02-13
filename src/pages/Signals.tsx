import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SignalCard from "@/components/signals/SignalCard";

const filters = ["الكل", "فوركس", "كريبتو", "سلع", "مؤشرات"];

const signals = [
  {
    pair: "BTC/USDT", direction: "صعودي", confidence: 87, entry: "67,450", target1: "68,500", target2: "69,200", sl: "67,100", rr: "1:3.2",
    timeFrame: "4H", alphaScore: 92, rsi: 62, rsiSignal: "محايد", macd: "صعودي", macdHist: "+12.4", bbPosition: "نطاق علوي", volume: "+45%",
    sentiment: 78, liquidity: "+$2.4M", convergence: 4,
    reasons: ["اختراق مقاومة رئيسية", "تقاطع MACD إيجابي", "RSI غير مشبع شرائياً", "حجم تداول فوق المتوسط"],
    risk: "متوسط", icon: "₿",
  },
  {
    pair: "ETH/USDT", direction: "صعودي", confidence: 84, entry: "3,245", target1: "3,400", target2: "3,520", sl: "3,150", rr: "1:2.9",
    timeFrame: "D1", alphaScore: 82, rsi: 58, rsiSignal: "محايد", macd: "صعودي", macdHist: "+8.7", bbPosition: "وسط", volume: "+32%",
    sentiment: 72, liquidity: "+$1.2M", convergence: 4,
    reasons: ["اختراق مثلث متماثل", "تزايد حجم التداول", "تدفقات مؤسسية إيجابية", "دعم قوي عند 3,100"],
    risk: "منخفض", icon: "Ξ",
  },
  {
    pair: "EUR/USD", direction: "هبوطي", confidence: 82, entry: "1.0845", target1: "1.0790", target2: "1.0750", sl: "1.0875", rr: "1:2.5",
    timeFrame: "1H", alphaScore: 78, rsi: 44, rsiSignal: "محايد", macd: "هبوطي", macdHist: "-8.2", bbPosition: "نطاق سفلي", volume: "+22%",
    sentiment: 32, liquidity: "-$890K", convergence: 3,
    reasons: ["كسر دعم أفقي", "تباين سلبي على MACD", "تدفق معنويات سلبية"],
    risk: "منخفض", icon: "€",
  },
  {
    pair: "GOLD", direction: "صعودي", confidence: 91, entry: "2,345", target1: "2,380", target2: "2,410", sl: "2,330", rr: "1:2.3",
    timeFrame: "D1", alphaScore: 95, rsi: 67, rsiSignal: "قريب من التشبع", macd: "صعودي", macdHist: "+5.8", bbPosition: "وسط", volume: "+38%",
    sentiment: 85, liquidity: "+$1.8M", convergence: 5,
    reasons: ["مثلث صاعد مكتمل", "ضعف مؤشر الدولار DXY", "طلب مؤسسي متزايد", "تقارب 5 مؤشرات"],
    risk: "منخفض", icon: "Au",
  },
  {
    pair: "SOL/USDT", direction: "صعودي", confidence: 74, entry: "148.32", target1: "155.00", target2: "160.00", sl: "145.50", rr: "1:2.4",
    timeFrame: "4H", alphaScore: 68, rsi: 55, rsiSignal: "محايد", macd: "محايد", macdHist: "+1.2", bbPosition: "وسط", volume: "+15%",
    sentiment: 61, liquidity: "+$420K", convergence: 2,
    reasons: ["ارتداد من فيبوناتشي 61.8%", "نمط قاع مزدوج"],
    risk: "مرتفع", icon: "◎",
  },
  {
    pair: "GBP/USD", direction: "صعودي", confidence: 79, entry: "1.2634", target1: "1.2710", target2: "1.2780", sl: "1.2580", rr: "1:2.7",
    timeFrame: "4H", alphaScore: 75, rsi: 52, rsiSignal: "محايد", macd: "صعودي", macdHist: "+3.1", bbPosition: "وسط", volume: "+18%",
    sentiment: 64, liquidity: "+$560K", convergence: 3,
    reasons: ["ارتداد من خط اتجاه صاعد", "تقاطع MA50 فوق MA200", "زخم إيجابي متزايد"],
    risk: "متوسط", icon: "£",
  },
  {
    pair: "USD/JPY", direction: "هبوطي", confidence: 76, entry: "154.82", target1: "153.80", target2: "153.00", sl: "155.50", rr: "1:2.7",
    timeFrame: "1H", alphaScore: 72, rsi: 71, rsiSignal: "تشبع شرائي", macd: "هبوطي", macdHist: "-4.5", bbPosition: "نطاق علوي", volume: "+12%",
    sentiment: 38, liquidity: "-$340K", convergence: 3,
    reasons: ["تشبع شرائي واضح على RSI", "تباين سلبي على الزخم", "مقاومة نفسية عند 155"],
    risk: "متوسط", icon: "¥",
  },
  {
    pair: "SILVER", direction: "صعودي", confidence: 81, entry: "27.84", target1: "28.50", target2: "29.20", sl: "27.30", rr: "1:2.5",
    timeFrame: "4H", alphaScore: 77, rsi: 59, rsiSignal: "محايد", macd: "صعودي", macdHist: "+2.3", bbPosition: "نطاق علوي", volume: "+25%",
    sentiment: 69, liquidity: "+$280K", convergence: 3,
    reasons: ["تبعية إيجابية للذهب", "طلب صناعي متزايد", "كسر مقاومة 27.50"],
    risk: "متوسط", icon: "Ag",
  },
  {
    pair: "DOGE/USDT", direction: "صعودي", confidence: 71, entry: "0.1234", target1: "0.1350", target2: "0.1420", sl: "0.1180", rr: "1:2.1",
    timeFrame: "4H", alphaScore: 65, rsi: 65, rsiSignal: "محايد", macd: "صعودي", macdHist: "+2.8", bbPosition: "نطاق علوي", volume: "+52%",
    sentiment: 74, liquidity: "+$380K", convergence: 3,
    reasons: ["زخم اجتماعي متصاعد", "اختراق نطاق التداول", "حجم تداول مرتفع جداً"],
    risk: "مرتفع", icon: "Ð",
  },
  {
    pair: "AVAX/USDT", direction: "صعودي", confidence: 78, entry: "35.64", target1: "37.50", target2: "39.00", sl: "34.20", rr: "1:2.3",
    timeFrame: "D1", alphaScore: 74, rsi: 57, rsiSignal: "محايد", macd: "صعودي", macdHist: "+4.1", bbPosition: "وسط", volume: "+28%",
    sentiment: 66, liquidity: "+$520K", convergence: 3,
    reasons: ["نمو TVL على الشبكة", "ارتداد من دعم ديناميكي", "تقاطع إيجابي للمتوسطات"],
    risk: "متوسط", icon: "▲",
  },
  {
    pair: "EUR/JPY", direction: "صعودي", confidence: 75, entry: "167.95", target1: "169.20", target2: "170.50", sl: "167.00", rr: "1:2.6",
    timeFrame: "4H", alphaScore: 70, rsi: 63, rsiSignal: "محايد", macd: "صعودي", macdHist: "+3.5", bbPosition: "وسط", volume: "+16%",
    sentiment: 58, liquidity: "+$280K", convergence: 3,
    reasons: ["اتجاه صاعد مستمر", "ضعف الين الياباني", "تدفقات Carry Trade"],
    risk: "متوسط", icon: "€¥",
  },
  {
    pair: "S&P 500", direction: "صعودي", confidence: 83, entry: "5,234", target1: "5,300", target2: "5,380", sl: "5,180", rr: "1:2.4",
    timeFrame: "D1", alphaScore: 80, rsi: 64, rsiSignal: "محايد", macd: "صعودي", macdHist: "+6.2", bbPosition: "نطاق علوي", volume: "+20%",
    sentiment: 71, liquidity: "+$4.2M", convergence: 4,
    reasons: ["أرباح فصلية قوية", "توقعات خفض الفائدة", "زخم صعودي مستمر", "تدفقات مؤسسية"],
    risk: "منخفض", icon: "📊",
  },
];

const Signals = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");

  const filteredSignals = activeFilter === "الكل"
    ? signals
    : signals.filter(s => {
        if (activeFilter === "كريبتو") return s.pair.includes("USDT");
        if (activeFilter === "فوركس") return ["EUR/USD","GBP/USD","USD/JPY","EUR/JPY"].includes(s.pair);
        if (activeFilter === "سلع") return ["GOLD","SILVER","OIL"].includes(s.pair);
        if (activeFilter === "مؤشرات") return ["S&P 500","NASDAQ","DAX"].includes(s.pair);
        return true;
      });


  return (
    <div className="px-4 pt-4 pb-28 max-w-lg mx-auto">
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
        {filteredSignals.map((signal, i) => (
          <SignalCard key={signal.pair} signal={signal} />
        ))}
      </motion.div>
    </div>
  );
};

export default Signals;
