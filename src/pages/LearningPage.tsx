import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, GraduationCap, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import Mentor from "./Mentor";
import Academy from "./Academy";

const tabs = [
  { key: "mentor", label: "المُرشد AI", icon: Brain },
  { key: "academy", label: "الأكاديمية", icon: GraduationCap },
] as const;

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState<"mentor" | "academy">("mentor");

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-warning" />
          <h1 className="text-base font-bold">التعلم والإرشاد</h1>
        </div>
        <div className="flex gap-1.5 bg-secondary/30 rounded-xl p-1 border border-border/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-mono font-bold transition-all",
                  activeTab === tab.key
                    ? "bg-warning/15 text-warning border border-warning/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === "mentor" ? <Mentor /> : <Academy />}
      </motion.div>
    </div>
  );
};

export default LearningPage;
