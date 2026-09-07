import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { AIAnalysisResult } from "./types";

const ScenarioSection = ({ analysis }: { analysis: AIAnalysisResult }) => {
  const { bullishScenario, bearishScenario, waitCondition } = analysis;
  if (!bullishScenario && !bearishScenario && !waitCondition) return null;

  return (
    <section className="space-y-3">
      <h2 className="nx-section">سيناريوهات السوق</h2>
      <Accordion type="single" collapsible className="space-y-3">
        {bullishScenario && (
          <AccordionItem value="bull" className="nx-card !py-0 border-0">
            <AccordionTrigger className="py-4 hover:no-underline nx-card-title text-success">
              السيناريو الصاعد
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="nx-body">{bullishScenario}</p>
            </AccordionContent>
          </AccordionItem>
        )}
        {bearishScenario && (
          <AccordionItem value="bear" className="nx-card !py-0 border-0">
            <AccordionTrigger className="py-4 hover:no-underline nx-card-title text-destructive">
              السيناريو الهابط
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="nx-body">{bearishScenario}</p>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {waitCondition && (
        <div className="nx-card space-y-1.5">
          <p className="nx-label text-primary">متى ننتظر؟</p>
          <p className="nx-body">{waitCondition}</p>
        </div>
      )}
    </section>
  );
};

export default ScenarioSection;
