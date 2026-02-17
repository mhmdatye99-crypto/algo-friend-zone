import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, X, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown, Minus,
  Zap, BarChart, Brain, Layers, Shield, BarChart3, AlertTriangle, Crosshair,
  Camera, Upload, Sparkles, Target, ArrowUp, ArrowDown, CheckCircle2, Loader2,
  RotateCcw, Share2, Cpu, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLivePrices, formatPrice, assetCategories, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP, type AssetCategory } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useCommunity } from "@/hooks/useCommunity";
import MiniChart from "@/components/MiniChart";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

type MainTab = "markets" | "signals" | "analysis" | "performance";
type SortField = "name" | "price" | "change" | "vol";
type SortDir = "asc" | "desc";
type SignalFilter = "الكل" | "شراء" | "بيع" | "محايد" | "تشبع";

const signalFilters: SignalFilter[] = ["الكل", "شراء", "بيع", "محايد", "تشبع"];
const signalCategoryFilters = ["الكل", "فوركس", "كريبتو", "سلع", "مؤشرات"];

interface AnalysisResult {
  pair?: string;
  timeframe?: string;
  pattern?: string;
  patternAr?: string;
  patternConfidence?: number;
  direction?: string;
  directionAr?: string;
  directionConfidence?: number;
  supportLevels?: string[];
  resistanceLevels?: string[];
  indicators?: { name: string; value?: string; signal: string }[];
  entry?: string;
  stopLoss?: string;
  takeProfit1?: string;
  takeProfit2?: string;
  riskReward?: string;
  strategy?: string;
  reasoning?: string[];
  summary?: string;
  error?: string;
}

type AnalysisStep = "idle" | "loading" | "results";

const loadingSteps = [
  { label: "رفع بيانات الصورة...", icon: Upload },
  { label: "تحديد الزوج والإطار الزمني...", icon: Crosshair },
  { label: "التعرف على الأنماط...", icon: Cpu },
  { label: "تحليل المؤشرات الفنية...", icon: BarChart3 },
  { label: "حساب مستويات الدعم والمقاومة...", icon: Target },
  { label: "توليد التوصية...", icon: Sparkles },
];

const AssetLogo = ({ pair, icon, category }: { pair: string; icon: string; category: string }) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];

  if (category === "كريبتو" && logoUrl) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/30 shrink-0">
        <img src={logoUrl} alt={pair} className="w-6 h-6 rounded-full object-cover" loading="lazy" />
      </div>
    );
  }
  if (category === "فوركس" && flags) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border/30 shrink-0">
        <span className="text-[11px] leading-none">{flags}</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border/30 shrink-0">
      <span className="text-sm">{icon}</span>
    </div>
  );
};

const TradeCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const assets = useLivePrices();
  const { favorites, toggle: toggleFavorite, isLoggedIn } = useFavorites();
  const { spendCredits, canAfford, isFounder } = useCredits();
  const { createPost } = useCommunity();

  // Main tab
  const [activeTab, setActiveTab] = useState<MainTab>("markets");

  // Markets state
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [signalFilter, setSignalFilter] = useState<SignalFilter>("الكل");
  const [sortField, setSortField] = useState<SortField>("change");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [changeFilter, setChangeFilter] = useState<"all" | "up" | "down">("all");

  // Signals state
  const [activeSignalFilter, setActiveSignalFilter] = useState("الكل");
  const [signalSearch, setSignalSearch] = useState("");

  // Analysis state
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [analysisMode, setAnalysisMode] = useState<"chart" | "symbol">("chart");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filteredAssets = useMemo(() => {
    let result = assets
      .filter(a => activeCategory === "الكل" || a.category === activeCategory)
      .filter(a => !searchQuery || a.pair.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(a => !showFavOnly || favorites.has(a.pair))
      .filter(a => signalFilter === "الكل" || a.signal === signalFilter)
      .filter(a => changeFilter === "all" || (changeFilter === "up" ? a.up : !a.up));

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.pair.localeCompare(b.pair); break;
        case "price": cmp = a.price - b.price; break;
        case "change": cmp = Math.abs(a.change) - Math.abs(b.change); break;
        case "vol": {
          const parseVol = (v: string) => {
            const n = parseFloat(v.replace(/[^0-9.]/g, ""));
            return v.includes("B") ? n * 1e9 : v.includes("M") ? n * 1e6 : n * 1e3;
          };
          cmp = parseVol(a.vol) - parseVol(b.vol);
          break;
        }
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [assets, activeCategory, searchQuery, showFavOnly, signalFilter, changeFilter, sortField, sortDir, favorites]);

  const filteredSignals = useMemo(() => {
    return signals
      .filter(s => activeSignalFilter === "الكل" || s.category === activeSignalFilter)
      .filter(s => !signalSearch || s.pair.toLowerCase().includes(signalSearch.toLowerCase()));
  }, [signals, activeSignalFilter, signalSearch]);

  const symbolFilteredAssets = useMemo(() => {
    return assets.filter(a => !symbolSearch || a.pair.toLowerCase().includes(symbolSearch.toLowerCase())).slice(0, 8);
  }, [assets, symbolSearch]);

  // Performance data
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["trades-closed-all", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("status", "closed").order("closed_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const perfStats = useMemo(() => {
    if (closedTrades.length === 0) return null;
    const wins = closedTrades.filter((t: any) => (t.pnl ?? 0) > 0).length;
    const totalPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl ?? 0), 0);
    return { winRate: (wins / closedTrades.length) * 100, totalPnl, total: closedTrades.length, wins };
  }, [closedTrades]);

  const gainers = assets.filter(a => a.up).length;
  const losers = assets.length - gainers;
  const activeFiltersCount = [signalFilter !== "الكل", changeFilter !== "all", showFavOnly].filter(Boolean).length;

  // Analysis handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("يرجى اختيار صورة"); return; }
    if (!isFounder && !canAfford(CREDIT_COSTS.chart_analysis)) { toast.error("رصيد غير كافٍ"); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      if (!isFounder) {
        const success = await spendCredits(CREDIT_COSTS.chart_analysis, "chart_analysis", "تحليل شارت AI");
        if (!success) return;
      }
      setImagePreview(base64);
      analyzeChart(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeChart = async (imageBase64: string) => {
    setAnalysisStep("loading"); setLoadingStep(0); setAnalysis(null);
    const interval = setInterval(() => {
      setLoadingStep(prev => { if (prev >= loadingSteps.length - 1) { clearInterval(interval); return prev; } return prev + 1; });
    }, 800);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", { body: { imageBase64 } });
      clearInterval(interval); setLoadingStep(loadingSteps.length - 1);
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setAnalysisStep("idle"); return; }
      setAnalysis(data); setAnalysisStep("results");
    } catch {
      clearInterval(interval);
      toast.error("فشل التحليل. حاول مرة أخرى.");
      setAnalysisStep("idle");
    }
  };

  const resetAnalysis = () => { setAnalysisStep("idle"); setImagePreview(null); setAnalysis(null); setLoadingStep(0); };

  const shareToFeed = async () => {
    if (!analysis || !user) return;
    setSharing(true);
    try {
      await createPost({
        pair: analysis.pair || "UNKNOWN",
        prediction: (analysis.direction === "bullish" ? "bullish" : "bearish") as "bullish" | "bearish",
        ai_confidence: analysis.directionConfidence || 50,
        analysis_summary: analysis.summary || analysis.strategy || "",
        timeframe: analysis.timeframe || "4H",
      });
      toast.success("تم نشر التحليل في المجتمع!");
    } catch {
      toast.error("فشل النشر");
    }
    setSharing(false);
  };

  const dirColor = analysis?.direction === "bullish" ? "text-success" : analysis?.direction === "bearish" ? "text-destructive" : "text-warning";

  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "markets", label: "الأسواق", icon: <BarChart3 className="w-3.5 h-3.5" />, count: assets.length },
    { key: "signals", label: "X توصيات", icon: <Zap className="w-3.5 h-3.5" />, count: signals.length },
    { key: "analysis", label: "التحليل", icon: <Cpu className="w-3.5 h-3.5" /> },
    { key: "performance", label: "الأداء", icon: <BarChart className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-3"
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* ─── Market Summary Strip ─── */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1 bg-primary/8 text-primary px-2 py-1 rounded-lg border border-primary/15">
          <TrendingUp className="w-3 h-3" />
          <span className="font-bold">{gainers}</span>
          <span className="text-primary/70">صاعد</span>
        </div>
        <div className="flex items-center gap-1 bg-destructive/8 text-destructive px-2 py-1 rounded-lg border border-destructive/15">
          <TrendingDown className="w-3 h-3" />
          <span className="font-bold">{losers}</span>
          <span className="text-destructive/70">هابط</span>
        </div>
        <div className="mr-auto flex items-center gap-1 text-muted-foreground">
          <Crosshair className="w-3 h-3" />
          {assets.length} أصل حي
        </div>
      </motion.div>

      {/* ─── Main Tabs ─── */}
      <motion.div variants={fadeUp} className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border/10 overflow-x-auto scrollbar-hide">
        {mainTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2.5 rounded-[10px] text-[10px] font-mono font-bold transition-all relative whitespace-nowrap min-w-0",
              activeTab === t.key
                ? "bg-background text-foreground shadow-sm border border-border/20"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={cn(
                "text-[8px] px-1 py-0.5 rounded-full font-mono",
                activeTab === t.key ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── MARKETS TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "markets" && (
        <div className="space-y-3">
          {/* Search */}
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث... BTC, EUR/USD"
                className="w-full bg-secondary/60 border border-border/30 rounded-xl pr-10 pl-10 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </motion.div>

          {/* Category + Fav */}
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
              {assetCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all whitespace-nowrap",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {isLoggedIn && (
              <button
                onClick={() => setShowFavOnly(!showFavOnly)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                  showFavOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                <Star className={cn("w-4 h-4", showFavOnly && "fill-current")} />
              </button>
            )}
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-xl p-3 space-y-3 border border-border/20">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1.5">فلتر الإشارة</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {signalFilters.map((s) => (
                        <button key={s} onClick={() => setSignalFilter(s)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                            signalFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground"
                          )}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1.5">اتجاه التغيير</p>
                    <div className="flex gap-1.5">
                      {([{ key: "all" as const, label: "الكل" }, { key: "up" as const, label: "صاعد ↑" }, { key: "down" as const, label: "هابط ↓" }]).map(({ key, label }) => (
                        <button key={key} onClick={() => setChangeFilter(key)}
                          className={cn("px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all", changeFilter === key ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground")}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1.5">ترتيب حسب</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {([{ field: "change" as SortField, label: "التغيير" }, { field: "price" as SortField, label: "السعر" }, { field: "vol" as SortField, label: "الحجم" }, { field: "name" as SortField, label: "الاسم" }]).map(({ field, label }) => (
                        <button key={field} onClick={() => toggleSort(field)}
                          className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all", sortField === field ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground")}>
                          {label}
                          {sortField === field && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button onClick={() => { setSignalFilter("الكل"); setChangeFilter("all"); setShowFavOnly(false); }}
                      className="text-[10px] font-mono text-destructive hover:underline">
                      إعادة تعيين الفلاتر
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <p className="text-[10px] font-mono text-muted-foreground px-1">
            {filteredAssets.length} أصل
            {searchQuery && ` — "${searchQuery}"`}
          </p>

          {/* Asset Table */}
          <div className="glass rounded-xl overflow-hidden border border-border/10">
            <div className="grid grid-cols-[1fr_auto_56px_48px] gap-2 px-3 py-2 text-[9px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border/10 bg-secondary/30">
              <span>الأصل</span>
              <span className="text-start w-20">السعر</span>
              <span className="text-center">24h</span>
              <span className="text-center">شارت</span>
            </div>

            {filteredAssets.length === 0 && (
              <div className="py-8 text-center text-[12px] font-mono text-muted-foreground">لا توجد نتائج</div>
            )}

            {filteredAssets.map((item, i) => (
              <motion.div
                key={item.pair}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
                className="grid grid-cols-[1fr_auto_56px_48px] gap-2 items-center px-3 py-2.5 hover:bg-secondary/20 active:bg-secondary/30 transition-colors cursor-pointer border-b border-border/5 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button onClick={(e) => { e.stopPropagation(); isLoggedIn && toggleFavorite(item.pair); }} className="relative">
                    <AssetLogo pair={item.pair} icon={item.icon} category={item.category} />
                    {favorites.has(item.pair) && <Star className="absolute -top-1 -right-1 w-3 h-3 fill-primary text-primary" />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-mono font-semibold truncate">{item.pair.replace("/USDT", "")}</p>
                      <span className={cn(
                        "text-[8px] font-mono px-1.5 py-0.5 rounded-md font-medium",
                        item.signal === "شراء" && "bg-primary/15 text-primary",
                        item.signal === "بيع" && "bg-destructive/15 text-destructive",
                        item.signal === "تشبع" && "bg-amber-400/15 text-amber-400",
                        item.signal === "محايد" && "bg-muted text-muted-foreground",
                      )}>
                        {item.signal}
                      </span>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground/70">{item.vol}</p>
                  </div>
                </div>
                <span className="text-[12px] font-mono font-semibold w-20 text-start tabular-nums">{formatPrice(item.price)}</span>
                <span className={cn(
                  "text-[11px] font-mono font-bold text-center tabular-nums px-1.5 py-0.5 rounded-md",
                  item.up ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}>
                  {item.up ? "+" : ""}{item.change}%
                </span>
                <div className="flex justify-center">
                  <MiniChart data={item.sparkline} up={item.up} width={40} height={18} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── SIGNALS TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "signals" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={signalSearch}
              onChange={(e) => setSignalSearch(e.target.value)}
              placeholder="ابحث عن عملة... BTC, ETH, GOLD"
              className="w-full bg-secondary/60 border border-border/30 rounded-xl pr-10 pl-10 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {signalSearch && (
              <button onClick={() => setSignalSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {signalCategoryFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveSignalFilter(f)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all",
                  activeSignalFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-mono text-muted-foreground px-1">
            {filteredSignals.length} توصية
            {signalSearch && ` — "${signalSearch}"`}
          </p>

          {signals.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : (
            <motion.div className="space-y-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.03 } } }}>
              {filteredSignals.map((signal) => (
                <SignalCardCollapsible key={signal.pair} signal={signal} />
              ))}
            </motion.div>
          )}

          {filteredSignals.length === 0 && signals.length > 0 && (
            <p className="text-center text-muted-foreground font-mono text-sm mt-10">لا توجد إشارات لهذا البحث</p>
          )}

          <div className="glass rounded-xl p-3 border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-muted-foreground/70 leading-relaxed">
                جميع التوصيات لأغراض تعليمية فقط ولا تشكل نصيحة مالية. التداول ينطوي على مخاطر عالية.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── ANALYSIS TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "analysis" && (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {/* Sub-tabs with glow effect */}
          <motion.div
            variants={fadeUp}
            className="relative flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border/10"
            style={{ boxShadow: "0 0 20px hsla(var(--accent), 0.05)" }}
          >
            <button
              onClick={() => setAnalysisMode("chart")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-mono font-bold transition-all duration-200",
                analysisMode === "chart"
                  ? "bg-background text-foreground shadow-sm border border-accent/20"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
              style={analysisMode === "chart" ? { boxShadow: "0 0 12px hsla(var(--accent), 0.1)" } : {}}
            >
              <Camera className="w-3.5 h-3.5" /> مسح شارت
            </button>
            <button
              onClick={() => setAnalysisMode("symbol")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-mono font-bold transition-all duration-200",
                analysisMode === "symbol"
                  ? "bg-background text-foreground shadow-sm border border-accent/20"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
              style={analysisMode === "symbol" ? { boxShadow: "0 0 12px hsla(var(--accent), 0.1)" } : {}}
            >
              <Search className="w-3.5 h-3.5" /> بحث بالرمز
            </button>
          </motion.div>

          {/* Chart Scan Mode */}
          {analysisMode === "chart" && (
            <AnimatePresence mode="wait">
              {analysisStep === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-3"
                >
                  {/* Capabilities grid with stagger */}
                  <motion.div
                    className="grid grid-cols-3 gap-2"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                  >
                    {[
                      { icon: Target, label: "اتجاه السوق", color: "text-accent" },
                      { icon: Shield, label: "دعم ومقاومة", color: "text-primary" },
                      { icon: BarChart3, label: "مناطق السيولة", color: "text-accent" },
                      { icon: TrendingUp, label: "حالة التقلب", color: "text-primary" },
                      { icon: Sparkles, label: "احتمالية الصفقة", color: "text-accent" },
                      { icon: Cpu, label: "مستوى المخاطرة", color: "text-warning" },
                    ].map((cap, i) => (
                      <motion.div
                        key={i}
                        variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                        className="rounded-xl p-3 bg-card/60 border border-border/10 text-center hover:bg-card/80 hover:border-accent/15 transition-all duration-200 group cursor-default"
                      >
                        <cap.icon className={cn("w-4 h-4 mx-auto mb-1 transition-colors", cap.color, "opacity-60 group-hover:opacity-100")} />
                        <span className="text-[8px] font-mono text-muted-foreground group-hover:text-foreground/80 transition-colors">{cap.label}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Upload area with animated border */}
                  <motion.div
                    variants={fadeUp}
                    className="relative rounded-xl p-8 bg-card/40 text-center overflow-hidden group cursor-pointer"
                    style={{
                      border: "1px dashed hsla(var(--accent), 0.2)",
                      background: "linear-gradient(135deg, hsla(var(--accent), 0.03), hsla(var(--primary), 0.02))",
                    }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {/* Animated scan line */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-[1px]"
                      style={{ background: "linear-gradient(90deg, transparent, hsla(var(--accent), 0.4), transparent)" }}
                      animate={{ y: [0, 120, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <Cpu className="w-10 h-10 mx-auto mb-3 text-accent/40" />
                    </motion.div>
                    <p className="text-[11px] font-mono font-bold mb-1">ارفع صورة شارت للتحليل</p>
                    <p className="text-[9px] font-mono text-muted-foreground">
                      AI يكتشف الاتجاه، الدعم/المقاومة، السيولة، ومستوى المخاطرة
                    </p>
                  </motion.div>

                  {/* Action buttons with hover glow */}
                  <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => cameraInputRef.current?.click()}
                      className="rounded-xl p-4 flex items-center gap-3 bg-primary/8 border border-primary/15 transition-all"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 16px hsla(var(--primary), 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Camera className="w-5 h-5 text-primary" />
                      <div className="text-right">
                        <p className="text-[11px] font-mono font-bold">التقاط مباشر</p>
                        <p className="text-[8px] font-mono text-muted-foreground">كاميرا الجهاز</p>
                      </div>
                    </motion.button>
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl p-4 flex items-center gap-3 bg-accent/8 border border-accent/15 transition-all"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 16px hsla(var(--accent), 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Upload className="w-5 h-5 text-accent" />
                      <div className="text-right">
                        <p className="text-[11px] font-mono font-bold">رفع صورة</p>
                        <p className="text-[8px] font-mono text-muted-foreground">من المعرض</p>
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}

              {analysisStep === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {imagePreview && (
                    <div className="rounded-xl overflow-hidden border border-accent/20 relative">
                      <img src={imagePreview} alt="Chart" className="w-full h-40 object-cover opacity-40" />
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <motion.div
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(180deg, transparent 0%, hsla(var(--accent), 0.05) 50%, transparent 100%)" }}
                          animate={{ y: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                          style={{
                            background: "linear-gradient(135deg, hsla(var(--accent), 0.15), hsla(var(--primary), 0.1))",
                            border: "1px solid hsla(var(--accent), 0.3)",
                            boxShadow: "0 0 30px hsla(var(--accent), 0.15)",
                          }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Cpu className="w-7 h-7 text-accent" />
                        </motion.div>
                      </div>
                    </div>
                  )}
                  <div className="rounded-xl p-5 bg-card/60 border border-border/10 text-center" style={{ boxShadow: "inset 0 0 30px hsla(var(--accent), 0.03)" }}>
                    <h3 className="text-sm font-bold font-mono mb-4 text-accent">جارٍ التحليل العميق...</h3>
                    <div className="space-y-2.5">
                      {loadingSteps.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: i <= loadingStep ? 1 : 0.3, x: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.2 }}
                          className={cn("flex items-center gap-2 text-xs font-mono", i <= loadingStep ? "text-foreground" : "text-muted-foreground/40")}
                        >
                          {i < loadingStep ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> :
                           i === loadingStep ? <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" /> :
                           <div className="w-4 h-4 rounded border border-border/30 shrink-0" />}
                          {s.label}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {analysisStep === "results" && analysis && (
                <motion.div
                  key="results"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                  className="space-y-3"
                >
                  {imagePreview && (
                    <motion.div variants={fadeUp} className="rounded-xl overflow-hidden border border-accent/15 relative">
                      <img src={imagePreview} alt="Chart" className="w-full h-36 object-cover" />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[8px] font-mono text-accent border border-accent/25 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> تحليل مكتمل
                      </motion.div>
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp} className="rounded-xl p-3 bg-card/60 border border-border/10" style={{ boxShadow: "0 0 20px hsla(var(--accent), 0.04)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="text-base font-bold font-mono">{analysis.pair || "—"}</h2>
                        <span className="text-[9px] text-muted-foreground font-mono">{analysis.timeframe}</span>
                      </div>
                      <div className={cn("flex items-center gap-1 text-sm font-bold font-mono", dirColor)}>
                        {analysis.direction === "bullish" ? <ArrowUp className="w-4 h-4" /> : analysis.direction === "bearish" ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {analysis.directionAr || analysis.direction}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                      الثقة: {analysis.directionConfidence}%
                    </span>
                  </motion.div>

                  <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-3 border border-success/15" style={{ background: "linear-gradient(135deg, hsla(var(--success), 0.04), transparent)" }}>
                      <p className="text-[9px] font-mono font-bold text-success uppercase mb-1">سيناريو صعودي</p>
                      {analysis.takeProfit1 && <p className="text-[10px] font-mono">TP1: {analysis.takeProfit1}</p>}
                      {analysis.takeProfit2 && <p className="text-[10px] font-mono">TP2: {analysis.takeProfit2}</p>}
                    </div>
                    <div className="rounded-xl p-3 border border-destructive/15" style={{ background: "linear-gradient(135deg, hsla(var(--destructive), 0.04), transparent)" }}>
                      <p className="text-[9px] font-mono font-bold text-destructive uppercase mb-1">سيناريو هبوطي</p>
                      {analysis.stopLoss && <p className="text-[10px] font-mono">SL: {analysis.stopLoss}</p>}
                      {analysis.riskReward && <p className="text-[10px] font-mono">R:R {analysis.riskReward}</p>}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-3 bg-card/60 border border-border/10">
                      <p className="text-[8px] font-mono font-bold text-success uppercase mb-1">الدعم</p>
                      {analysis.supportLevels?.map((l, i) => (
                        <p key={i} className="text-[10px] font-mono text-success">{l}</p>
                      ))}
                    </div>
                    <div className="rounded-xl p-3 bg-card/60 border border-border/10">
                      <p className="text-[8px] font-mono font-bold text-destructive uppercase mb-1">المقاومة</p>
                      {analysis.resistanceLevels?.map((l, i) => (
                        <p key={i} className="text-[10px] font-mono text-destructive">{l}</p>
                      ))}
                    </div>
                  </motion.div>

                  {analysis.indicators && analysis.indicators.length > 0 && (
                    <motion.div variants={fadeUp} className="rounded-xl p-3 bg-card/60 border border-border/10">
                      <p className="text-[9px] font-mono font-bold uppercase mb-2">المؤشرات الفنية</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.indicators.map((ind, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className={cn(
                              "text-[9px] font-mono px-2 py-1 rounded-lg border",
                              ind.signal === "buy" || ind.signal === "bullish" ? "bg-success/8 text-success border-success/15" :
                              ind.signal === "sell" || ind.signal === "bearish" ? "bg-destructive/8 text-destructive border-destructive/15" :
                              "bg-secondary text-muted-foreground border-border/15"
                            )}
                          >
                            {ind.name} {ind.value && `• ${ind.value}`}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp} className="rounded-xl p-3 bg-card/60 border border-warning/10">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-warning" />
                      <div>
                        <p className="text-[9px] font-mono text-muted-foreground">مستوى المخاطرة</p>
                        <p className="text-[11px] font-mono font-bold text-warning">
                          {(analysis.directionConfidence ?? 0) >= 75 ? "منخفض" : (analysis.directionConfidence ?? 0) >= 50 ? "متوسط" : "مرتفع"}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="flex gap-2">
                    <motion.button
                      onClick={resetAnalysis}
                      className="flex-1 py-2.5 rounded-xl bg-secondary/60 text-foreground text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 border border-border/10"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> تحليل جديد
                    </motion.button>
                    <motion.button
                      onClick={shareToFeed}
                      disabled={sharing}
                      className="flex-1 py-2.5 rounded-xl bg-accent/10 text-accent text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 border border-accent/20"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 16px hsla(var(--accent), 0.12)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 className="w-3.5 h-3.5" /> {sharing ? "جارٍ النشر..." : "شارك في المجتمع"}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Symbol Search Mode */}
          {analysisMode === "symbol" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={symbolSearch}
                  onChange={e => setSymbolSearch(e.target.value)}
                  placeholder="ابحث عن رمز... BTC, EUR/USD"
                  className="w-full bg-secondary/50 border border-border/20 rounded-xl pr-10 pl-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/15 transition-all"
                  dir="rtl"
                />
              </div>
              <div className="space-y-1.5">
                {symbolFilteredAssets.map((asset, i) => (
                  <motion.button
                    key={asset.pair}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-card/60 border border-border/10 hover:bg-card/80 hover:border-accent/15 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {CRYPTO_LOGO_MAP[asset.pair] ? (
                        <img src={CRYPTO_LOGO_MAP[asset.pair]} alt={asset.pair} className="w-6 h-6 rounded-full" />
                      ) : FOREX_FLAG_MAP[asset.pair] ? (
                        <span className="text-sm">{FOREX_FLAG_MAP[asset.pair]}</span>
                      ) : (
                        <span className="text-sm">{asset.icon}</span>
                      )}
                      <span className="text-[11px] font-mono font-bold">{asset.pair}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono">{formatPrice(asset.price)}</span>
                      <span className={cn("text-[10px] font-mono font-bold", asset.up ? "text-success" : "text-destructive")}>
                        {asset.up ? "+" : ""}{asset.change}%
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── PERFORMANCE TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "performance" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
              <p className="text-2xl font-mono font-bold text-primary">{perfStats ? `${perfStats.winRate.toFixed(0)}%` : "—"}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total P&L</p>
              <p className={cn("text-2xl font-mono font-bold", (perfStats?.totalPnl ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                {perfStats ? `${perfStats.totalPnl >= 0 ? "+" : ""}$${perfStats.totalPnl.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Equity Curve
            </p>
            {closedTrades.length > 0 ? (
              <div className="h-32 flex items-end gap-1">
                {closedTrades.slice(0, 20).reverse().map((t: any, i: number) => {
                  const pnl = t.pnl ?? 0;
                  const maxPnl = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
                  const height = Math.max((Math.abs(pnl) / maxPnl) * 100, 8);
                  return (
                    <div key={i} className={cn("flex-1 rounded-t-sm transition-all", pnl >= 0 ? "bg-primary/60" : "bg-destructive/60")} style={{ height: `${height}%` }} />
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-[11px] font-mono text-muted-foreground">سجّل صفقات لعرض منحنى الأداء</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">آخر {closedTrades.length} صفقة</p>
            {closedTrades.length === 0 ? (
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-[11px] font-mono text-muted-foreground">لا توجد صفقات مغلقة بعد</p>
              </div>
            ) : closedTrades.map((trade: any) => (
              <div key={trade.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", trade.direction === "long" ? "bg-primary/15" : "bg-destructive/15")}>
                      {trade.direction === "long" ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">
                        {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={cn("text-[12px] font-mono font-bold", (trade.pnl ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                      {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TradeCenter;
