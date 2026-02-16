import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, ChevronDown, Lock, Unlock, Layers, Zap, Eye,
  Info, BookOpen, Calculator, AlertTriangle, Target, Shield, ArrowDownUp,
  Clock, Crosshair, Loader2, MapPin, Route, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { InsufficientCreditsPopup, BuyCreditsModal } from "@/components/credits/CreditModals";
import { toast } from "sonner";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface Signal {
  pair: string;
  direction: string;
  icon?: string;
  confidence: number;
  entry: string;
  target1: string;
  target2: string;
  sl: string;
  rr: string;
  timeFrame: string;
  alphaScore: number;
  rsi: number;
  rsiSignal: string;
  macd: string;
  macdHist: string;
  bbPosition: string;
  volume: string;
  sentiment: number;
  liquidity: string;
  convergence: number;
  reasons: string[];
  risk: string;
  category?: string;
}

interface AIAnalysis {
  entryZone?: { from: string; to: string; type: string };
  exitZones?: { target: string; label: string; probability: number }[];
  stopLoss?: { price: string; reason: string };
  entryReasons?: string[];
  scenarios?: { title: string; probability: number; description: string; targets: string[] }[];
  riskReward?: string;
  strategy?: string;
  keyLevels?: { support: string[]; resistance: string[] };
  timeHorizon?: string;
  verdict?: string;
  error?: string;
}

interface Props {
  signal: Signal;
}

const stop = (e: React.MouseEvent | React.PointerEvent) => e.stopPropagation();

