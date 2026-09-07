import { cn } from "@/lib/utils";
import type { AIAnalysisResult } from "./types";

const NO_LEVEL = "لم يتم اكتشاف مستوى موثوق";

const Column = ({ title, levels, tone }: { title: string; levels?: string[]; tone: string }) => (
  <div className="space-y-2 min-w-0">
    <p className={cn("nx-label", tone)}>{title}</p>
    {levels?.length ? (
      levels.map((l, i) => (
        <p key={i} className="nx-num text-[14px] nx-ltr bg-secondary/60 rounded-lg px-2.5 py-2 text-center truncate">
          {l}
        </p>
      ))
    ) : (
      <p className="nx-meta leading-relaxed">{NO_LEVEL}</p>
    )}
  </div>
);

const KeyLevelsSection = ({ analysis }: { analysis: AIAnalysisResult }) => (
  <section className="nx-card space-y-4">
    <h2 className="nx-card-title">المستويات المهمة</h2>
    <div className="grid grid-cols-2 gap-3">
      <Column title="الدعم" levels={analysis.supportLevels} tone="text-success" />
      <Column title="المقاومة" levels={analysis.resistanceLevels} tone="text-destructive" />
    </div>
  </section>
);

export default KeyLevelsSection;
