import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const chartAnalysisStages = [
  "قراءة الشارت...",
  "تحليل الاتجاه...",
  "تحديد مستويات الدعم والمقاومة...",
  "تحليل الزخم والمؤشرات...",
  "بناء سيناريو السوق...",
];

interface Props {
  imagePreview?: string | null;
  stage: number;
}

const AnalysisLoadingState = ({ imagePreview, stage }: Props) => (
  <div className="space-y-4">
    {imagePreview && (
      <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
        <img src={imagePreview} alt="صورة الشارت" className="w-full max-h-[320px] object-contain opacity-70" />
        <motion.div
          className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-primary/15 to-transparent"
          animate={{ top: ["-10%", "100%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )}

    <div className="nx-card flex items-center gap-3">
      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
      <motion.p
        key={stage}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="nx-body"
      >
        {chartAnalysisStages[Math.min(stage, chartAnalysisStages.length - 1)]}
      </motion.p>
    </div>
  </div>
);

export default AnalysisLoadingState;