const SignalCardCollapsible = ({ signal }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { credits, spendCredits, canAfford, isFounder } = useCredits();

  const status = signal.confidence >= 80 ? "Active" : "Pending";

  const handleAnalyze = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analyzing) return;

    if (!isFounder && !canAfford(CREDIT_COSTS.reveal_signal)) {
      setShowInsufficient(true);
      return;
    }

    setAnalyzing(true);
    setExpanded(true);

    try {
      if (!isFounder) {
        const success = await spendCredits(CREDIT_COSTS.reveal_signal, "reveal_signal", `تحليل AI لـ ${signal.pair}`);
        if (!success) {
          setShowInsufficient(true);
          setAnalyzing(false);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("signal-analysis", {
        body: {
          pair: signal.pair,
          direction: signal.direction,
          timeFrame: signal.timeFrame,
          price: signal.entry,
          rsi: signal.rsi,
          macd: signal.macd,
          confidence: signal.confidence,
          reasons: signal.reasons,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setAiAnalysis(data);
        toast.success("تم التحليل بنجاح ✨");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("تعذر التحليل. حاول مرة أخرى.");
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing, isFounder, canAfford, spendCredits, signal]);

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  }, []);

  const RiskCalcInline = () => {
    const [capital, setCapital] = useState("10000");
    const [riskPct, setRiskPct] = useState("2");
    const entryNum = parseFloat(signal.entry.replace(/,/g, "")) || 0;
    const slNum = parseFloat(signal.sl.replace(/,/g, "")) || 0;
    const riskAmount = (parseFloat(capital) * parseFloat(riskPct)) / 100;
    const priceDiff = Math.abs(entryNum - slNum);
    const posSize = priceDiff > 0 ? riskAmount / priceDiff : 0;

    return (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" onClick={stop}>
        <div className="rounded-xl bg-accent/5 border border-accent/15 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1">
              <Calculator className="w-3 h-3" /> حاسبة المخاطر
            </p>
            <button onClick={(e) => { stop(e); setShowRiskCalc(false); }} className="text-muted-foreground hover:text-foreground">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-mono text-muted-foreground block mb-1">رأس المال ($)</label>
              <input type="number" value={capital} onChange={e => setCapital(e.target.value)} onClick={stop}
                className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[11px] font-mono border border-border/20 focus:border-accent/40 focus:outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-mono text-muted-foreground block mb-1">المخاطرة (%)</label>
              <input type="number" value={riskPct} onChange={e => setRiskPct(e.target.value)} onClick={stop}
                className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[11px] font-mono border border-border/20 focus:border-accent/40 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-[8px] font-mono text-muted-foreground">مبلغ المخاطرة</p>
              <p className="text-[12px] font-mono font-bold text-destructive">${riskAmount.toFixed(0)}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-[8px] font-mono text-muted-foreground">حجم المركز</p>
              <p className="text-[12px] font-mono font-bold text-primary">{posSize > 0 ? posSize.toFixed(4) : "—"}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-[8px] font-mono text-muted-foreground">R:R</p>
              <p className="text-[12px] font-mono font-bold">{signal.rr}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        className={cn(
          "glass rounded-2xl overflow-hidden transition-all duration-300",
          signal.alphaScore >= 90 ? "border-primary/25 glow-gold" : "border-border/10"
        )}
        onClick={stop}
      >
        {/* ─── Header ─── */}
        <div className="px-4 py-3.5 flex items-center justify-between" onClick={stop}>
          <div className="flex items-center gap-3">
            {signal.icon && (
              <span className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-lg border border-border/20 shadow-sm">
                {signal.icon}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[15px] tracking-wide">{signal.pair}</span>
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider",
                  status === "Active" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                )}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "text-[10px] font-mono font-bold flex items-center gap-1",
                  signal.direction === "صعودي" ? "text-primary" : "text-destructive"
                )}>
                  {signal.direction === "صعودي" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {signal.direction === "صعودي" ? "LONG" : "SHORT"}
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-mono text-muted-foreground">{signal.timeFrame}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Confidence - blurred until analyzed */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-[13px] border relative overflow-hidden",
              !aiAnalysis ? "bg-muted/20 border-border/20" :
              signal.confidence >= 85 ? "bg-primary/10 text-primary border-primary/20" :
              signal.confidence >= 70 ? "bg-accent/10 text-accent border-accent/20" :
              "bg-warning/10 text-warning border-warning/20"
            )}>
              {aiAnalysis ? (
                signal.confidence
              ) : (
                <>
                  <span className="blur-[6px] text-muted-foreground select-none">{signal.confidence}</span>
                  <Lock className="w-3 h-3 text-muted-foreground/60 absolute" />
                </>
              )}
            </div>

            {/* Direction icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              signal.direction === "صعودي" ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"
            )}>
              {signal.direction === "صعودي"
                ? <TrendingUp className="w-4.5 h-4.5 text-primary" />
                : <TrendingDown className="w-4.5 h-4.5 text-destructive" />}
            </div>
          </div>
        </div>

        {/* ─── Analyze Button ─── */}
        {!aiAnalysis && !analyzing && (
          <div className="px-4 pb-3.5" onClick={stop}>
            <motion.button
              onClick={handleAnalyze}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2.5 text-[12px] font-mono font-bold transition-all border bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 active:bg-primary/15"
            >
              <Eye className="w-4 h-4" />
              اضغط للتحليل
              <Zap className="w-3.5 h-3.5 text-accent" />
            </motion.button>
          </div>
        )}

        {/* ─── Loading State ─── */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 overflow-hidden"
              onClick={stop}
            >
              <div className="rounded-xl bg-primary/5 border border-primary/15 p-6 flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-primary animate-pulse" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border border-primary/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <p className="text-[12px] font-mono font-bold text-primary">تحليل AI جاري...</p>
                <p className="text-[10px] font-mono text-muted-foreground">تحديد مناطق الدخول والخروج والسيناريوهات</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Collapsed Re-expand Button ─── */}
        {aiAnalysis && !expanded && !analyzing && (
          <div className="px-4 pb-3.5" onClick={stop}>
            <motion.button
              onClick={toggleExpand}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[11px] font-mono font-bold bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              عرض التحليل
              <ChevronDown className="w-3 h-3" />
            </motion.button>
          </div>
        )}

        {/* ─── AI Analysis Results ─── */}
        <AnimatePresence>
          {aiAnalysis && !aiAnalysis.error && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
              onClick={stop}
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Collapse button */}
                <button
                  onClick={toggleExpand}
                  className="w-full flex items-center justify-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors py-1.5 border-t border-border/10"
                >
                  <motion.div animate={{ rotate: 180 }}><ChevronDown className="w-3 h-3" /></motion.div>
                  إخفاء التحليل
                </button>

                {/* ── Verdict ── */}
                {aiAnalysis.verdict && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15 p-3.5"
                  >
                    <p className="text-[11px] font-mono font-bold text-primary leading-relaxed">
                      ⚡ {aiAnalysis.verdict}
                    </p>
                  </motion.div>
                )}

                {/* ── Entry & Exit Grid ── */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="space-y-2"
                >
                  {/* Entry Zone */}
                  {aiAnalysis.entryZone && (
                    <div className="rounded-xl bg-secondary/20 border border-border/10 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5" /> منطقة الدخول
                        </span>
                        <span className="text-[9px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded-full">{aiAnalysis.entryZone.type}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-accent/5 rounded-lg px-3 py-2.5 text-center border border-accent/10">
                          <p className="text-[8px] font-mono text-muted-foreground uppercase mb-0.5">من</p>
                          <p className="text-[15px] font-mono font-bold">{aiAnalysis.entryZone.from}</p>
                        </div>
                        <div className="bg-accent/5 rounded-lg px-3 py-2.5 text-center border border-accent/10">
                          <p className="text-[8px] font-mono text-muted-foreground uppercase mb-0.5">إلى</p>
                          <p className="text-[15px] font-mono font-bold">{aiAnalysis.entryZone.to}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exit Zones */}
                  {aiAnalysis.exitZones && aiAnalysis.exitZones.length > 0 && (
                    <div className="rounded-xl bg-secondary/20 border border-border/10 p-3 space-y-2">
                      <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> أهداف الخروج
                      </span>
                      <div className="space-y-1.5">
                        {aiAnalysis.exitZones.map((zone, i) => (
                          <div key={i} className="flex items-center gap-3 bg-primary/5 rounded-lg px-3 py-2 border border-primary/8">
                            <span className={cn(
                              "text-[10px] font-mono font-bold w-7 h-7 rounded-lg flex items-center justify-center",
                              i === 0 ? "bg-primary/15 text-primary" : i === 1 ? "bg-primary/10 text-primary/80" : "bg-primary/5 text-primary/60"
                            )}>{zone.label}</span>
                            <span className="text-[14px] font-mono font-bold flex-1">{zone.target}</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${zone.probability}%` }} />
                              </div>
                              <span className="text-[9px] font-mono text-muted-foreground w-8 text-left">{zone.probability}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stop Loss */}
                  {aiAnalysis.stopLoss && (
                    <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/15 flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase">وقف الخسارة</p>
                          <p className="text-[15px] font-mono font-bold text-destructive">{aiAnalysis.stopLoss.price}</p>
                        </div>
                      </div>
                      <p className="text-[9px] font-mono text-muted-foreground mt-2 leading-relaxed border-t border-destructive/10 pt-2">{aiAnalysis.stopLoss.reason}</p>
                    </div>
                  )}
                </motion.div>

                {/* ── R:R & Time ── */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {aiAnalysis.riskReward && (
                    <div className="bg-secondary/30 rounded-xl px-3 py-3 text-center border border-border/10">
                      <p className="text-[8px] font-mono text-muted-foreground uppercase flex items-center justify-center gap-1 mb-1"><ArrowDownUp className="w-3 h-3" /> نسبة المخاطرة/العائد</p>
                      <p className="text-[18px] font-mono font-bold text-primary">{aiAnalysis.riskReward}</p>
                    </div>
                  )}
                  {aiAnalysis.timeHorizon && (
                    <div className="bg-secondary/30 rounded-xl px-3 py-3 text-center border border-border/10">
                      <p className="text-[8px] font-mono text-muted-foreground uppercase flex items-center justify-center gap-1 mb-1"><Clock className="w-3 h-3" /> المدة المتوقعة</p>
                      <p className="text-[13px] font-mono font-bold">{aiAnalysis.timeHorizon}</p>
                    </div>
                  )}
                </motion.div>

                {/* ── Entry Reasons ── */}
                {aiAnalysis.entryReasons && aiAnalysis.entryReasons.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="rounded-xl bg-secondary/20 border border-border/10 p-3 space-y-2"
                  >
                    <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> أسباب الدخول
                    </span>
                    <div className="space-y-1.5">
                      {aiAnalysis.entryReasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-secondary/30 rounded-lg px-3 py-2.5">
                          <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Scenarios ── */}
                {aiAnalysis.scenarios && aiAnalysis.scenarios.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1.5 px-1">
                      <Route className="w-3.5 h-3.5" /> السيناريوهات المتوقعة
                    </span>
                    {aiAnalysis.scenarios.map((scenario, i) => {
                      const isPositive = scenario.title.includes("إيجابي") || scenario.title.includes("صعود");
                      const isNegative = scenario.title.includes("سلبي") || scenario.title.includes("هبوط");
                      const color = isPositive ? "primary" : isNegative ? "destructive" : "warning";
                      return (
                        <div key={i} className={cn(
                          "rounded-xl p-3.5 border space-y-2",
                          isPositive ? "bg-primary/5 border-primary/12" :
                          isNegative ? "bg-destructive/5 border-destructive/12" :
                          "bg-warning/5 border-warning/12"
                        )}>
                          <div className="flex items-center justify-between">
                            <p className={cn("text-[11px] font-mono font-bold flex items-center gap-1.5", `text-${color}`)}>
                              {isPositive ? "🟢" : isNegative ? "🔴" : "🟡"} {scenario.title}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className={cn("h-full rounded-full", `bg-${color}`)} style={{ width: `${scenario.probability}%` }} />
                              </div>
                              <span className={cn("text-[10px] font-mono font-bold", `text-${color}`)}>{scenario.probability}%</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-mono text-foreground/70 leading-relaxed">{scenario.description}</p>
                          {scenario.targets && scenario.targets.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {scenario.targets.map((t, ti) => (
                                <span key={ti} className="text-[9px] font-mono bg-secondary/40 px-2 py-0.5 rounded-md border border-border/10">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* ── Strategy ── */}
                {aiAnalysis.strategy && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="rounded-xl bg-accent/5 border border-accent/10 p-3.5"
                  >
                    <p className="text-[10px] font-mono text-accent font-bold mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> الاستراتيجية المقترحة
                    </p>
                    <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">{aiAnalysis.strategy}</p>
                  </motion.div>
                )}

                {/* ── Key Levels ── */}
                {aiAnalysis.keyLevels && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" /> دعم</p>
                      <div className="space-y-1">
                        {aiAnalysis.keyLevels.support?.map((s, i) => (
                          <p key={i} className="text-[12px] font-mono font-bold text-primary">{s}</p>
                        ))}
                      </div>
                    </div>
                    <div className="bg-destructive/5 rounded-xl p-3 border border-destructive/10">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-destructive" /> مقاومة</p>
                      <div className="space-y-1">
                        {aiAnalysis.keyLevels.resistance?.map((r, i) => (
                          <p key={i} className="text-[12px] font-mono font-bold text-destructive">{r}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Tools ── */}
                <div className="space-y-2">
                  <button
                    onClick={(e) => { stop(e); setShowRiskCalc(!showRiskCalc); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/5 border border-accent/15 text-[10px] font-mono text-accent font-bold hover:bg-accent/10 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    حاسبة حجم المركز
                  </button>

                  <AnimatePresence>
                    {showRiskCalc && <RiskCalcInline />}
                  </AnimatePresence>

                  {/* Deep Dive */}
                  <Collapsible open={deepDiveOpen} onOpenChange={setDeepDiveOpen}>
                    <CollapsibleTrigger asChild>
                      <button onClick={stop}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/30 border border-border/10 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {deepDiveOpen ? "إخفاء المؤشرات" : "المؤشرات الفنية (RSI · MACD · BB)"}
                        <motion.div animate={{ rotate: deepDiveOpen ? 180 : 0 }}>
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pt-3 grid grid-cols-4 gap-1.5" onClick={stop}>
                        <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">RSI</p>
                          <p className={cn("text-[14px] font-mono font-bold",
                            signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-primary" : "text-foreground"
                          )}>{signal.rsi}</p>
                          <p className="text-[8px] font-mono text-muted-foreground">{signal.rsiSignal}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">MACD</p>
                          <p className={cn("text-[14px] font-mono font-bold",
                            signal.macd === "صعودي" ? "text-primary" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
                          )}>{signal.macdHist}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">BB</p>
                          <p className="text-[14px] font-mono font-bold">{signal.bbPosition.replace("نطاق ", "")}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">Vol</p>
                          <p className="text-[14px] font-mono font-bold">{signal.volume}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* ── Footer Actions ── */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      stop(e);
                      navigate("/trade-journal", {
                        state: {
                          prefill: {
                            pair: signal.pair,
                            direction: signal.direction === "صعودي" ? "buy" : "sell",
                            entry: aiAnalysis.entryZone?.from || signal.entry,
                            tp: aiAnalysis.exitZones?.[0]?.target || signal.target1,
                            sl: aiAnalysis.stopLoss?.price || signal.sl,
                            reason: aiAnalysis.entryReasons?.join(" • ") || signal.reasons.join(" • "),
                            strategy: aiAnalysis.strategy || `${signal.timeFrame} | ${signal.direction}`,
                          }
                        }
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold bg-primary/10 text-primary px-3 py-2.5 rounded-xl hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    سجّل في اليومية
                  </button>
                  <button
                    onClick={(e) => { stop(e); navigate(`/asset/${encodeURIComponent(signal.pair)}`); }}
                    className="text-[11px] font-mono font-bold bg-accent/10 text-accent px-3 py-2.5 rounded-xl hover:bg-accent/20 transition-colors border border-accent/15"
                  >
                    تفاصيل الأصل
                  </button>
                </div>

                {/* Risk Warning */}
                <div className="flex items-start gap-1.5 pt-1">
                  <AlertTriangle className="w-3 h-3 text-warning/60 shrink-0 mt-0.5" />
                  <p className="text-[8px] font-mono text-muted-foreground/60 leading-relaxed">
                    هذه توصية تعليمية وليست نصيحة مالية. التداول ينطوي على مخاطر خسارة رأس المال.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <InsufficientCreditsPopup
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        onBuyCredits={() => { setShowInsufficient(false); setShowBuyCredits(true); }}
        requiredCredits={CREDIT_COSTS.reveal_signal}
        currentCredits={credits}
      />
      <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} currentCredits={credits} />
    </>
  );
};

export default SignalCardCollapsible;
