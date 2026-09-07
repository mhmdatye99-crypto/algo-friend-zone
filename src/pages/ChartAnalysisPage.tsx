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
import AIAnalysisCard from "@/components/analysis/AIAnalysisCard";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";

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
        <motion.div variants={fadeUp}>
          <AnalysisLoading imagePreview={imagePreview} currentStep={loadingStep} />
        </motion.div>
      )}

      {analysisStep === "results" && analysis && (
        <motion.div variants={fadeUp} className="space-y-3">
          <AIAnalysisCard analysis={analysis} imagePreview={imagePreview} />

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={resetAnalysis} className="nx-btn-secondary nx-btn-sm flex-1">
              <RotateCcw className="w-4 h-4" /> تحليل جديد
            </button>
            <button onClick={shareToFeed} disabled={sharing} className="nx-btn-primary nx-btn-sm flex-1">
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
