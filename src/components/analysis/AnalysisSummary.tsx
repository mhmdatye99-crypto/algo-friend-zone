import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import ChartPreview from "./ChartPreview";
import { getBias, type AIAnalysisResult } from "./types";

interface Props {
  analysis: AIAnalysisResult;
  imagePreview?: string | null;
  createdAt: string;
}

const AnalysisSummary = ({ analysis, imagePreview, createdAt }: Props) => {
  const bias = getBias(analysis);
  const Icon = bias === "long" ? ArrowUp : bias === "short" ? ArrowDown : Minus;
  const color =
    bias === "long" ? "text-success" : bias === "short" ? "text-destructive" : "text-primary";
  const label = bias === "long" ? "LONG" : bias === "short" ? "SHORT" : "WAIT";
  const confidence =
    typeof analysis.directionConfidence === "number" ? analysis.directionConfidence : null;

  const stamp = new Date(createdAt).toLocaleString("ar", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="relative overflow-hidden nx-card-premium space-y-4 gold-glow">
      <div className="absolute inset-x-0 top-0 h-px bg-primary/70" />
      {imagePreview && <ChartPreview src={imagePreview} compact />}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="nx-meta text-primary nx-ltr">NEXUS VISION</p>
          <p className="nx-section nx-ltr break-words">{analysis.pair || "أصل غير محدد"}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 nx-meta">
            <span className="nx-ltr">{analysis.timeframe || "فريم غير محدد"}</span>
            <span aria-hidden="true">·</span>
            <span className="nx-ltr">{stamp}</span>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 shrink-0 rounded-lg border border-current/25 bg-current/[0.06] px-3 py-2", color)}>
          <Icon className="w-5 h-5" />
          <span className="font-mono text-[22px] font-bold nx-ltr">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
        <div className="min-w-0">
          <p className="nx-label">السعر المكتشف</p>
          <p className="nx-num text-[16px] nx-ltr break-words">{analysis.currentPrice ?? "غير متوفر"}</p>
        </div>
        <div className="min-w-0 text-left">
          <p className="nx-label">ثقة التحليل</p>
          <p className="nx-num text-[16px] nx-ltr">{confidence !== null ? `${confidence}%` : "غير متوفر"}</p>
        </div>
      </div>

      {(analysis.summary || analysis.strategy) && (
        <p className="nx-body text-muted-foreground">{analysis.summary || analysis.strategy}</p>
      )}
    </section>
  );
};

export default AnalysisSummary;
