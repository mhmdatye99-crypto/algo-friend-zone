import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, SlidersHorizontal, Zap, Shield, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignals } from "@/hooks/useSignals";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import { Skeleton } from "@/components/ui/skeleton";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1 } },
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
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-2.5"
    >
      {/* Summary Strip */}
      <motion.div variants={fade} className="flex items-center gap-2 text-[9px] font-mono">
        <div className="flex items-center gap-1 text-success px-2 py-1 border border-success/10" style={{ borderRadius: '3px' }}>
          <span className="font-bold tabular-nums">{bullish}</span>
          <span className="text-success/60">LONG</span>
        </div>
        <div className="flex items-center gap-1 text-destructive px-2 py-1 border border-destructive/10" style={{ borderRadius: '3px' }}>
          <span className="font-bold tabular-nums">{bearish}</span>
          <span className="text-destructive/60">SHORT</span>
        </div>
        <div className="mr-auto flex items-center gap-1 text-muted-foreground/40">
          <div className="w-1 h-1 rounded-full bg-primary gold-glow" />
          <span className="tabular-nums">{signals.length} إشارة نشطة</span>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث... BTC, GOLD, EUR"
            className="w-full bg-card border border-border/30 pr-9 pl-9 py-2 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors"
            style={{ borderRadius: '4px' }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative w-9 h-9 flex items-center justify-center transition-colors shrink-0 border",
            showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground/50 border-border/30"
          )}
          style={{ borderRadius: '4px' }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[7px] flex items-center justify-center font-bold" style={{ borderRadius: '2px' }}>
              {activeFilters}
            </span>
          )}
        </button>
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fade} className="flex gap-1 overflow-x-auto scrollbar-hide">
        {categoryFilters.map((f) => (
          <button
            key={f}
            onClick={() => setCategory(f)}
            className={cn(
              "px-3 py-1.5 text-[9px] font-mono font-semibold whitespace-nowrap transition-all border",
              category === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground/50 border-border/15 hover:border-border/30"
            )}
            style={{ borderRadius: '3px' }}
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border border-border/15 bg-card/80" style={{ borderRadius: '4px' }}>
              <div>
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> نسبة الثقة
                </p>
                <div className="flex gap-1 flex-wrap">
                  {([
                    { key: "all" as const, label: "الكل" },
                    { key: "80+" as const, label: "80%+" },
                    { key: "70+" as const, label: "70%+" },
                    { key: "60+" as const, label: "60%+" },
                  ]).map(({ key, label }) => (
                    <button key={key} onClick={() => setConfidenceFilter(key)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-mono font-medium transition-all border",
                        confidenceFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground/50 border-border/15"
                      )}
                      style={{ borderRadius: '3px' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> المخاطرة
                </p>
                <div className="flex gap-1 flex-wrap">
                  {([
                    { key: "all" as const, label: "الكل" },
                    { key: "منخفض" as const, label: "منخفض" },
                    { key: "متوسط" as const, label: "متوسط" },
                    { key: "مرتفع" as const, label: "مرتفع" },
                  ]).map(({ key, label }) => (
                    <button key={key} onClick={() => setRiskFilter(key)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-mono font-medium transition-all border",
                        riskFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground/50 border-border/15"
                      )}
                      style={{ borderRadius: '3px' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <button onClick={() => { setConfidenceFilter("all"); setRiskFilter("all"); }}
                  className="text-[9px] font-mono text-destructive/70 hover:text-destructive transition-colors">
                  إعادة تعيين
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      <motion.div variants={fade}>
        <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-wider">
          {filtered.length} إشارة
          {search && ` — "${search}"`}
          {confidenceFilter !== "all" && ` • ثقة ${confidenceFilter}`}
        </p>
      </motion.div>

      {/* Signal Cards */}
      {signals.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" style={{ borderRadius: '4px' }} />)}
        </div>
      ) : (
        <motion.div className="space-y-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.02 } } }}>
          {filtered.map((signal) => (
            <SignalCardCollapsible key={signal.pair} signal={signal} />
          ))}
        </motion.div>
      )}

      {filtered.length === 0 && signals.length > 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground/40 font-mono text-[11px]">لا توجد إشارات مطابقة</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-3 border border-border/10 bg-card/30" style={{ borderRadius: '4px' }}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 text-muted-foreground/20 shrink-0 mt-0.5" />
          <p className="text-[7px] font-mono text-muted-foreground/25 leading-relaxed">
            جميع الإشارات لأغراض تعليمية فقط ولا تشكل نصيحة مالية. التداول ينطوي على مخاطر عالية.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SignalsPage;
