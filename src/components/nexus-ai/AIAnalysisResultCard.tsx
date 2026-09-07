import { useState } from "react";
import { ChevronDown, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBias, NA, type AIAnalysisResult } from "@/components/analysis/types";
import TradeSetupCard from "@/components/analysis/TradeSetupCard";
import KeyLevelsSection from "@/components/analysis/KeyLevelsSection";
import IndicatorSection from "@/components/analysis/IndicatorSection";
import MarketAnalysisSection from "@/components/analysis/MarketAnalysisSection";
import ScenarioSection from "@/components/analysis/ScenarioSection";

/** Renders a real analyze-chart result as structured cards. Never fabricates values. */
const AIAnalysisResultCard = ({ analysis }: { analysis: AIAnalysisResult }) => {
  const [expanded, setExpanded] = useState(false);
  const bias = getBias(analysis);
  const Icon = bias === "long" ? ArrowUp : bias === "short" ? ArrowDown : Minus;
  const tone = bias === "long" ? "text-success" : bias === "short" ? "text-destructive" : "text-primary";
  const label = bias === "long" ? "LONG" : bias === "short" ? "SHORT" : "WAIT";

  return (
    <div className="space-y-3">
      <section className="nx-card-premium space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="nx-num text-[17px] nx-ltr truncate">{analysis.pair || NA}</p>
            <p className="nx-meta nx-ltr">{analysis.timeframe || NA}</p>
          </div>
          <div className={cn("flex items-center gap-1.5", tone)}>
            <Icon className="w-5 h-5" strokeWidth={2.2} />
            <span className="font-mono text-[16px] font-bold">{label}</span>
          </div>
        </div>
        {typeof analysis.directionConfidence === "number" && (
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <p className="nx-label">الثقة</p>
            <p className="nx-num text-[15px] nx-ltr text-primary">{analysis.directionConfidence}%</p>
          </div>
        )}
        {analysis.summary && <p className="nx-body">{analysis.summary}</p>}
      </section>

      <TradeSetupCard analysis={analysis} />

      <button
        onClick={() => setExpanded((v) => !v)}
        className="nx-btn-secondary nx-btn-sm w-full"
        aria-expanded={expanded}
      >
        <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
        {expanded ? "إخفاء التفاصيل الفنية" : "عرض التفاصيل الفنية"}
      </button>

      {expanded && (
        <div className="space-y-3">
          <KeyLevelsSection analysis={analysis} />
          <MarketAnalysisSection analysis={analysis} />
          <IndicatorSection analysis={analysis} />
          <ScenarioSection analysis={analysis} />
        </div>
      )}
    </div>
  );
};

export default AIAnalysisResultCard;
