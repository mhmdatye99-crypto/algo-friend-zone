import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import TradeJournal from "./TradeJournal";
import MyAnalyses from "./MyAnalyses";

const tabs = [
  { key: "trades", label: "سجل الصفقات" },
  { key: "analyses", label: "التحليلات المحفوظة" },
] as const;

const JournalPage = () => {
  const [activeTab, setActiveTab] = useState<"trades" | "analyses">("trades");

  return (
    <div className="max-w-lg mx-auto pb-32">
      <div className="px-4 sm:px-5 pt-5 space-y-4">
        <h1 className="nx-title">سجل الصفقات</h1>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn("nx-chip flex-1", activeTab === tab.key && "nx-chip-on")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="pt-2"
      >
        {activeTab === "trades" ? <TradeJournal /> : <MyAnalyses />}
      </motion.div>
    </div>
  );
};

export default JournalPage;
