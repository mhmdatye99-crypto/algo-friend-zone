import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import Mentor from "./Mentor";
import Academy from "./Academy";

const tabs = [
  { key: "journey", label: "مسار النمو", icon: Route },
  { key: "mentor", label: "المُرشد AI", icon: Brain },
] as const;

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState<"mentor" | "journey">("journey");

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5 border border-border/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-mono font-bold transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
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

      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        {activeTab === "mentor" ? <Mentor /> : <Academy />}
      </motion.div>
    </div>
  );
};

export default LearningPage;
