import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, ImageIcon, Loader2, RotateCcw, Share2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useCommunity } from "@/hooks/useCommunity";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AIAnalysisCard from "@/components/analysis/AIAnalysisCard";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";
import type { AIAnalysisResult } from "@/components/analysis/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

type AnalysisStep = "idle" | "loading" | "results";

const STAGE_COUNT = 4;

const ChartAnalysisPage = () => {
  const { user } = useAuth();
  const { spendCredits, canAfford, isFounder } = useCredits();
  const { createPost } = useCommunity();

  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sharing, setSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const startAnalysis = async () => {
    if (!imagePreview) return;
    if (!isFounder && !canAfford(CREDIT_COSTS.chart_analysis)) {
      toast.error("رصيد غير كافٍ");
      return;
    }
    if (!isFounder) {
      const ok = await spendCredits(CREDIT_COSTS.chart_analysis, "chart_analysis", "تحليل شارت AI");
      if (!ok) return;
    }

    setAnalysisStep("loading");
    setLoadingStep(0);
    setAnalysis(null);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev >= STAGE_COUNT - 1 ? prev : prev + 1));
    }, 900);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64: imagePreview },
      });
      clearInterval(interval);
      setLoadingStep(STAGE_COUNT - 1);
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setAnalysisStep("idle");
        return;
      }
      setAnalysis(data);
      setAnalysisStep("results");
    } catch {
      clearInterval(interval);
      toast.error("فشل التحليل. حاول مرة أخرى.");
      setAnalysisStep("idle");
    }
  };

  const resetAnalysis = () => {
    setAnalysisStep("idle");
    setImagePreview(null);
    setAnalysis(null);
    setLoadingStep(0);
  };

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
      toast.success("تم حفظ التحليل ونشره في المجتمع");
    } catch {
      toast.error("فشل النشر");
    }
    setSharing(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="nx-page"
    >
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {analysisStep === "idle" && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div>
            <h1 className="sr-only">تحليل الشارت</h1>
            <p className="nx-body text-muted-foreground">
              ارفع صورة الشارت واحصل على تحليل منظم للسوق.
            </p>
          </div>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <img src={imagePreview} alt="معاينة الشارت" className="w-full object-cover max-h-72" />
              <button
                onClick={() => setImagePreview(null)}
                aria-label="إزالة الصورة"
                className="absolute top-3 left-3 w-11 h-11 rounded-xl bg-background/90 border border-border flex items-center justify-center"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center space-y-3 bg-card/40">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7 text-primary" strokeWidth={1.8} />
              </div>
              <p className="nx-card-title">ارفع صورة الشارت</p>
              <p className="nx-meta">PNG / JPG</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="nx-btn-secondary">
              <Upload className="w-5 h-5" /> اختيار صورة
            </button>
            <button onClick={() => cameraInputRef.current?.click()} className="nx-btn-secondary">
              <Camera className="w-5 h-5" /> الكاميرا
            </button>
          </div>

          <button onClick={startAnalysis} disabled={!imagePreview} className="nx-btn-primary w-full">
            بدء التحليل
          </button>
        </motion.div>
      )}

      {analysisStep === "loading" && (
        <motion.div variants={fadeUp}>
          <AnalysisLoading imagePreview={imagePreview} currentStep={loadingStep} />
        </motion.div>
      )}

      {analysisStep === "results" && analysis && (
        <motion.div variants={fadeUp} className="space-y-4">
          <AIAnalysisCard analysis={analysis} imagePreview={imagePreview} />

          <div className="space-y-3">
            <button onClick={shareToFeed} disabled={sharing} className="nx-btn-primary w-full">
              {sharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              حفظ التحليل
            </button>
            <button onClick={resetAnalysis} className="nx-btn-secondary w-full">
              <RotateCcw className="w-5 h-5" /> تحليل شارت جديد
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChartAnalysisPage;
