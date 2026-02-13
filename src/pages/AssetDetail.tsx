import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, TrendingUp, TrendingDown, Star, Activity, Gauge, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Full-width area chart component
const FullChart = ({ data, up }: { data: number[]; up: boolean }) => {
  if (!data.length) return null;
  const w = 340;
  const h = 160;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 5;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 rounded-xl overflow-hidden">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} stopOpacity="0.25" />
          <stop offset="100%" stopColor={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price dot */}
      {data.length > 0 && (() => {
        const lastX = w;
        const lastY = h - ((data[data.length - 1] - min) / range) * (h - 10) - 5;
        return (
          <>
            <circle cx={lastX} cy={lastY} r="4" fill={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} />
            <circle cx={lastX} cy={lastY} r="8" fill={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} opacity="0.3">
              <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        );
      })()}
    </svg>
  );
};

const AssetDetail = () => {
  const { pair } = useParams<{ pair: string }>();
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, toggle, isLoggedIn } = useFavorites();
  const [timeframe, setTimeframe] = useState("4H");

  const decodedPair = decodeURIComponent(pair || "");
  const asset = assets.find(a => a.pair === decodedPair);

  if (!asset) {
    return (
      <div className="px-4 pt-10 pb-28 max-w-lg mx-auto text-center">
        <p className="text-muted-foreground font-mono">الأصل غير موجود</p>
        <button onClick={() => navigate("/")} className="text-primary font-mono text-sm mt-4">العودة للرئيسية</button>
      </div>
    );
  }

  const isFav = favorites.has(asset.pair);
  const timeframes = ["1H", "4H", "D1", "W1"];

  // Generate mock extended data for chart
  const extendedData = asset.sparkline.length > 0
    ? [...Array.from({ length: 30 }, (_, i) => {
        const base = asset.sparkline[0] || asset.price;
        return base + (Math.random() - 0.48) * base * 0.008 * (i + 1);
      }), ...asset.sparkline]
    : [];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="px-4 pt-8 pb-28 max-w-lg mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-5 h-5" />
          <span className="text-[12px] font-mono">رجوع</span>
        </button>
        {isLoggedIn && (
          <button onClick={() => toggle(asset.pair)} className={cn("transition-colors", isFav ? "text-primary" : "text-muted-foreground")}>
            <Star className={cn("w-5 h-5", isFav && "fill-current")} />
          </button>
        )}
      </motion.div>

      {/* Asset Info */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border/20">
          <span className="text-xl">{asset.icon}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-mono">{asset.pair}</h1>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{asset.category}</span>
            <span className="text-[11px] font-mono text-muted-foreground">حجم: {asset.vol}</span>
          </div>
        </div>
      </motion.div>

      {/* Price */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">السعر الحالي</p>
            <p className="text-3xl font-bold font-mono tabular-nums">{formatPrice(asset.price)}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono font-bold",
            asset.up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {asset.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {asset.up ? "+" : ""}{asset.change}%
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">تحديث لحظي</span>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">الشارت</p>
          <div className="flex gap-1">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all",
                  timeframe === tf ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <FullChart data={extendedData} up={asset.up} />
      </motion.div>

      {/* Technical Indicators */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3">المؤشرات الفنية</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Gauge className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">RSI (14)</span>
            </div>
            <p className={cn(
              "text-xl font-bold font-mono",
              asset.rsi > 70 ? "text-destructive" : asset.rsi < 30 ? "text-success" : "text-foreground"
            )}>{asset.rsi}</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {asset.rsi > 70 ? "تشبع شرائي" : asset.rsi < 30 ? "تشبع بيعي" : "منطقة محايدة"}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">MACD</span>
            </div>
            <p className={cn(
              "text-xl font-bold font-mono",
              asset.macd === "صعودي" ? "text-success" : asset.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
            )}>{asset.macd}</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {asset.macd === "صعودي" ? "إشارة شراء" : asset.macd === "هبوطي" ? "إشارة بيع" : "لا إشارة"}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-mono text-muted-foreground">الإشارة</span>
            </div>
            <p className={cn(
              "text-lg font-bold font-mono",
              asset.signal === "شراء" ? "text-success" : asset.signal === "بيع" ? "text-destructive" : "text-warning"
            )}>{asset.signal}</p>
            <p className="text-[10px] font-mono text-muted-foreground">توصية AI</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">الحجم</span>
            </div>
            <p className="text-lg font-bold font-mono">{asset.vol}</p>
            <p className="text-[10px] font-mono text-muted-foreground">حجم التداول اليومي</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate("/signals")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono text-[12px] font-bold hover:bg-primary/20 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          إشارات التداول
        </button>
        <button
          onClick={() => navigate("/chart-vision")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-mono text-[12px] font-bold hover:bg-accent/20 transition-colors"
        >
          <Gauge className="w-4 h-4" />
          تحليل الشارت
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/30 border border-border/10">
        <p className="text-[10px] text-muted-foreground font-mono">
          البيانات للأغراض التعليمية فقط — ليست نصيحة مالية
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AssetDetail;
