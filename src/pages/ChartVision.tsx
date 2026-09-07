import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Sparkles, TrendingUp, Shield, Target, BarChart3,
  ArrowUp, ArrowDown, Minus, CheckCircle2, Loader2, RotateCcw,
  Share2, Bookmark, Bell, Cpu, Layers, Crosshair, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { InsufficientCreditsPopup, BuyCreditsModal } from "@/components/credits/CreditModals";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import AIAnalysisCard from "@/components/analysis/AIAnalysisCard";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";

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
  { label: "جارٍ رفع بيانات الصورة...", icon: Upload },
  { label: "تحديد الزوج والإطار الزمني...", icon: Crosshair },
  { label: "التعرف العصبي على الأنماط...", icon: Cpu },
  { label: "تحليل المؤشرات الفنية...", icon: BarChart3 },
  { label: "حساب مستويات الدعم والمقاومة...", icon: Layers },
  { label: "توليد توصية ألفا...", icon: Target },
];

const ChartVision = () => {
  const [step, setStep] = useState<Step>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [sharing, setSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { credits, spendCredits, canAfford, isFounder } = useCredits();
  const { createPost } = useCommunity();
  const { user } = useAuth();

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
      toast.success("تم نشر تحليلك في غرفة العمليات! 🚀");
    } catch {
      toast.error("فشل النشر، حاول مرة أخرى");
    }
    setSharing(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    // Credit check before analysis
    if (!isFounder && !canAfford(CREDIT_COSTS.chart_analysis)) {
      setShowInsufficient(true);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      // Spend credits
      if (!isFounder) {
        const success = await spendCredits(CREDIT_COSTS.chart_analysis, "chart_analysis", "تحليل شارت بالذكاء الاصطناعي");
        if (!success) {
          setShowInsufficient(true);
          return;
        }
      }
      setImagePreview(base64);
      analyzeChart(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeChart = async (imageBase64: string) => {
    setStep("loading");
    setLoadingStep(0);
    setAnalysis(null);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64 },
      });
      clearInterval(interval);
      setLoadingStep(loadingSteps.length - 1);
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setStep("idle"); return; }
      setAnalysis(data);
      setStep("results");
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      toast.error("فشل التحليل. يرجى المحاولة مرة أخرى.");
      setStep("idle");
    }
  };

  const resetAnalysis = () => {
    setStep("idle");
    setImagePreview(null);
    setAnalysis(null);
    setLoadingStep(0);
  };

  const directionIcon = analysis?.direction === "bullish"
    ? <ArrowUp className="w-4 h-4" />
    : analysis?.direction === "bearish"
      ? <ArrowDown className="w-4 h-4" />
      : <Minus className="w-4 h-4" />;

  const directionColor = analysis?.direction === "bullish"
    ? "text-success"
    : analysis?.direction === "bearish"
      ? "text-destructive"
      : "text-warning";

  return (
    <motion.div
      className="px-4 pt-4 pb-28 max-w-lg mx-auto space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      <AnimatePresence mode="wait">
        {/* الحالة الأولية */}
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-[75vh]">
            {/* القدرات */}
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3 font-mono">قدرات المحرك العصبي</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Target, label: "+50 نمط فني" },
                  { icon: BarChart3, label: "كشف الدعم/المقاومة" },
                  { icon: TrendingUp, label: "تحليل الاتجاه" },
                  { icon: Shield, label: "حساب المخاطر" },
                  { icon: Sparkles, label: "توليد استراتيجية" },
                  { icon: Camera, label: "مسح فوري" },
                ].map((cap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="intel-card rounded-[10px] p-3 flex flex-col items-center gap-2 text-center"
                  >
                    <cap.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider leading-tight">{cap.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* الحالة الفارغة */}
            <div className="intel-card rounded-[10px] p-8 text-center mb-4 flex-1 flex flex-col items-center justify-center">
              <Cpu className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40 animate-pulse" />
              <h4 className="text-xs font-semibold font-mono mb-1">المحرك العصبي في وضع الاستعداد</h4>
              <p className="text-[10px] text-muted-foreground font-mono">
                ارفع صورة شارت لبدء التحليل المؤسسي بالذكاء الاصطناعي
              </p>
            </div>

            {/* Upload Buttons — Bottom of screen for thumb access */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => cameraInputRef.current?.click()}
                className="rounded-[10px] p-4 flex items-center gap-3 transition-all"
                style={{
                  background: "linear-gradient(180deg, hsla(43,100%,50%,0.1) 0%, hsla(43,100%,50%,0.04) 100%)",
                  border: "1px solid hsla(43,100%,50%,0.15)",
                }}
              >
                <div className="w-11 h-11 rounded-[10px] bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-mono font-bold text-primary block">التقاط مباشر</span>
                  <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                    كاميرا الجهاز
                    {!isFounder && <span className="bg-primary/15 text-primary px-1 rounded text-[8px]">{CREDIT_COSTS.chart_analysis}pt</span>}
                  </span>
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[10px] p-4 flex items-center gap-3 transition-all"
                style={{
                  background: "linear-gradient(180deg, hsla(190,100%,50%,0.08) 0%, hsla(190,100%,50%,0.02) 100%)",
                  border: "1px solid hsla(190,100%,50%,0.12)",
                }}
              >
                <div className="w-11 h-11 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-mono font-bold text-accent block">رفع صورة</span>
                  <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                    من المعرض
                    {!isFounder && <span className="bg-accent/15 text-accent px-1 rounded text-[8px]">{CREDIT_COSTS.chart_analysis}pt</span>}
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* التحميل — Camera shutter */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnalysisLoading imagePreview={imagePreview} currentStep={loadingStep} title="جارٍ المعالجة العصبية..." />
          </motion.div>
        )}

        {/* النتائج */}
        {step === "results" && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <AIAnalysisCard analysis={analysis} imagePreview={imagePreview} />

            {/* Execution Shortcuts */}
            <div className="nx-card space-y-3">
              <p className="nx-label">اختصارات التنفيذ</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.binance.com/en/trade/${(analysis.pair || "BTC_USDT").replace("/", "_")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nx-btn-secondary nx-btn-sm"
                >
                  فتح في Binance ↗
                </a>
                <button
                  onClick={() => {
                    const strategy = `${analysis.pair} | ${analysis.directionAr} | Entry: ${analysis.entry} | SL: ${analysis.stopLoss} | TP1: ${analysis.takeProfit1} | TP2: ${analysis.takeProfit2}`;
                    navigator.clipboard.writeText(strategy);
                    toast.success("تم نسخ الاستراتيجية");
                  }}
                  className="nx-btn-secondary nx-btn-sm"
                >
                  نسخ لـ MetaTrader
                </button>
              </div>
            </div>

            {/* الإجراءات */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button whileTap={{ scale: 0.95 }} className="nx-card-flat p-3 flex flex-col items-center gap-1.5 nx-tap">
                <Bookmark className="w-5 h-5 text-primary" />
                <span className="text-[13px] font-semibold">حفظ</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={shareToFeed}
                disabled={sharing}
                className="rounded-xl p-3 flex flex-col items-center gap-1.5 nx-tap bg-primary/12 border border-primary/25"
              >
                {sharing ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Send className="w-5 h-5 text-primary" />}
                <span className="text-[13px] font-bold text-primary">نشر في المجتمع</span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="nx-card-flat p-3 flex flex-col items-center gap-1.5 nx-tap">
                <Bell className="w-5 h-5 text-warning" />
                <span className="text-[13px] font-semibold">تنبيه</span>
              </motion.button>
            </div>

            {/* إعادة التحليل */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={resetAnalysis}
              className="nx-btn-secondary w-full"
            >
              <RotateCcw className="w-4 h-4" />
              تحليل شارت آخر
            </motion.button>
          </motion.div>
        )}
       </AnimatePresence>

      <InsufficientCreditsPopup
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        onBuyCredits={() => setShowBuyCredits(true)}
        requiredCredits={CREDIT_COSTS.chart_analysis}
        currentCredits={credits}
      />
      <BuyCreditsModal
        open={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        currentCredits={credits}
      />
    </motion.div>
  );
};

export default ChartVision;
