import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, SlidersHorizontal, Zap, Shield, AlertTriangle, Crosshair, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignals } from "@/hooks/useSignals";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [scanning, setScanning] = useState(false);
  const [sniperSignal, setSniperSignal] = useState<any>(null);

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

  const handleScanMarket = async () => {
    setScanning(true);
    setSniperSignal(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-market", {
        body: { pair: "EUR/USD", timeframe: "1H", price: 1.0842, rsi: 58, macd: "bullish crossover", trend: "uptrend", volume: "above average" },
      });
      if (error) throw error;
      setSniperSignal(data);
      if (data?.TYPE === "NO_TRADE") {
        toast.info("لا توجد فرصة تداول حالياً — الخوارزمية في وضع الانتظار");
      } else {
        toast.success("تم رصد إشارة SNIPER بنجاح");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "فشل في المسح");
    } finally {
      setScanning(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="nx-page"
    >
      {/* Summary Strip */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="nx-badge-long">
          <span className="font-bold tabular-nums nx-ltr">{bullish}</span>
          <span>LONG</span>
        </div>
        <div className="nx-badge-short">
          <span className="font-bold tabular-nums nx-ltr">{bearish}</span>
          <span>SHORT</span>
        </div>
        <div className="mr-auto flex items-center gap-1.5 nx-meta">
          <div className="w-1.5 h-1.5 rounded-full bg-primary gold-glow" />
          <span className="nx-ltr tabular-nums">{signals.length}</span>
          <span>إشارة نشطة</span>
        </div>
      </motion.div>

      {/* Scan Market Button */}
      <motion.div variants={fade}>
        <button
          onClick={handleScanMarket}
          disabled={scanning}
          className={cn(
            scanning ? "nx-btn nx-btn-secondary w-full cursor-wait" : "nx-btn-primary w-full"
          )}
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          {scanning ? "جاري المسح..." : "Scan Market — SNIPER Mode"}
        </button>
      </motion.div>

      {/* Sniper Signal Result Card */}
      <AnimatePresence>
        {sniperSignal && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="nx-card-premium overflow-hidden"
          >
            {sniperSignal.TYPE === "NO_TRADE" ? (
              <div className="text-center py-2">
                <Shield className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="nx-label uppercase tracking-wider">NO TRADE — STANDBY</p>
                <p className="nx-meta mt-1">{sniperSignal.REASON}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={sniperSignal.DIRECTION === "BUY" ? "nx-badge-long" : "nx-badge-short"}>
                      {sniperSignal.DIRECTION}
                    </span>
                    <span className="nx-ltr font-mono font-bold text-foreground">{sniperSignal.PAIR}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[13px] font-mono text-primary font-bold uppercase">SNIPER</span>
                  </div>
                </div>

                {/* Levels Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "ENTRY", value: sniperSignal.ENTRY_ZONE, color: "text-foreground" },
                    { label: "SL", value: sniperSignal.STOP_LOSS, color: "text-destructive" },
                    { label: "TP1", value: sniperSignal.TAKE_PROFIT_1, color: "text-success" },
                    { label: "TP2", value: sniperSignal.TAKE_PROFIT_2, color: "text-success" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="nx-card-flat p-2 text-center">
                      <p className="nx-label text-[13px]">{label}</p>
                      <p className={cn("nx-ltr font-mono font-bold tabular-nums text-[14px]", color)}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Confluence Score + Logic */}
                <div className="flex items-center gap-2">
                  <div className="nx-badge-gold shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="nx-ltr tabular-nums">{sniperSignal.CONFLUENCE_SCORE}%</span>
                  </div>
                  <p className="nx-meta leading-relaxed flex-1">{sniperSignal.LOGIC}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث... BTC, GOLD, EUR"
            className="w-full h-11 bg-card border border-border rounded-xl pr-10 pl-10 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground nx-tap flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative nx-tap flex items-center justify-center rounded-xl border shrink-0 transition-colors",
            showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
              {activeFilters}
            </span>
          )}
        </button>
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fade} className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {categoryFilters.map((f) => (
          <button
            key={f}
            onClick={() => setCategory(f)}
            className={cn(
              "px-3.5 h-11 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-all border shrink-0",
              category === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="nx-card-flat space-y-4">
              <div>
                <p className="nx-label uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> نسبة الثقة
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
                        "px-3 h-9 rounded-lg text-[13px] font-medium transition-all border",
                        confidenceFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="nx-label uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> المخاطرة
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
                        "px-3 h-9 rounded-lg text-[13px] font-medium transition-all border",
                        riskFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <button onClick={() => { setConfidenceFilter("all"); setRiskFilter("all"); }}
                  className="text-[13px] font-semibold text-destructive hover:opacity-80 transition-opacity">
                  إعادة تعيين
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      <motion.div variants={fade}>
        <p className="nx-meta uppercase tracking-wider">
          {filtered.length} إشارة
          {search && ` — "${search}"`}
          {confidenceFilter !== "all" && ` • ثقة ${confidenceFilter}`}
        </p>
      </motion.div>

      {/* Signal Cards */}
      {signals.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : (
        <motion.div className="space-y-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.02 } } }}>
          {filtered.map((signal) => (
            <SignalCardCollapsible key={signal.pair} signal={signal} />
          ))}
        </motion.div>
      )}

      {filtered.length === 0 && signals.length > 0 && (
        <div className="text-center py-10">
          <p className="nx-body text-muted-foreground">لا توجد إشارات مطابقة</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="nx-card-flat">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="nx-meta leading-relaxed">
            جميع الإشارات لأغراض تعليمية فقط ولا تشكل نصيحة مالية. التداول ينطوي على مخاطر عالية.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SignalsPage;
