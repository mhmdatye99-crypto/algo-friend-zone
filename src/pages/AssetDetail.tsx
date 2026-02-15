import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, TrendingUp, TrendingDown, Star, Activity, Gauge, ArrowUpRight, Clock, Zap, Save, Loader2, CheckCircle, BookOpen, ChevronDown, Sparkles, HelpCircle, X } from "lucide-react";
import { AlphaConsultant } from "@/components/asset/AlphaConsultant";
import { cn } from "@/lib/utils";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TRADINGVIEW_SYMBOL_MAP: Record<string, string> = {
  "BTC/USDT": "BINANCE:BTCUSDT",
  "ETH/USDT": "BINANCE:ETHUSDT",
  "BNB/USDT": "BINANCE:BNBUSDT",
  "SOL/USDT": "BINANCE:SOLUSDT",
  "XRP/USDT": "BINANCE:XRPUSDT",
  "ADA/USDT": "BINANCE:ADAUSDT",
  "DOGE/USDT": "BINANCE:DOGEUSDT",
  "DOT/USDT": "BINANCE:DOTUSDT",
  "AVAX/USDT": "BINANCE:AVAXUSDT",
  "LINK/USDT": "BINANCE:LINKUSDT",
  "MATIC/USDT": "BINANCE:MATICUSDT",
  "SHIB/USDT": "BINANCE:SHIBUSDT",
  "LTC/USDT": "BINANCE:LTCUSDT",
  "UNI/USDT": "BINANCE:UNIUSDT",
  "ATOM/USDT": "BINANCE:ATOMUSDT",
  "FIL/USDT": "BINANCE:FILUSDT",
  "APT/USDT": "BINANCE:APTUSDT",
  "ARB/USDT": "BINANCE:ARBUSDT",
  "OP/USDT": "BINANCE:OPUSDT",
  "NEAR/USDT": "BINANCE:NEARUSDT",
  "SUI/USDT": "BINANCE:SUIUSDT",
  "INJ/USDT": "BINANCE:INJUSDT",
  "TIA/USDT": "BINANCE:TIAUSDT",
  "SEI/USDT": "BINANCE:SEIUSDT",
  "GOLD": "TVC:GOLD",
  "SILVER": "TVC:SILVER",
  "OIL": "TVC:USOIL",
  "EUR/USD": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "USD/JPY": "FX:USDJPY",
  "AUD/USD": "FX:AUDUSD",
  "USD/CHF": "FX:USDCHF",
  "NZD/USD": "FX:NZDUSD",
  "USD/CAD": "FX:USDCAD",
  "EUR/GBP": "FX:EURGBP",
  "EUR/JPY": "FX:EURJPY",
  "GBP/JPY": "FX:GBPJPY",
  "US30": "TVC:DJI",
  "SPX500": "TVC:SPX",
  "NASDAQ": "NASDAQ:NDX",
  "DAX": "XETR:DAX",
  "NIKKEI": "TVC:NI225",
};

const TF_MAP: Record<string, string> = {
  "15M": "15",
  "1H": "60",
  "4H": "240",
  "D1": "D",
};

