import type { AIAnalysisResult } from "./types";

const ReasoningSection = ({ analysis }: { analysis: AIAnalysisResult }) => {
  const points = (analysis.reasoning || []).filter(Boolean).slice(0, 5);
  if (points.length === 0) return null;

  return (
    <section className="nx-card space-y-3">
      <h2 className="nx-card-title">لماذا هذا التحليل؟</h2>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2.5" />
            <p className="nx-body">{p}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReasoningSection;
