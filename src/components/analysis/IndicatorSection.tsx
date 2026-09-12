import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { AIAnalysisResult } from "./types";

const NOT_VISIBLE = "غير ظاهر في الشارت";

const IndicatorSection = ({ analysis }: { analysis: AIAnalysisResult }) => {
  const detected = (analysis.indicators || []).filter((i) => i?.name && i.detected !== false);

  return (
    <Accordion type="single" collapsible className="nx-card !py-0">
      <AccordionItem value="indicators" className="border-0">
        <AccordionTrigger className="py-4 hover:no-underline nx-card-title">المؤشرات</AccordionTrigger>
        <AccordionContent className="pb-4">
          {detected.length === 0 ? (
            <p className="nx-body text-muted-foreground">{NOT_VISIBLE}</p>
          ) : (
            <div>
              {detected.map((ind, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 min-h-[48px] border-b border-border/60 last:border-b-0"
                >
                  <p className="nx-body nx-ltr shrink-0">{ind.name}</p>
                  <p className="nx-body text-muted-foreground break-words text-left min-w-0">
                    {[ind.value, ind.signal].filter(Boolean).join(" · ") || NOT_VISIBLE}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default IndicatorSection;
