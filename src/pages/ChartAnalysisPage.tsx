import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ScanLine, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { saveChartAnalysis } from "@/hooks/useChartAnalyses";
import ChartUploader from "@/components/analysis/ChartUploader";
import ChartPreview from "@/components/analysis/ChartPreview";
import AnalysisLoadingState, { chartAnalysisStages } from "@/components/analysis/AnalysisLoadingState";
import { normalizeAnalysis } from "@/components/analysis/types";
import { Button } from "@/components/ui/button";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(false);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => stopTimer(), []);

  const startAnalysis = async () => {
    if (!image || analyzing) return;
    if (requestRef.current) return;
    if (!isFounder && !canAfford(CREDIT_COSTS.chart_analysis)) {
      toast.error("رصيد غير كافٍ");
      return;
    }
    if (!isFounder) {
      const ok = await spendCredits(CREDIT_COSTS.chart_analysis, "chart_analysis", "تحليل شارت AI");
      if (!ok) return;
    }

    requestRef.current = true;
    setAnalyzing(true);
    setErrorMessage(null);
    setStage(0);
    // رسائل حالة دورية فقط، بدون ادعاء نسبة تقدم غير حقيقية.
    timerRef.current = window.setInterval(() => {
      setStage((current) => (current + 1) % chartAnalysisStages.length);
    }, 2400);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45_000);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64: image },
        signal: controller.signal,
      });
      if (error) throw error;
      const result = normalizeAnalysis(data);
      if (!result) {
        setErrorMessage("لم تتوفر بيانات كافية وموثوقة من الصورة. جرّب لقطة أوضح يظهر فيها الأصل والإطار الزمني ومحور السعر.");
        return;
      }
      if (result?.error) {
        setErrorMessage(result.error);
        return;
      }
      stopTimer();
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
    } catch (error) {
      const timedOut = controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError");
      setErrorMessage(timedOut
        ? "استغرق التحليل وقتاً أطول من المتوقع. أعد المحاولة بصورة أصغر أو أوضح."
        : "تعذر الوصول إلى خدمة التحليل الآن. لم يتم إنشاء أي نتيجة. حاول مرة أخرى.");
    } finally {
      window.clearTimeout(timeout);
      stopTimer();
      setAnalyzing(false);
      requestRef.current = false;
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
          <AnalysisLoadingState imagePreview={image} stage={stage} />
        </motion.div>
      ) : image ? (
        <motion.div variants={fade} className="space-y-3">
          <ChartPreview src={image} />
          {errorMessage && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3.5">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0 space-y-1">
                <p className="nx-label text-destructive">تعذر إكمال التحليل</p>
                <p className="nx-meta text-foreground">{errorMessage}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => { setImage(null); setErrorMessage(null); }} className="nx-btn-secondary flex-1">
              <RefreshCw className="w-5 h-5" /> تغيير الصورة
            </Button>
            <Button variant="ghost" onClick={() => { setImage(null); setErrorMessage(null); }} className="nx-btn-ghost text-destructive px-3">
              <Trash2 className="w-5 h-5" /> حذف
            </Button>
          </div>
          <Button onClick={startAnalysis} disabled={analyzing} className="nx-btn-primary w-full gold-glow">
            <ScanLine className="w-5 h-5" /> بدء التحليل
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={fade}>
          <ChartUploader onSelect={(value) => { setImage(value); setErrorMessage(null); }} onError={(m) => toast.error(m)} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChartAnalysisPage;
