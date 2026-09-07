import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import ChartUploader from "@/components/analysis/ChartUploader";
import ChartPreview from "@/components/analysis/ChartPreview";
import AnalysisLoadingState, { chartAnalysisStages } from "@/components/analysis/AnalysisLoadingState";
import type { AIAnalysisResult } from "@/components/analysis/types";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const TIPS = [
  "استخدم صورة واضحة",
  "تأكد من ظهور السعر والفريم",
  "أظهر المؤشرات التي تريد تحليلها",
];

const ChartAnalysisPage = () => {
  const navigate = useNavigate();
  const { spendCredits, canAfford, isFounder } = useCredits();

  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

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
    setStage(0);
    timerRef.current = window.setInterval(() => {
      setStage((s) => (s >= chartAnalysisStages.length - 1 ? s : s + 1));
    }, 1600);

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
      navigate("/chart-analysis/result", {
        state: { analysis: result, imagePreview: image, createdAt: new Date().toISOString() },
      });
    } catch {
      toast.error("فشل التحليل. حاول مرة أخرى.");
    } finally {
      if (timerRef.current) window.clearInterval(timerRef.current);
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
          <AnalysisLoadingState imagePreview={image} stage={stage} />
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

          <motion.section variants={fade} className="space-y-2 px-1">
            <p className="nx-label">لأفضل نتيجة</p>
            <ul className="space-y-1.5">
              {TIPS.map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0 mt-2.5" />
                  <p className="nx-body text-muted-foreground">{t}</p>
                </li>
              ))}
            </ul>
          </motion.section>
        </>
      )}
    </motion.div>
  );
};

export default ChartAnalysisPage;
