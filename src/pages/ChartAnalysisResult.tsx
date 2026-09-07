import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader2, Share2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AnalysisSummary from "@/components/analysis/AnalysisSummary";
import TradeSetupCard from "@/components/analysis/TradeSetupCard";
import MarketAnalysisSection from "@/components/analysis/MarketAnalysisSection";
import KeyLevelsSection from "@/components/analysis/KeyLevelsSection";
import IndicatorSection from "@/components/analysis/IndicatorSection";
import ReasoningSection from "@/components/analysis/ReasoningSection";
import ScenarioSection from "@/components/analysis/ScenarioSection";
import { getBias, toShareable, type AIAnalysisResult } from "@/components/analysis/types";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface ResultState {
  analysis?: AIAnalysisResult;
  imagePreview?: string | null;
  createdAt?: string;
}

const ChartAnalysisResult = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { analysis, imagePreview, createdAt } = (useLocation().state || {}) as ResultState;
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!analysis) navigate("/chart-analysis", { replace: true });
  }, [analysis, navigate]);

  if (!analysis) return null;

  const stamp = createdAt || new Date().toISOString();
  const bias = getBias(analysis);

  const saveAnalysis = async () => {
    if (!user) {
      toast.error("سجّل الدخول لحفظ التحليل");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_analyses").insert({
        user_id: user.id,
        pair: analysis.pair || "غير محدد",
        price: Number(String(analysis.entry ?? "").replace(/[^\d.]/g, "")) || 0,
        direction: bias === "long" ? "صعودي" : bias === "short" ? "هبوطي" : "جانبي",
        confidence: analysis.directionConfidence ?? 0,
        timeframe: analysis.timeframe || "—",
        notes: analysis.summary || analysis.strategy || null,
      });
      if (error) throw error;
      toast.success("تم حفظ التحليل");
    } catch {
      toast.error("تعذر حفظ التحليل");
    }
    setSaving(false);
  };

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

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="nx-page">
      <motion.div variants={fade}>
        <AnalysisSummary analysis={analysis} imagePreview={imagePreview} createdAt={stamp} />
      </motion.div>
      <motion.div variants={fade}><TradeSetupCard analysis={analysis} /></motion.div>
      <motion.div variants={fade}><MarketAnalysisSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><KeyLevelsSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><IndicatorSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><ReasoningSection analysis={analysis} /></motion.div>
      <motion.div variants={fade}><ScenarioSection analysis={analysis} /></motion.div>

      <motion.div variants={fade} className="space-y-3">
        <button onClick={() => navigate("/chart-analysis")} className="nx-btn-primary w-full">
          تحليل شارت جديد
        </button>
        <button onClick={saveAnalysis} disabled={saving} className="nx-btn-secondary w-full">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className="w-5 h-5" />}
          حفظ التحليل
        </button>
        <button onClick={shareResult} className="nx-btn-secondary w-full">
          <Share2 className="w-5 h-5" /> مشاركة النتيجة
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ChartAnalysisResult;
