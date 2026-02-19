import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Camera, Upload, Sparkles, Target, ArrowUp, ArrowDown, CheckCircle2, Loader2,
  RotateCcw, Share2, Cpu, Send, Search, Crosshair, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useCommunity } from "@/hooks/useCommunity";
import { useLivePrices } from "@/hooks/useLivePrices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

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

const ChartAnalysisPage = () => {
  const { user } = useAuth();
  const { spendCredits, canAfford, isFounder } = useCredits();
  const { createPost } = useCommunity();
  const assets = useLivePrices();

  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [analysisMode, setAnalysisMode] = useState<"chart" | "symbol">("chart");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const symbolFilteredAssets = useMemo(() => {
    return assets.filter(a => !symbolSearch || a.pair.toLowerCase().includes(symbolSearch.toLowerCase())).slice(0, 8);
  }, [assets, symbolSearch]);

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

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-3"
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Mode Toggle */}
      <motion.div variants={fadeUp} className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border/10">
        <button
          onClick={() => setAnalysisMode("chart")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-mono font-bold transition-all",
            analysisMode === "chart" ? "bg-background text-foreground shadow-sm border border-accent/20" : "text-muted-foreground"
          )}
        >
          <Camera className="w-4 h-4" /> تحليل صورة
        </button>
        <button
          onClick={() => setAnalysisMode("symbol")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-mono font-bold transition-all",
            analysisMode === "symbol" ? "bg-background text-foreground shadow-sm border border-accent/20" : "text-muted-foreground"
          )}
        >
          <Search className="w-4 h-4" /> تحليل رمز
        </button>
      </motion.div>

      {analysisStep === "idle" && analysisMode === "chart" && (
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="rounded-xl border-2 border-dashed border-border/30 p-8 text-center space-y-3 bg-card/30">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-[13px] font-mono font-bold">ارفع صورة الشارت</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">سيقوم X بتحليل الأنماط والمؤشرات الفنية</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-[11px] font-mono font-bold hover:bg-accent/90 transition-all">
                <Camera className="w-4 h-4" /> التقط صورة
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-[11px] font-mono font-bold hover:bg-secondary/80 transition-all border border-border/20">
                <Upload className="w-4 h-4" /> اختر ملف
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {analysisStep === "idle" && analysisMode === "symbol" && (
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={symbolSearch}
              onChange={(e) => setSymbolSearch(e.target.value)}
              placeholder="ابحث عن رمز... BTC, GOLD"
              className="w-full bg-secondary/60 border border-border/30 rounded-xl pr-10 pl-4 py-2.5 text-[12px] font-mono focus:outline-none focus:border-accent/50 transition-all"
            />
          </div>
          <div className="space-y-1">
            {symbolFilteredAssets.map((asset) => (
              <button key={asset.pair} onClick={() => { setImagePreview(null); analyzeChart(`symbol:${asset.pair}`); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/10 bg-card/40 hover:bg-card/60 transition-all">
                <span className="text-base">{asset.icon}</span>
                <span className="text-[11px] font-mono font-bold flex-1 text-right">{asset.pair}</span>
                <span className={cn("text-[10px] font-mono tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                  {asset.up ? "+" : ""}{asset.change}%
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {analysisStep === "loading" && (
        <motion.div variants={fadeUp} className="space-y-4 py-8">
          {imagePreview && !imagePreview.startsWith("symbol:") && (
            <div className="rounded-xl overflow-hidden border border-border/20 max-h-48">
              <img src={imagePreview} alt="Chart" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-2">
            {loadingSteps.map((step, i) => {
              const Icon = step.icon;
              const active = i === loadingStep;
              const done = i < loadingStep;
              return (
                <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
                  active ? "bg-accent/8 border border-accent/20" : done ? "opacity-50" : "opacity-20"
                )}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-success" /> :
                    active ? <Loader2 className="w-4 h-4 text-accent animate-spin" /> :
                    <Icon className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-[11px] font-mono">{step.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {analysisStep === "results" && analysis && (
        <motion.div variants={fadeUp} className="space-y-3">
          {/* Header */}
          <div className="rounded-xl p-4 border border-border/15 bg-card/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-mono font-bold">{analysis.pair}</span>
                <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{analysis.timeframe}</span>
              </div>
              <span className={cn("text-[11px] font-mono font-bold px-2 py-1 rounded-lg",
                analysis.direction === "bullish" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {analysis.direction === "bullish" ? "↑ صعودي" : "↓ هبوطي"} {analysis.directionConfidence}%
              </span>
            </div>
            {analysis.patternAr && (
              <p className="text-[10px] font-mono text-muted-foreground">نمط: {analysis.patternAr} ({analysis.patternConfidence}%)</p>
            )}
          </div>

          {/* Levels */}
          {(analysis.entry || analysis.stopLoss || analysis.takeProfit1) && (
            <div className="rounded-xl p-3 border border-border/15 bg-card/50 space-y-2">
              {analysis.entry && <div className="flex justify-between"><span className="text-[10px] font-mono text-muted-foreground">الدخول</span><span className="text-[11px] font-mono font-bold">{analysis.entry}</span></div>}
              {analysis.takeProfit1 && <div className="flex justify-between"><span className="text-[10px] font-mono text-success/70">TP1</span><span className="text-[11px] font-mono font-bold text-success">{analysis.takeProfit1}</span></div>}
              {analysis.takeProfit2 && <div className="flex justify-between"><span className="text-[10px] font-mono text-success/70">TP2</span><span className="text-[11px] font-mono font-bold text-success">{analysis.takeProfit2}</span></div>}
              {analysis.stopLoss && <div className="flex justify-between"><span className="text-[10px] font-mono text-destructive/70">SL</span><span className="text-[11px] font-mono font-bold text-destructive">{analysis.stopLoss}</span></div>}
              {analysis.riskReward && <div className="flex justify-between"><span className="text-[10px] font-mono text-muted-foreground">R:R</span><span className="text-[11px] font-mono font-bold text-primary">{analysis.riskReward}</span></div>}
            </div>
          )}

          {/* Summary */}
          {analysis.summary && (
            <div className="rounded-xl p-3 border border-border/15 bg-card/50">
              <p className="text-[10px] font-mono text-foreground/80 leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={resetAnalysis} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-foreground text-[11px] font-mono font-bold border border-border/20">
              <RotateCcw className="w-4 h-4" /> تحليل جديد
            </button>
            <button onClick={shareToFeed} disabled={sharing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-mono font-bold">
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              نشر في المجتمع
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChartAnalysisPage;
