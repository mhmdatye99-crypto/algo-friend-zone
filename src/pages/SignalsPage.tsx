import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, SlidersHorizontal, Zap, Shield, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignals } from "@/hooks/useSignals";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const categoryFilters = ["الكل", "فوركس", "كريبتو", "سلع", "مؤشرات"];

const SignalsPage = () => {
  const { signals } = useSignals();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [confidenceFilter, setConfidenceFilter] = useState<"all" | "80+" | "70+" | "60+">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "منخفض" | "متوسط" | "مرتفع">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const confMin = confidenceFilter === "80+" ? 80 : confidenceFilter === "70+" ? 70 : confidenceFilter === "60+" ? 60 : 0;
    return signals
      .filter(s => category === "الكل" || s.category === category)
      .filter(s => !search || s.pair.toLowerCase().includes(search.toLowerCase()))
      .filter(s => s.confidence >= confMin)
      .filter(s => riskFilter === "all" || s.risk === riskFilter);
  }, [signals, category, search, confidenceFilter, riskFilter]);

  const activeFilters = [confidenceFilter !== "all", riskFilter !== "all"].filter(Boolean).length;
  const bullish = signals.filter(s => s.direction === "صعودي").length;
  const bearish = signals.length - bullish;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-3"
    >
      {/* Summary Strip */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1 bg-success/8 text-success px-2 py-1 rounded-lg border border-success/15">
          <span className="font-bold">{bullish}</span>
          <span className="text-success/70">شراء</span>
        </div>
        <div className="flex items-center gap-1 bg-destructive/8 text-destructive px-2 py-1 rounded-lg border border-destructive/15">
          <span className="font-bold">{bearish}</span>
          <span className="text-destructive/70">بيع</span>
        </div>
        <div className="mr-auto flex items-center gap-1 text-muted-foreground">
          <Zap className="w-3 h-3 text-primary" />
          {signals.length} إشارة نشطة
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث... BTC, GOLD, EUR"
            className="w-full bg-secondary/60 border border-border/30 rounded-xl pr-10 pl-10 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
            showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
              {activeFilters}
            </span>
          )}
        </button>
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {categoryFilters.map((f) => (
          <button
            key={f}
            onClick={() => setCategory(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all",
              category === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-3 space-y-3 border border-border/20">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> نسبة الثقة
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { key: "all" as const, label: "الكل" },
                    { key: "80+" as const, label: "80%+" },
                    { key: "70+" as const, label: "70%+" },
                    { key: "60+" as const, label: "60%+" },
                  ]).map(({ key, label }) => (
                    <button key={key} onClick={() => setConfidenceFilter(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                        confidenceFilter === key ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> المخاطرة
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { key: "all" as const, label: "الكل" },
                    { key: "منخفض" as const, label: "منخفض" },
                    { key: "متوسط" as const, label: "متوسط" },
                    { key: "مرتفع" as const, label: "مرتفع" },
                  ]).map(({ key, label }) => (
                    <button key={key} onClick={() => setRiskFilter(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                        riskFilter === key ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <button onClick={() => { setConfidenceFilter("all"); setRiskFilter("all"); }}
                  className="text-[10px] font-mono text-destructive hover:underline">
                  إعادة تعيين
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      <motion.div variants={fadeUp}>
        <p className="text-[10px] font-mono text-muted-foreground">
          {filtered.length} إشارة
          {search && ` — "${search}"`}
          {confidenceFilter !== "all" && ` • ثقة ${confidenceFilter}`}
        </p>
      </motion.div>

      {/* Signal Cards */}
      {signals.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (
        <motion.div className="space-y-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.03 } } }}>
          {filtered.map((signal) => (
            <SignalCardCollapsible key={signal.pair} signal={signal} />
          ))}
        </motion.div>
      )}

      {filtered.length === 0 && signals.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground font-mono text-sm">لا توجد إشارات مطابقة</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="glass rounded-xl p-3 border-warning/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <p className="text-[9px] font-mono text-muted-foreground/70 leading-relaxed">
            جميع الإشارات لأغراض تعليمية فقط ولا تشكل نصيحة مالية. التداول ينطوي على مخاطر عالية.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SignalsPage;
