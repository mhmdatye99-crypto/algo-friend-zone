import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Check, Loader2, Plus, Share2 } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AnalysisSummary from "@/components/analysis/AnalysisSummary";
import TradeSetupCard from "@/components/analysis/TradeSetupCard";
import MarketAnalysisSection from "@/components/analysis/MarketAnalysisSection";
import KeyLevelsSection from "@/components/analysis/KeyLevelsSection";
import IndicatorSection from "@/components/analysis/IndicatorSection";
import ReasoningSection from "@/components/analysis/ReasoningSection";
import ScenarioSection from "@/components/analysis/ScenarioSection";
import { toShareable, type AIAnalysisResult } from "@/components/analysis/types";
import { useChartAnalysis } from "@/hooks/useChartAnalyses";
import { saveChartAnalysis } from "@/hooks/useChartAnalyses";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const state = (useLocation().state || {}) as ResultState;
  const { data: saved, isLoading } = useChartAnalysis(state.analysis ? undefined : id);

  const analysis = state.analysis ?? saved?.analysis ?? null;
  const stamp = state.createdAt ?? saved?.created_at ?? new Date().toISOString();
  const imagePreview = state.imagePreview ?? null;
  const [savedId, setSavedId] = useState<string | null>(state.savedId ?? id ?? null);
  const [saving, setSaving] = useState(false);
  const isSaved = Boolean(savedId);

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

  const saveResult = async () => {
    if (!user || isSaved || saving) return;
    setSaving(true);
    try {
      const createdId = await saveChartAnalysis(user.id, analysis);
      setSavedId(createdId);
      toast.success("تم حفظ التحليل في محفوظاتك");
    } catch {
      toast.error("تعذر حفظ التحليل. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="nx-page">
      <motion.div variants={fade}>
        <AnalysisSummary analysis={analysis} imagePreview={imagePreview} createdAt={stamp} />
      </motion.div>
      <motion.div variants={fade}><TradeSetupCard analysis={analysis} /></motion.div>

      {isSaved && (
        <motion.div variants={fade} className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2">
          <Bookmark className="w-4 h-4 text-primary shrink-0" />
          <p className="nx-meta text-foreground">محفوظ في محفوظاتك ومُدرج ضمن إشارات الشارت.</p>
        </motion.div>
      )}

      <motion.div variants={fade}><ReasoningSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><MarketAnalysisSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><KeyLevelsSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><IndicatorSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><ScenarioSection analysis={analysis} /></motion.div>

      <motion.div variants={fade} className="space-y-3">
        <Button onClick={() => navigate("/chart-analysis")} className="nx-btn-primary w-full gold-glow">
          <Plus className="w-5 h-5" /> تحليل شارت جديد
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={saveResult} disabled={isSaved || saving} variant="secondary" className="nx-btn-secondary min-w-0 px-3">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <Check className="w-5 h-5 text-success" /> : <Bookmark className="w-5 h-5" />}
            {isSaved ? "تم الحفظ" : "حفظ التحليل"}
          </Button>
          <Button onClick={shareResult} variant="secondary" className="nx-btn-secondary min-w-0 px-3">
            <Share2 className="w-5 h-5" /> مشاركة
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChartAnalysisResult;
