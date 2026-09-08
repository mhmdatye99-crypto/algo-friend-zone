import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader2, Share2, Signal } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AnalysisSummary from "@/components/analysis/AnalysisSummary";
import TradeSetupCard from "@/components/analysis/TradeSetupCard";
import MarketAnalysisSection from "@/components/analysis/MarketAnalysisSection";
import KeyLevelsSection from "@/components/analysis/KeyLevelsSection";
import IndicatorSection from "@/components/analysis/IndicatorSection";
import ReasoningSection from "@/components/analysis/ReasoningSection";
import ScenarioSection from "@/components/analysis/ScenarioSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toShareable, type AIAnalysisResult } from "@/components/analysis/types";
import { useChartAnalysis } from "@/hooks/useChartAnalyses";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface ResultState {
  analysis?: AIAnalysisResult;
  imagePreview?: string | null;
  createdAt?: string;
  savedId?: string | null;
}

const ChartAnalysisResult = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const state = (useLocation().state || {}) as ResultState;
  const { data: saved, isLoading } = useChartAnalysis(state.analysis ? undefined : id);

  const analysis = state.analysis ?? saved?.analysis ?? null;
  const stamp = state.createdAt ?? saved?.created_at ?? new Date().toISOString();
  const imagePreview = state.imagePreview ?? null;
  const isSaved = Boolean(state.savedId || id);

  useEffect(() => {
    if (!analysis && !isLoading && !id) navigate("/chart-analysis", { replace: true });
    if (!analysis && !isLoading && id && saved === null) navigate("/journal", { replace: true });
  }, [analysis, isLoading, id, saved, navigate]);

  if (!analysis) {
    return (
      <div className="nx-page flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const shareResult = async () => {
    const s = toShareable(analysis, stamp);
    const text = [
      `NEXUS — تحليل الشارت`,
      `${s.pair ?? "أصل غير محدد"}${s.timeframe ? ` · ${s.timeframe}` : ""}`,
      `${s.bias.toUpperCase()}${s.confidence !== null ? ` · ثقة ${s.confidence}%` : ""}`,
      s.entry ? `الدخول: ${s.entry}` : null,
      s.stopLoss ? `الوقف: ${s.stopLoss}` : null,
      s.takeProfit1 ? `الهدف 1: ${s.takeProfit1}` : null,
      s.takeProfit2 ? `الهدف 2: ${s.takeProfit2}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) await navigator.share({ title: "NEXUS", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("تم نسخ النتيجة");
      }
    } catch {
      /* المستخدم ألغى المشاركة */
    }
  };

  const details: { id: string; label: string; node: JSX.Element }[] = [
    { id: "market", label: "قراءة السوق", node: <MarketAnalysisSection analysis={analysis} /> },
    { id: "levels", label: "المستويات المهمة", node: <KeyLevelsSection analysis={analysis} /> },
    { id: "indicators", label: "المؤشرات", node: <IndicatorSection analysis={analysis} /> },
    { id: "reasoning", label: "لماذا هذا التحليل؟", node: <ReasoningSection analysis={analysis} /> },
    { id: "scenarios", label: "السيناريوهات", node: <ScenarioSection analysis={analysis} /> },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="nx-page">
      <motion.div variants={fade}>
        <AnalysisSummary analysis={analysis} imagePreview={imagePreview} createdAt={stamp} />
      </motion.div>
      <motion.div variants={fade}><TradeSetupCard analysis={analysis} /></motion.div>

      {isSaved && (
        <motion.div variants={fade} className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2">
          <Bookmark className="w-4 h-4 text-primary shrink-0" />
          <p className="nx-meta text-foreground">محفوظ في محفوظاتي ومُدرج كإشارة في قسم الإشارات لتتبعه.</p>
        </motion.div>
      )}

      <motion.div variants={fade}>
        <p className="nx-label mb-2">تفاصيل إضافية</p>
        <Accordion type="single" collapsible className="space-y-2">
          {details.map((d) => (
            <AccordionItem key={d.id} value={d.id} className="border border-border rounded-xl px-3 bg-card/40">
              <AccordionTrigger className="nx-body font-semibold py-3 hover:no-underline text-right">
                {d.label}
              </AccordionTrigger>
              <AccordionContent className="pb-3">{d.node}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div variants={fade} className="space-y-3">
        <button onClick={() => navigate("/signals?tab=mine")} className="nx-btn-primary w-full">
          <Signal className="w-5 h-5" /> فتح في الإشارات
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/chart-analysis")} className="nx-btn-secondary">
            تحليل جديد
          </button>
          <button onClick={shareResult} className="nx-btn-secondary">
            <Share2 className="w-5 h-5" /> مشاركة
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChartAnalysisResult;
