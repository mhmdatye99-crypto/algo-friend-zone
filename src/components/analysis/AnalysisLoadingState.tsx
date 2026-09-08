import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const chartAnalysisStages = [
  "تجهيز الصورة",
  "قراءة الشارت",
  "تحديد المستويات",
  "بناء السيناريو",
];

interface Props {
  imagePreview?: string | null;
  /** المرحلة الحالية (0-based) */
  stage: number;
  /** نسبة التقدم الحقيقية 0-100 */
  progress: number;
}

const AnalysisLoadingState = ({ imagePreview, stage, progress }: Props) => {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="space-y-4">
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
          <img src={imagePreview} alt="صورة الشارت" className="w-full max-h-[220px] object-contain opacity-70" />
          <motion.div
            className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-primary/15 to-transparent"
            animate={{ top: ["-10%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      <div className="nx-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="nx-card-title">جارٍ التحليل</h3>
          <span className="nx-num nx-ltr text-primary">{pct}%</span>
        </div>

        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-1">
          {chartAnalysisStages.map((label, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors",
                  active ? "bg-primary/5" : "opacity-55"
                )}
              >
                {done ? (
                  <Check className="w-4 h-4 text-success shrink-0" />
                ) : active ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className={cn("nx-body", active ? "text-foreground font-semibold" : "text-muted-foreground")}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingState;
