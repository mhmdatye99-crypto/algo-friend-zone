import type { AIAnalysisResult } from "./types";

const ScenarioSection = ({ analysis }: { analysis: AIAnalysisResult }) => {
  const { bullishScenario, bearishScenario, waitCondition } = analysis;
  if (!bullishScenario && !bearishScenario && !waitCondition) return null;

  return (
    <section className="space-y-3">
      <h2 className="nx-section">سيناريوهات السوق</h2>
      <div className="grid gap-2">
        {bullishScenario && (
          <div className="rounded-lg border border-success/25 bg-success/[0.05] p-3">
            <p className="nx-label text-success mb-1">سيناريو صعودي</p>
            <p className="nx-body">{bullishScenario}</p>
          </div>
        )}
        {bearishScenario && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/[0.05] p-3">
            <p className="nx-label text-destructive mb-1">سيناريو هبوطي</p>
            <p className="nx-body">{bearishScenario}</p>
          </div>
        )}
      </div>

      {waitCondition && (
        <div className="rounded-lg border border-primary/25 bg-primary/[0.05] p-3 space-y-1">
          <p className="nx-label text-primary">متى ننتظر؟</p>
          <p className="nx-body">{waitCondition}</p>
        </div>
      )}
    </section>
  );
};

export default ScenarioSection;
