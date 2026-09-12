import { cn } from "@/lib/utils";
import { NA, type AIAnalysisResult } from "./types";

const Cell = ({ label, value, tone }: { label: string; value?: string | null; tone?: string }) => (
  <div className="min-w-0 space-y-1">
    <p className="nx-meta">{label}</p>
    <p className={cn("nx-num text-[clamp(14px,4.5vw,19px)] nx-ltr break-words leading-tight", value ? tone : "text-muted-foreground")}>
      {value || NA}
    </p>
  </div>
);

const TradeSetupCard = ({ analysis }: { analysis: AIAnalysisResult }) => (
  <section className="nx-card space-y-4">
    <h2 className="nx-card-title">إعداد الصفقة</h2>
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      <Cell label="الدخول" value={analysis.entry} tone="text-foreground" />
      <Cell label="وقف الخسارة" value={analysis.stopLoss} tone="text-destructive" />
      <Cell label="الهدف الأول" value={analysis.takeProfit1} tone="text-success" />
      <Cell label="الهدف الثاني" value={analysis.takeProfit2} tone="text-success" />
    </div>
    <div className="flex items-center justify-between border-t border-border/60 pt-3">
      <p className="nx-label">المخاطرة : العائد</p>
      <p className={cn("nx-num text-[15px] nx-ltr", analysis.riskReward ? "text-primary" : "text-muted-foreground")}>
        {analysis.riskReward || NA}
      </p>
    </div>
  </section>
);

export default TradeSetupCard;
