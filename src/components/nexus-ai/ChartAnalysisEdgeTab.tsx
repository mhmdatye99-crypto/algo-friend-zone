import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNexusAI } from "@/contexts/NexusAIContext";

/** Half-circle tab attached to the right edge — opens the existing chart image analysis flow. */
const ChartAnalysisEdgeTab = () => {
  const navigate = useNavigate();
  const { open } = useNexusAI();
  const [expanded, setExpanded] = useState(false);

  if (open) return null;

  return (
    <button
      onClick={() => {
        if (!expanded) {
          setExpanded(true);
          window.setTimeout(() => setExpanded(false), 2600);
          return;
        }
        setExpanded(false);
        navigate("/chart-analysis");
      }}
      aria-label="تحليل صورة شارت"
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-[60] h-[76px] flex items-center gap-2",
        "bg-card border border-primary/35 border-r-0 text-primary",
        "rounded-r-none rounded-l-full pl-4 pr-2",
        "shadow-[0_0_20px_-8px_hsl(var(--primary))] transition-all duration-300 active:scale-[0.98]",
        expanded ? "w-[132px]" : "w-[38px]"
      )}
      style={{ direction: "rtl" }}
    >
      <ScanLine className="w-5 h-5 shrink-0 -mr-1.5" strokeWidth={1.8} />
      <span
        className={cn(
          "text-[13px] font-semibold whitespace-nowrap transition-opacity duration-200",
          expanded ? "opacity-100" : "opacity-0"
        )}
      >
        تحليل صورة
      </span>
    </button>
  );
};

export default ChartAnalysisEdgeTab;
