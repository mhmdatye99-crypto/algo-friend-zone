import { cn } from "@/lib/utils";
import {
  Sparkles, ArrowUp, ArrowDown, Minus, Shield, Gauge,
  TrendingUp, CheckCircle2, Target,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { AIAnalysisResult } from "./types";

interface Props {
  analysis: AIAnalysisResult;
  imagePreview?: string | null;
}

const riskLevel = (confidence?: number) => {
  const c = confidence ?? 0;
  if (c >= 75) return { label: "منخفض", cls: "text-success" };
  if (c >= 50) return { label: "متوسط", cls: "text-warning" };
  return { label: "مرتفع", cls: "text-destructive" };
};

const momentumLevel = (confidence?: number) => {
  const c = confidence ?? 0;
  if (c >= 75) return "قوي";
  if (c >= 50) return "متوسط";
  return "ضعيف";
};

const AIAnalysisCard = ({ analysis, imagePreview }: Props) => {
  const isBullish = analysis.direction === "bullish";
  const isBearish = analysis.direction === "bearish";
  const dirColor = isBullish ? "text-success" : isBearish ? "text-destructive" : "text-warning";
  const dirBadge = isBullish ? "nx-badge-long" : isBearish ? "nx-badge-short" : "nx-badge-wait";
  const DirIcon = isBullish ? ArrowUp : isBearish ? ArrowDown : Minus;
  const risk = riskLevel(analysis.directionConfidence);
  const hasLevels = (analysis.supportLevels?.length || 0) > 0 || (analysis.resistanceLevels?.length || 0) > 0;
  const hasSetup = analysis.entry || analysis.stopLoss || analysis.takeProfit1 || analysis.takeProfit2 || analysis.riskReward;

  return (
    <div className="nx-card-premium space-y-5">
      {imagePreview && !imagePreview.startsWith("symbol:") && (
        <div className="rounded-2xl overflow-hidden border border-border relative -mt-1">
          <img src={imagePreview} alt="الشارت" className="w-full h-40 object-cover" />
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-lg nx-meta text-primary border border-primary/20">
            تحليل مكتمل
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="nx-card-title leading-tight">تحليل NEXUS AI</p>
            <p className="nx-meta">
              <span className="nx-ltr font-mono">{analysis.pair || "—"}</span>
              {analysis.timeframe && <span> · {analysis.timeframe}</span>}
            </p>
          </div>
        </div>
        <span className={cn(dirBadge, "shrink-0")}>
          <DirIcon className="w-3.5 h-3.5" />
          {analysis.directionAr || (isBullish ? "صعودي" : isBearish ? "هبوطي" : "محايد")}
        </span>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="nx-card-flat p-2.5 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground">الاتجاه</p>
          <p className={cn("text-[13px] font-bold flex items-center justify-center gap-1", dirColor)}>
            <DirIcon className="w-3.5 h-3.5" />
          </p>
        </div>
        <div className="nx-card-flat p-2.5 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground">الثقة</p>
          <p className="nx-num text-[15px] text-primary">{analysis.directionConfidence ?? "—"}%</p>
        </div>
        <div className="nx-card-flat p-2.5 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground">الزخم</p>
          <p className="text-[13px] font-bold">{momentumLevel(analysis.directionConfidence)}</p>
        </div>
        <div className="nx-card-flat p-2.5 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground">المخاطر</p>
          <p className={cn("text-[13px] font-bold", risk.cls)}>{risk.label}</p>
        </div>
      </div>

      {/* Summary */}
      {(analysis.summary || analysis.strategy) && (
        <div className="space-y-1.5">
          <p className="nx-label flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> ملخص التحليل
          </p>
          <p className="nx-body">{analysis.summary || analysis.strategy}</p>
        </div>
      )}

      {/* Expandable sections */}
      <Accordion type="multiple" className="w-full space-y-2">
        {hasLevels && (
          <AccordionItem value="levels" className="nx-card-flat border-0 px-3">
            <AccordionTrigger className="py-3 hover:no-underline nx-label">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" /> المستويات المهمة
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <p className="text-[12px] font-semibold text-success">الدعم</p>
                  {analysis.supportLevels?.length ? analysis.supportLevels.map((l, i) => (
                    <div key={i} className="nx-num text-[13px] text-success bg-success/8 rounded-lg px-2 py-1.5 nx-ltr text-center">
                      {l}
                    </div>
                  )) : <p className="nx-meta">لا توجد بيانات</p>}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[12px] font-semibold text-destructive">المقاومة</p>
                  {analysis.resistanceLevels?.length ? analysis.resistanceLevels.map((l, i) => (
                    <div key={i} className="nx-num text-[13px] text-destructive bg-destructive/8 rounded-lg px-2 py-1.5 nx-ltr text-center">
                      {l}
                    </div>
                  )) : <p className="nx-meta">لا توجد بيانات</p>}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasSetup && (
          <AccordionItem value="setup" className="nx-card-flat border-0 px-3">
            <AccordionTrigger className="py-3 hover:no-underline nx-label">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" /> إعداد الصفقة
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {analysis.entry && (
                  <div className="bg-secondary rounded-lg p-2.5">
                    <p className="text-[11px] text-muted-foreground">الدخول</p>
                    <p className="nx-num text-[14px] nx-ltr">{analysis.entry}</p>
                  </div>
                )}
                {analysis.stopLoss && (
                  <div className="bg-destructive/8 rounded-lg p-2.5">
                    <p className="text-[11px] text-destructive/80">وقف الخسارة</p>
                    <p className="nx-num text-[14px] text-destructive nx-ltr">{analysis.stopLoss}</p>
                  </div>
                )}
                {analysis.takeProfit1 && (
                  <div className="bg-success/8 rounded-lg p-2.5">
                    <p className="text-[11px] text-success/80">الهدف 1</p>
                    <p className="nx-num text-[14px] text-success nx-ltr">{analysis.takeProfit1}</p>
                  </div>
                )}
                {analysis.takeProfit2 && (
                  <div className="bg-success/8 rounded-lg p-2.5">
                    <p className="text-[11px] text-success/80">الهدف 2</p>
                    <p className="nx-num text-[14px] text-success nx-ltr">{analysis.takeProfit2}</p>
                  </div>
                )}
                {analysis.riskReward && (
                  <div className="bg-primary/8 rounded-lg p-2.5 col-span-2 flex items-center justify-between">
                    <p className="text-[12px] text-primary/90 font-semibold">نسبة المخاطرة:العائد</p>
                    <p className="nx-num text-[14px] text-primary nx-ltr">{analysis.riskReward}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {analysis.reasoning && analysis.reasoning.length > 0 && (
          <AccordionItem value="reasoning" className="nx-card-flat border-0 px-3">
            <AccordionTrigger className="py-3 hover:no-underline nx-label">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-primary" /> لماذا هذه الإشارة؟
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                {analysis.reasoning.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="nx-body text-[14px]">{r}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {analysis.indicators && analysis.indicators.length > 0 && (
          <AccordionItem value="indicators" className="nx-card-flat border-0 px-3 last:border-b-0">
            <AccordionTrigger className="py-3 hover:no-underline nx-label">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" /> المؤشرات الفنية
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.indicators.map((ind, i) => (
                  <span
                    key={i}
                    className={cn(
                      "nx-badge",
                      ind.signal === "buy" || ind.signal === "bullish" ? "nx-badge-long" :
                      ind.signal === "sell" || ind.signal === "bearish" ? "nx-badge-short" :
                      "nx-badge-neutral"
                    )}
                  >
                    {ind.name}{ind.value ? ` · ${ind.value}` : ""}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default AIAnalysisCard;
