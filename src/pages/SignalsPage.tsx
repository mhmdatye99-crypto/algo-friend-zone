import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, AlertTriangle, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSignals } from "@/hooks/useSignals";
import SignalCard from "@/components/signals/SignalCard";
import { Skeleton } from "@/components/ui/skeleton";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1 } },
};

type FilterKey = "all" | "long" | "short" | "confidence";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "long", label: "LONG" },
  { key: "short", label: "SHORT" },
  { key: "confidence", label: "الأعلى ثقة" },
];

const SignalsPage = () => {
  const navigate = useNavigate();
  const { signals } = useSignals();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const bullish = signals.filter((s) => s.direction === "صعودي").length;
  const bearish = signals.length - bullish;

  const filtered = useMemo(() => {
    let list = signals.filter(
      (s) => !search || s.pair.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "long") list = list.filter((s) => s.direction === "صعودي");
    if (filter === "short") list = list.filter((s) => s.direction === "هبوطي");
    if (filter === "confidence") list = [...list].sort((a, b) => b.confidence - a.confidence);
    return list;
  }, [signals, search, filter]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="nx-page"
    >
      {/* Summary */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="nx-badge-long">
          <span className="font-mono font-bold tabular-nums nx-ltr">{bullish}</span>
          <span>LONG</span>
        </div>
        <div className="nx-badge-short">
          <span className="font-mono font-bold tabular-nums nx-ltr">{bearish}</span>
          <span>SHORT</span>
        </div>
      </motion.div>

      {/* Chart analysis entry */}
      <motion.div variants={fade}>
        <button onClick={() => navigate("/chart-analysis")} className="nx-btn-secondary w-full">
          <ScanLine className="w-5 h-5 text-primary" /> تحليل شارت
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={fade} className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن أصل..."
          className="nx-input pr-11 pl-11"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="مسح"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted-foreground"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fade} className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn("nx-chip", filter === f.key && "nx-chip-on")}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Cards */}
      {signals.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="nx-body text-muted-foreground">لا توجد إشارات مطابقة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((signal) => (
            <SignalCard key={signal.pair} signal={signal} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-1">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="nx-meta leading-relaxed">
          جميع الإشارات لأغراض تعليمية فقط ولا تشكل نصيحة مالية.
        </p>
      </div>
    </motion.div>
  );
};

export default SignalsPage;
