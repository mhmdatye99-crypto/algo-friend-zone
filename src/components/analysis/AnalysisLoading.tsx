import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export const analysisLoadingSteps = [
  { label: "رفع بيانات الصورة" },
  { label: "تحديد الزوج والإطار الزمني" },
  { label: "التعرف على الأنماط الفنية" },
  { label: "تحليل المؤشرات والزخم" },
  { label: "حساب مستويات الدعم والمقاومة" },
  { label: "توليد التوصية النهائية" },
];

interface Props {
  imagePreview?: string | null;
  currentStep: number;
  title?: string;
}

const AnalysisLoading = ({ imagePreview, currentStep, title = "جارٍ تحليل NEXUS AI..." }: Props) => {
  const total = analysisLoadingSteps.length;
  const progressPct = Math.round(((currentStep + 1) / total) * 100);

  return (
    <div className="space-y-4 py-4">
      {imagePreview && !imagePreview.startsWith("symbol:") && (
        <div className="rounded-2xl overflow-hidden border border-border relative">
          <img src={imagePreview} alt="الشارت" className="w-full h-44 object-cover opacity-50" />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <Cpu className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
        </div>
      )}

      <div className="nx-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="nx-card-title">{title}</h3>
          <span className="nx-num text-primary">{progressPct}%</span>
        </div>

        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="space-y-1">
          {analysisLoadingSteps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  active ? "bg-primary/8" : "opacity-60"
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : active ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border shrink-0" />
                )}
                <span className={cn("nx-body", active ? "text-foreground font-semibold" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;
