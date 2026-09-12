import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

export const chartAnalysisStages = [
  "قراءة الشارت...",
  "تحليل اتجاه السوق...",
  "تحديد المستويات المهمة...",
  "تحليل الزخم...",
  "بناء سيناريو السوق...",
];

interface Props {
  imagePreview?: string | null;
  /** المرحلة الحالية (0-based) */
  stage: number;
}

const AnalysisLoadingState = ({ imagePreview, stage }: Props) => {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-secondary/30 gold-glow">
          <img src={imagePreview} alt="صورة الشارت قيد التحليل" className="block w-full max-h-[420px] object-contain opacity-75" />
          <motion.div
            className="absolute inset-x-0 h-px bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.8)]"
            animate={{ top: ["4%", "96%", "4%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-primary/15 pointer-events-none" />
        </div>
      )}

      <div className="rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <ScanLine className="w-5 h-5 text-primary animate-pulse" />
          </span>
          <div className="min-w-0">
            <p className="nx-meta text-primary">NEXUS VISION</p>
            <motion.p key={stage} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="nx-card-title">
              {chartAnalysisStages[stage] ?? chartAnalysisStages[chartAnalysisStages.length - 1]}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingState;
