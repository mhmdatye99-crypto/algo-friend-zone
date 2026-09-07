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
    <section className="nx-card-premium space-y-4">
      {imagePreview && <ChartPreview src={imagePreview} compact />}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="nx-card-title nx-ltr truncate">{analysis.pair || "أصل غير محدد"}</p>
          <p className="nx-meta">
            {analysis.timeframe ? <span className="nx-ltr">{analysis.timeframe}</span> : "فريم غير محدد"}
            {" · "}
            <span className="nx-ltr">{stamp}</span>
          </p>
        </div>
        <div className={cn("flex items-center gap-1.5 shrink-0", color)}>
          <Icon className="w-5 h-5" />
          <span className="font-mono text-[22px] font-bold nx-ltr">{label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <p className="nx-label">ثقة التحليل</p>
        <p className="nx-num text-[16px] nx-ltr">{confidence !== null ? `${confidence}%` : "غير متوفر"}</p>
      </div>

      {(analysis.summary || analysis.strategy) && (
        <p className="nx-body text-muted-foreground">{analysis.summary || analysis.strategy}</p>
      )}
    </section>
  );
};

export default AnalysisSummary;
