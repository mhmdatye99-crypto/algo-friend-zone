import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { saveChartAnalysis } from "@/hooks/useChartAnalyses";
import ChartUploader from "@/components/analysis/ChartUploader";
import ChartPreview from "@/components/analysis/ChartPreview";
import ChartTips from "@/components/analysis/ChartTips";
import AnalysisLoadingState, { chartAnalysisStages } from "@/components/analysis/AnalysisLoadingState";
import type { AIAnalysisResult } from "@/components/analysis/types";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const ChartAnalysisPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { spendCredits, canAfford, isFounder } = useCredits();

  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => stopTimer(), []);

  const startAnalysis = async () => {
    if (!image || analyzing) return;
    if (!isFounder && !canAfford(CREDIT_COSTS.chart_analysis)) {
      toast.error("رصيد غير كافٍ");
      return;
    }
    if (!isFounder) {
      const ok = await spendCredits(CREDIT_COSTS.chart_analysis, "chart_analysis", "تحليل شارت AI");
      if (!ok) return;
    }

    setAnalyzing(true);
    // مرحلة 1: تجهيز الصورة (مكتملة فعلياً بمجرد بدء الإرسال)
    setStage(0);
    setProgress(6);

    window.setTimeout(() => {
      setStage(1);
      setProgress(22);
    }, 250);

    // تقدّم تدريجي محسوب حتى وصول الرد الحقيقي (لا يتجاوز 90%)
    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = p + Math.max(0.6, (90 - p) * 0.06);
        const capped = Math.min(next, 90);
        setStage(capped > 70 ? 3 : capped > 45 ? 2 : 1);
        return capped;
      });
    }, 400);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64: image },
      });
      if (error) throw error;
      const result = data as AIAnalysisResult;
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      stopTimer();
      setStage(chartAnalysisStages.length);
      setProgress(100);
      const createdAt = new Date().toISOString();
      // تسجيل التحليل تلقائياً في المحفوظات والإشارات
      let savedId: string | null = null;
      if (user) {
        try {
          savedId = await saveChartAnalysis(user.id, result);
          queryClient.invalidateQueries({ queryKey: ["chart-analyses"] });
          queryClient.invalidateQueries({ queryKey: ["saved-analyses"] });
        } catch {
          toast.error("تم التحليل لكن تعذر حفظه في المحفوظات");
        }
      }
      await new Promise((r) => setTimeout(r, 350));
      navigate(savedId ? `/chart-analysis/result/${savedId}` : "/chart-analysis/result", {
        state: { analysis: result, imagePreview: image, createdAt, savedId },
      });
    } catch {
      toast.error("فشل التحليل. حاول مرة أخرى.");
    } finally {
      stopTimer();
      setAnalyzing(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="nx-page">
      <motion.header variants={fade} className="space-y-1">
        <h1 className="nx-section">تحليل الشارت</h1>
        <p className="nx-body text-muted-foreground">
          ارفع صورة واضحة للشارت ودع NEXUS يحلل البيانات الظاهرة.
        </p>
      </motion.header>

      {analyzing ? (
        <motion.div variants={fade}>
          <AnalysisLoadingState imagePreview={image} stage={stage} progress={progress} />
        </motion.div>
      ) : image ? (
        <motion.div variants={fade} className="space-y-3">
          <ChartPreview src={image} />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setImage(null)} className="nx-btn-secondary">
              <RefreshCw className="w-5 h-5" /> تغيير الصورة
            </button>
            <button onClick={() => setImage(null)} className="nx-btn-secondary text-destructive">
              <Trash2 className="w-5 h-5" /> حذف
            </button>
          </div>
          <button onClick={startAnalysis} className="nx-btn-primary w-full">
            بدء التحليل
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fade}>
            <ChartUploader onSelect={setImage} onError={(m) => toast.error(m)} />
          </motion.div>

          <motion.div variants={fade}>
            <ChartTips />
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ChartAnalysisPage;
