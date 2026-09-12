import { cn } from "@/lib/utils";
import type { AIAnalysisResult } from "./types";

const NO_LEVEL = "لم يتم اكتشاف مستوى موثوق";

const Column = ({ title, levels, tone }: { title: string; levels?: string[]; tone: string }) => (
  <div className="space-y-1 min-w-0">
    {levels?.length ? (
      levels.map((l, i) => (
        <div key={i} className="flex items-center justify-between gap-3 min-h-[48px] border-b border-border/60 last:border-b-0">
          <p className={cn("nx-label", tone)}>{title}{levels.length > 1 ? ` ${i + 1}` : ""}</p>
          <p className="nx-num text-[15px] nx-ltr break-all text-left">{l}</p>
        </div>
      ))
    ) : (
      <div className="py-3 border-b border-border/60 last:border-b-0">
        <p className={cn("nx-label", tone)}>{title}</p>
        <p className="nx-meta leading-relaxed">{NO_LEVEL}</p>
      </div>
    )}
  </div>
);

const KeyLevelsSection = ({ analysis }: { analysis: AIAnalysisResult }) => (
  <section className="nx-card space-y-4">
    <h2 className="nx-card-title">المستويات المهمة</h2>
    <div>
      <Column title="الدعم" levels={analysis.supportLevels} tone="text-success" />
      <Column title="المقاومة" levels={analysis.resistanceLevels} tone="text-destructive" />
    </div>
  </section>
);

export default KeyLevelsSection;