const TradingViewChart = ({ pair, timeframe }: { pair: string; timeframe: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const symbol = TRADINGVIEW_SYMBOL_MAP[pair] || `BINANCE:${pair.replace("/", "")}`;
  const interval = TF_MAP[timeframe] || "240";

  React.useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "ar",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      hide_side_toolbar: false,
      details: false,
      studies: ["RSI@tv-basicstudies"],
      drawings_access: { type: "all" },
      support_host: "https://www.tradingview.com",
      backgroundColor: "rgba(0,0,0,0)",
      gridColor: "rgba(255,255,255,0.04)",
    });
    containerRef.current.appendChild(script);
  }, [symbol, interval]);

  return (
    <div className="tradingview-widget-container rounded-xl overflow-hidden" style={{ height: 380 }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

interface TimeframeAnalysis {
  tf: string;
  label: string;
  trend: "صعودي" | "هبوطي" | "محايد";
  rsi: number;
  macd: "صعودي" | "هبوطي" | "محايد";
  signal: "شراء" | "بيع" | "محايد";
  strength: number;
}

function generateTimeframeAnalysis(price: number, baseRsi: number, baseChange: number, baseMacd: string): TimeframeAnalysis[] {
  const seed = Math.round(price * 100);
  const pseudoRand = (i: number) => ((seed * (i + 1) * 13) % 100) / 100;

  const tfs = [
    { tf: "D1", label: "يومي", weight: 1.0 },
    { tf: "4H", label: "4 ساعات", weight: 0.85 },
    { tf: "1H", label: "ساعة", weight: 0.7 },
    { tf: "15M", label: "15 دقيقة", weight: 0.55 },
  ];

  return tfs.map((t, i) => {
    const rsiNoise = (pseudoRand(i) - 0.5) * 20 * (1 - t.weight);
    const rsi = Math.round(Math.min(Math.max(baseRsi + rsiNoise, 15), 88));
    const trendBias = baseChange + (pseudoRand(i + 10) - 0.5) * 4 * (1 - t.weight);
    const trend: "صعودي" | "هبوطي" | "محايد" = trendBias > 0.5 ? "صعودي" : trendBias < -0.5 ? "هبوطي" : "محايد";
    const macdOptions: ("صعودي" | "هبوطي" | "محايد")[] = ["صعودي", "هبوطي", "محايد"];
    const macdIdx = i === 0 ? (baseMacd === "صعودي" ? 0 : baseMacd === "هبوطي" ? 1 : 2) : Math.floor(pseudoRand(i + 20) * 3);
    const macd = macdOptions[macdIdx];
    const signal: "شراء" | "بيع" | "محايد" = trend === "صعودي" && rsi < 70 ? "شراء" : trend === "هبوطي" && rsi > 30 ? "بيع" : "محايد";
    const strength = Math.min(Math.round(
      50 + (trend !== "محايد" ? 15 : 0) + (macd === trend ? 12 : 0) +
      (rsi > 50 && trend === "صعودي" ? 10 : 0) + (rsi < 50 && trend === "هبوطي" ? 10 : 0) +
      pseudoRand(i + 30) * 8
    ), 95);
    return { tf: t.tf, label: t.label, trend, rsi, macd, signal, strength };
  });
}

const trendColor = (t: string) => t === "صعودي" ? "text-success" : t === "هبوطي" ? "text-destructive" : "text-muted-foreground";
const trendBg = (t: string) => t === "صعودي" ? "bg-success/10 border-success/20" : t === "هبوطي" ? "bg-destructive/10 border-destructive/20" : "bg-secondary/50 border-border/20";
const signalBadge = (s: string) => s === "شراء" ? "bg-success/15 text-success border-success/25" : s === "بيع" ? "bg-destructive/15 text-destructive border-destructive/25" : "bg-secondary text-muted-foreground border-border/20";

const SaveAnalysisButton = ({ asset, mtfAnalysis, consensus }: { asset: any; mtfAnalysis: TimeframeAnalysis[]; consensus: { signal: string; count: number; total: number } }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [openingTrade, setOpeningTrade] = useState(false);

  const direction = consensus.signal === "شراء" ? "صعودي" : consensus.signal === "بيع" ? "هبوطي" : "محايد";
  const confidence = mtfAnalysis.length > 0 ? Math.round(mtfAnalysis.reduce((s, t) => s + t.strength, 0) / mtfAnalysis.length) : 50;

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_analyses").insert({
        user_id: user.id,
        pair: asset.pair,
        icon: asset.icon,
        price: asset.price,
        direction,
        confidence,
        timeframe: "MTF",
        rsi: asset.rsi,
        macd: asset.macd,
        signal: consensus.signal,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      setSaved(true);
      toast.success("تم حفظ التحليل بنجاح");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("فشل حفظ التحليل");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenTrade = async () => {
    if (!user || openingTrade) return;
    setOpeningTrade(true);
    try {
      // Save analysis first
      const { data: analysisData, error: analysisError } = await supabase.from("saved_analyses").insert({
        user_id: user.id,
        pair: asset.pair,
        icon: asset.icon,
        price: asset.price,
        direction,
        confidence,
        timeframe: "MTF",
        rsi: asset.rsi,
        macd: asset.macd,
        signal: consensus.signal,
        notes: notes.trim() || null,
      }).select("id").single();
      if (analysisError) throw analysisError;

      // Create trade linked to this analysis
      const tradeDirection = consensus.signal === "شراء" ? "long" : consensus.signal === "بيع" ? "short" : "long";
      const entryReason = `تحليل متعدد الفريمات: ${consensus.signal} (${consensus.count}/${consensus.total}) | RSI: ${asset.rsi} | MACD: ${asset.macd} | ثقة: ${confidence}%`;

      const { error: tradeError } = await supabase.from("trades").insert({
        user_id: user.id,
        pair: asset.pair,
        direction: tradeDirection,
        entry_price: asset.price,
        status: "open",
        entry_reason: entryReason,
        strategy: `MTF Analysis - ${direction}`,
        analysis_id: analysisData.id,
        notes: notes.trim() || null,
      });
      if (tradeError) throw tradeError;

      toast.success("تم فتح الصفقة وحفظ التحليل");
      navigate("/trade-journal");
    } catch {
      toast.error("فشل فتح الصفقة");
    } finally {
      setOpeningTrade(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div variants={fadeUp} className="space-y-2">
      {showNotes && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="أضف ملاحظاتك على التحليل وسبب الدخول (اختياري)..."
          className="w-full bg-secondary/60 border border-border/30 rounded-[10px] px-3 py-2.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none h-20"
          maxLength={500}
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-secondary/50 border border-border/20 text-muted-foreground font-mono text-[10px] font-bold hover:bg-secondary/80 transition-colors"
        >
          ✏️
        </button>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[11px] font-bold transition-all",
            saved
              ? "bg-success/15 border border-success/25 text-success"
              : "bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "حفظ..." : saved ? "تم ✓" : "حفظ التحليل"}
        </button>
        <button
          onClick={handleOpenTrade}
          disabled={openingTrade}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[11px] font-bold transition-all bg-success/15 border border-success/25 text-success hover:bg-success/25"
        >
          {openingTrade ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          {openingTrade ? "جاري..." : "فتح صفقة 📊"}
        </button>
      </div>
    </motion.div>
  );
};

// Expandable timeframe analysis card
const TimeframeCard = ({ tf }: { tf: TimeframeAnalysis }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className={cn(
        "rounded-[12px] border cursor-pointer transition-all overflow-hidden",
        expanded ? trendBg(tf.trend) : "bg-secondary/30 border-border/20 hover:border-primary/30"
      )}
      layout
      onClick={() => setExpanded(!expanded)}
    >
      {/* Collapsed: Minimal info + CTA */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-mono font-bold text-foreground">{tf.tf}</span>
            <span className="text-[9px] font-mono text-muted-foreground">{tf.label}</span>
          </div>
          <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border", signalBadge(tf.signal))}>
            {tf.signal}
          </span>
        </div>

        {!expanded && (
          <div className="flex items-center justify-center gap-1 mt-2 py-1.5 rounded-lg bg-primary/8 border border-primary/15">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-mono font-bold text-primary">انقر للتحليل</span>
          </div>
        )}

        {/* Expanded: Full analysis */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-1 mb-2 mt-1">
                {tf.trend === "صعودي" ? <TrendingUp className="w-3.5 h-3.5 text-success" />
                  : tf.trend === "هبوطي" ? <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                  : <Activity className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className={cn("text-[12px] font-mono font-bold", trendColor(tf.trend))}>{tf.trend}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground">RSI</span>
                  <span className={cn("text-[11px] font-mono font-bold",
                    tf.rsi > 70 ? "text-destructive" : tf.rsi < 30 ? "text-success" : "text-foreground"
                  )}>{tf.rsi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground">MACD</span>
                  <span className={cn("text-[11px] font-mono font-bold", trendColor(tf.macd))}>{tf.macd}</span>
                </div>
              </div>

              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: tf.trend === "صعودي"
                        ? "linear-gradient(90deg, hsl(155 100% 35%), hsl(155 100% 50%))"
                        : tf.trend === "هبوطي"
                        ? "linear-gradient(90deg, hsl(350 80% 40%), hsl(350 100% 55%))"
                        : "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${tf.strength}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-[8px] font-mono text-muted-foreground mt-0.5 block text-left">{tf.strength}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Confidence "Why?" explainer block
const ConfidenceWhyBlock = ({ mtfAnalysis, asset, consensus }: { mtfAnalysis: TimeframeAnalysis[]; asset: any; consensus: { signal: string; count: number; total: number } }) => {
  const [showWhy, setShowWhy] = useState(false);
  const confidence = mtfAnalysis.length > 0 ? Math.round(mtfAnalysis.reduce((s, t) => s + t.strength, 0) / mtfAnalysis.length) : 50;

  // Generate 3 technical reasoning bullets
  const reasons = useMemo(() => {
    const bullets: string[] = [];
    const rsi = asset.rsi;
    if (rsi > 70) bullets.push(`RSI في منطقة تشبع شرائي (${rsi}) — احتمال تصحيح`);
    else if (rsi < 30) bullets.push(`RSI في منطقة تشبع بيعي (${rsi}) — فرصة ارتداد`);
    else if (rsi > 55) bullets.push(`RSI يظهر زخم صعودي (${rsi})`);
    else bullets.push(`RSI في المنطقة المحايدة (${rsi})`);

    const macdBull = mtfAnalysis.filter(t => t.macd === "صعودي").length;
    if (macdBull >= 3) bullets.push(`MACD صعودي على ${macdBull} فريمات — تأكيد قوي`);
    else if (macdBull === 0) bullets.push("MACD هبوطي على جميع الفريمات — ضغط بيعي");
    else bullets.push(`MACD مختلط (${macdBull}/${mtfAnalysis.length} صعودي)`);

    const trendAgree = mtfAnalysis.filter(t => t.trend === mtfAnalysis[0]?.trend).length;
    if (trendAgree >= 3) bullets.push(`اتجاه متوافق على ${trendAgree} فريمات — إشارة مؤكدة`);
    else bullets.push("تباين في الاتجاهات بين الفريمات — حذر مطلوب");

    return bullets.slice(0, 3);
  }, [mtfAnalysis, asset.rsi]);

  return (
    <div className="rounded-xl bg-secondary/30 border border-border/15 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">الثقة</span>
          <span className={cn(
            "text-lg font-mono font-bold",
            confidence >= 70 ? "text-success" : confidence >= 50 ? "text-primary" : "text-destructive"
          )}>{confidence}%</span>
        </div>
        <button
          onClick={() => setShowWhy(!showWhy)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all",
            showWhy ? "bg-primary/15 text-primary border border-primary/25" : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-border/20"
          )}
        >
          <HelpCircle className="w-3 h-3" />
          لماذا؟
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: confidence >= 70
              ? "linear-gradient(90deg, hsl(155 100% 35%), hsl(155 100% 50%))"
              : confidence >= 50
              ? "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))"
              : "linear-gradient(90deg, hsl(350 80% 40%), hsl(350 100% 55%))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <AnimatePresence>
        {showWhy && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-1.5 border-t border-border/15 pt-3">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] text-primary mt-0.5">●</span>
                  <p className="text-[10px] font-mono text-foreground/80 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AssetDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, toggle, isLoggedIn } = useFavorites();
  const [timeframe, setTimeframe] = useState("4H");

  const decodedPair = decodeURIComponent(location.pathname.replace("/asset/", ""));
  const asset = assets.find(a => a.pair === decodedPair);

  const mtfAnalysis = useMemo(() => {
    if (!asset) return [];
    return generateTimeframeAnalysis(asset.price, asset.rsi, asset.change, asset.macd);
  }, [asset?.pair, asset?.price]);

  const consensus = useMemo(() => {
    if (!mtfAnalysis.length) return { signal: "محايد", count: 0, total: 0 };
    const buy = mtfAnalysis.filter(t => t.signal === "شراء").length;
    const sell = mtfAnalysis.filter(t => t.signal === "بيع").length;
    if (buy > sell) return { signal: "شراء", count: buy, total: mtfAnalysis.length };
    if (sell > buy) return { signal: "بيع", count: sell, total: mtfAnalysis.length };
    return { signal: "محايد", count: 0, total: mtfAnalysis.length };
  }, [mtfAnalysis]);

  if (!asset) {
    return (
      <div className="px-4 pt-10 pb-28 max-w-lg mx-auto text-center">
        <p className="text-muted-foreground font-mono">الأصل غير موجود</p>
        <button onClick={() => navigate("/")} className="text-primary font-mono text-sm mt-4">العودة للرئيسية</button>
      </div>
    );
  }

  const isFav = favorites.has(asset.pair);
  const chartTimeframes = ["15M", "1H", "4H", "D1"];

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
      <motion.div variants={fadeUp} className="intel-card rounded-xl p-4">
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
      <motion.div variants={fadeUp} className="intel-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">الشارت</p>
          <div className="flex gap-1">
            {chartTimeframes.map(tf => (
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
        <TradingViewChart pair={asset.pair} timeframe={timeframe} />
      </motion.div>

      {/* ═══ Multi-Timeframe Analysis — Collapsed by Default ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="intel-card rounded-[14px] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(43 100% 50% / 0.15), hsl(190 100% 50% / 0.15))", border: "1px solid hsl(43 100% 50% / 0.2)" }}>
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[12px] font-mono font-bold text-foreground">تحليل متعدد الفريمات</p>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border",
              signalBadge(consensus.signal)
            )}>
              <Zap className="w-3 h-3" />
              {consensus.signal === "محايد" ? "محايد" : `${consensus.signal} ${consensus.count}/${consensus.total}`}
            </div>
          </div>

          {/* Confidence with "Why?" */}
          <ConfidenceWhyBlock mtfAnalysis={mtfAnalysis} asset={asset} consensus={consensus} />

          {/* Timeframe Cards — Each Expandable */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {mtfAnalysis.map((tf) => (
              <TimeframeCard key={tf.tf} tf={tf} />
            ))}
          </div>
        </div>
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
            <p className={cn("text-xl font-bold font-mono",
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
            <p className={cn("text-xl font-bold font-mono",
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
            <p className={cn("text-lg font-bold font-mono",
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

      {/* AI Consultant */}
      <motion.div variants={fadeUp} className="flex justify-center">
        <AlphaConsultant asset={asset} />
      </motion.div>

      {/* Save Analysis */}
      <SaveAnalysisButton asset={asset} mtfAnalysis={mtfAnalysis} consensus={consensus} />

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate("/trade-center")}
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