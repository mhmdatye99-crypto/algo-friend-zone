import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SignalCard from "@/components/signals/SignalCard";
import { useSignals } from "@/hooks/useSignals";
import { Skeleton } from "@/components/ui/skeleton";

const filters = ["الكل", "فوركس", "كريبتو", "سلع", "مؤشرات"];

const Signals = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const { signals } = useSignals();

  const filteredSignals = activeFilter === "الكل"
    ? signals
    : signals.filter(s => s.category === activeFilter);

  return (
    <div className="px-4 pt-4 pb-28 max-w-lg mx-auto">
      {/* الفلاتر */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all duration-300",
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* بطاقات الإشارات */}
      {signals.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {filteredSignals.map((signal) => (
            <SignalCard key={signal.pair} signal={signal} />
          ))}
        </motion.div>
      )}

      {filteredSignals.length === 0 && signals.length > 0 && (
        <p className="text-center text-muted-foreground font-mono text-sm mt-10">
          لا توجد إشارات لهذه الفئة حالياً
        </p>
      )}
    </div>
  );
};

export default Signals;
