import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Sparkles, TrendingUp, Shield, Target, BarChart3,
  ArrowUp, ArrowDown, Minus, CheckCircle2, Loader2, RotateCcw,
  Share2, Cpu, Crosshair, Send, Search, Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLivePrices, formatPrice, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP } from "@/hooks/useLivePrices";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";

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

type Step = "idle" | "loading" | "results";

const loadingSteps = [
  { label: "رفع بيانات الصورة...", icon: Upload },
  { label: "تحديد الزوج والإطار الزمني...", icon: Crosshair },
  { label: "التعرف على الأنماط...", icon: Cpu },
  { label: "تحليل المؤشرات الفنية...", icon: BarChart3 },
  { label: "حساب مستويات الدعم والمقاومة...", icon: Target },
  { label: "توليد التوصية...", icon: Sparkles },
];

const AIScan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { credits, spendCredits, canAfford, isFounder } = useCredits();
  const { createPost } = useCommunity();
  const { user } = useAuth();
  const assets = useLivePrices();
  const { isPro, loading: subLoading } = useSubscription();

  const filteredAssets = assets.filter(a =>
    !symbolSearch || a.pair.toLowerCase().includes(symbolSearch.toLowerCase())
  ).slice(0, 8);

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
    setStep("loading"); setLoadingStep(0); setAnalysis(null);
    const interval = setInterval(() => {
      setLoadingStep(prev => { if (prev >= loadingSteps.length - 1) { clearInterval(interval); return prev; } return prev + 1; });
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", { body: { imageBase64 } });
      clearInterval(interval); setLoadingStep(loadingSteps.length - 1);
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setStep("idle"); return; }
      setAnalysis(data); setStep("results");
    } catch {
      clearInterval(interval);
      toast.error("فشل التحليل. حاول مرة أخرى.");
      setStep("idle");
    }
  };

  const resetAnalysis = () => { setStep("idle"); setImagePreview(null); setAnalysis(null); setLoadingStep(0); };

  const dirColor = analysis?.direction === "bullish" ? "text-success" : analysis?.direction === "bearish" ? "text-destructive" : "text-warning";

  if (!subLoading && !isPro) {
    return (
      <div className="px-4 pt-3 pb-28 max-w-lg mx-auto">
        <div className="mb-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">ماسح متقدم</p>
          <h1 className="text-lg font-bold">AI <span className="text-gradient-gold">Scan</span></h1>
        </div>
        <SubscriptionGate featureName="AI Scan">
          <div className="space-y-4 py-20">
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-xl p-3 bg-card/60 border border-border/10 h-16" />
              ))}
            </div>
            <div className="rounded-xl p-10 bg-card/40 border border-dashed border-border/30" />
          </div>
        </SubscriptionGate>
      </div>
    );
  }

  return (
    <motion.div className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <div>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">ماسح متقدم</p>
        <h1 className="text-lg font-bold">AI <span className="text-gradient-gold">Scan</span></h1>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-secondary/30 border border-border/20 rounded-xl h-10 p-1">
          <TabsTrigger value="chart" className="text-[10px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> مسح شارت
          </TabsTrigger>
          <TabsTrigger value="symbol" className="text-[10px] font-mono data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-lg flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> بحث بالرمز
          </TabsTrigger>
        </TabsList>

        {/* Chart Scan Tab */}
        <TabsContent value="chart" className="mt-4">
          <AnimatePresence mode="wait">
            {step === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Capabilities */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Target, label: "اتجاه السوق" },
                    { icon: Shield, label: "دعم ومقاومة" },
                    { icon: BarChart3, label: "مناطق السيولة" },
                    { icon: TrendingUp, label: "حالة التقلب" },
                    { icon: Sparkles, label: "احتمالية الصفقة" },
                    { icon: Cpu, label: "مستوى المخاطرة" },
                  ].map((cap, i) => (
                    <div key={i} className="rounded-xl p-3 bg-card/60 border border-border/10 text-center">
                      <cap.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-[8px] font-mono text-muted-foreground">{cap.label}</span>
                    </div>
                  ))}
                </div>

                {/* Upload area */}
                <div className="rounded-xl p-10 bg-card/40 border border-dashed border-border/30 text-center">
                  <Cpu className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-[11px] font-mono font-bold mb-1">ارفع صورة شارت للتحليل</p>
                  <p className="text-[9px] font-mono text-muted-foreground">
                    AI يكتشف الاتجاه، الدعم/المقاومة، السيولة، ومستوى المخاطرة
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => cameraInputRef.current?.click()}
                    className="rounded-xl p-4 flex items-center gap-3 bg-primary/8 border border-primary/15 hover:bg-primary/12 transition-all">
                    <Camera className="w-5 h-5 text-primary" />
                    <div className="text-right">
                      <p className="text-[11px] font-mono font-bold">التقاط مباشر</p>
                      <p className="text-[8px] font-mono text-muted-foreground">كاميرا الجهاز</p>
                    </div>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl p-4 flex items-center gap-3 bg-accent/8 border border-accent/15 hover:bg-accent/12 transition-all">
                    <Upload className="w-5 h-5 text-accent" />
                    <div className="text-right">
                      <p className="text-[11px] font-mono font-bold">رفع صورة</p>
                      <p className="text-[8px] font-mono text-muted-foreground">من المعرض</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-primary/15 relative">
                    <img src={imagePreview} alt="Chart" className="w-full h-40 object-cover opacity-50" />
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                      <motion.div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Cpu className="w-6 h-6 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                )}
                <div className="rounded-xl p-5 bg-card/60 border border-border/10 text-center">
                  <h3 className="text-sm font-bold font-mono mb-4">جارٍ التحليل...</h3>
                  <div className="space-y-2">
                    {loadingSteps.map((s, i) => (
                      <div key={i} className={cn("flex items-center gap-2 text-xs font-mono", i <= loadingStep ? "text-foreground" : "text-muted-foreground/40")}>
                        {i < loadingStep ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> :
                         i === loadingStep ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> :
                         <div className="w-4 h-4 rounded border border-border/30 shrink-0" />}
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === "results" && analysis && (
              <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-primary/10 relative">
                    <img src={imagePreview} alt="Chart" className="w-full h-36 object-cover" />
                    <div className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-mono text-primary border border-primary/20">
                      تحليل مكتمل
                    </div>
                  </div>
                )}

                {/* Direction & Pair */}
                <div className="rounded-xl p-3 bg-card/60 border border-border/10">
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
                  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    الثقة: {analysis.directionConfidence}%
                  </span>
                </div>

                {/* Scenarios */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 bg-success/5 border border-success/10">
                    <p className="text-[9px] font-mono font-bold text-success uppercase mb-1">سيناريو صعودي</p>
                    {analysis.takeProfit1 && <p className="text-[10px] font-mono">TP1: {analysis.takeProfit1}</p>}
                    {analysis.takeProfit2 && <p className="text-[10px] font-mono">TP2: {analysis.takeProfit2}</p>}
                  </div>
                  <div className="rounded-xl p-3 bg-destructive/5 border border-destructive/10">
                    <p className="text-[9px] font-mono font-bold text-destructive uppercase mb-1">سيناريو هبوطي</p>
                    {analysis.stopLoss && <p className="text-[10px] font-mono">SL: {analysis.stopLoss}</p>}
                    {analysis.riskReward && <p className="text-[10px] font-mono">R:R {analysis.riskReward}</p>}
                  </div>
                </div>

                {/* Support/Resistance */}
                <div className="grid grid-cols-2 gap-2">
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
                </div>

                {/* Indicators */}
                {analysis.indicators && analysis.indicators.length > 0 && (
                  <div className="rounded-xl p-3 bg-card/60 border border-border/10">
                    <p className="text-[9px] font-mono font-bold uppercase mb-2">المؤشرات الفنية</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.indicators.map((ind, i) => (
                        <span key={i} className={cn(
                          "text-[9px] font-mono px-2 py-1 rounded-lg border",
                          ind.signal === "buy" || ind.signal === "bullish" ? "bg-success/8 text-success border-success/15" :
                          ind.signal === "sell" || ind.signal === "bearish" ? "bg-destructive/8 text-destructive border-destructive/15" :
                          "bg-secondary text-muted-foreground border-border/15"
                        )}>
                          {ind.name} {ind.value && `• ${ind.value}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Level */}
                <div className="rounded-xl p-3 bg-card/60 border border-warning/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-warning" />
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground">مستوى المخاطرة</p>
                      <p className="text-[11px] font-mono font-bold text-warning">
                        {(analysis.directionConfidence ?? 0) >= 75 ? "منخفض" : (analysis.directionConfidence ?? 0) >= 50 ? "متوسط" : "مرتفع"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={resetAnalysis}
                    className="flex-1 py-2.5 rounded-xl bg-secondary/60 text-foreground text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 border border-border/10">
                    <RotateCcw className="w-3.5 h-3.5" /> تحليل جديد
                  </button>
                  <button onClick={shareToFeed} disabled={sharing}
                    className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 border border-primary/20">
                    <Share2 className="w-3.5 h-3.5" /> {sharing ? "جارٍ النشر..." : "شارك في المجتمع"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Symbol Search Tab */}
        <TabsContent value="symbol" className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={symbolSearch}
              onChange={e => setSymbolSearch(e.target.value)}
              placeholder="ابحث عن رمز... BTC, EUR/USD"
              className="w-full bg-secondary/50 border border-border/20 rounded-xl pr-10 pl-4 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
              dir="rtl"
            />
          </div>
          <div className="space-y-1">
            {filteredAssets.map(asset => (
              <button
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-card/60 border border-border/10 hover:bg-card/80 transition-all"
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
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AIScan;
