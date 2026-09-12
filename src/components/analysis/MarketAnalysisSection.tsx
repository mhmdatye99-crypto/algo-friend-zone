import { NA, type AIAnalysisResult } from "./types";

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="min-w-0 rounded-lg border border-border/70 bg-secondary/40 p-3 space-y-1">
    <p className="nx-meta">{label}</p>
    <p className={value ? "nx-body font-semibold break-words" : "nx-body text-muted-foreground"}>{value || NA}</p>
  </div>
);

const MarketAnalysisSection = ({ analysis }: { analysis: AIAnalysisResult }) => (
  <section className="nx-card space-y-2">
    <h2 className="nx-card-title">تحليل السوق</h2>
    <div className="grid grid-cols-2 gap-2">
      <Row label="الاتجاه" value={analysis.trend || analysis.directionAr} />
      <Row label="بنية السوق" value={analysis.marketStructure || analysis.patternAr || analysis.pattern} />
      <Row label="الزخم" value={analysis.momentum} />
      <Row label="التذبذب" value={analysis.volatility} />
    </div>
  </section>
);

export default MarketAnalysisSection;
