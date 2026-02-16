import { useState } from "react";
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

const statusLabels = ["Pending", "Active"] as const;

const SignalCardCollapsible = ({ signal }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { credits, spendCredits, canAfford, isFounder } = useCredits();

  const status = signal.confidence >= 80 ? "Active" : "Pending";

  const handleAnalyze = async () => {
    if (analyzing) return;
    
    // Check credits
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
        setRevealed(true);
        toast.success("تم التحليل بنجاح ✨");
      }
    } catch (e) {
      console.error("Analysis error:", e);
      toast.error("تعذر التحليل. حاول مرة أخرى.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReveal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFounder) {
      setRevealed(true);
      toast.success("Founder — وصول مجاني");
      return;
    }
    if (!canAfford(CREDIT_COSTS.reveal_signal)) {
      setShowInsufficient(true);
      return;
    }
    const success = await spendCredits(CREDIT_COSTS.reveal_signal, "reveal_signal", `كشف إشارة ${signal.pair}`);
    if (success) {
      setRevealed(true);
      toast.success(`تم كشف الإشارة — ${CREDIT_COSTS.reveal_signal} رصيد`);
    } else {
      setShowInsufficient(true);
    }
  };

  const RiskCalcInline = () => {
    const [capital, setCapital] = useState("10000");
    const [riskPct, setRiskPct] = useState("2");
    const entryNum = parseFloat(signal.entry.replace(/,/g, "")) || 0;
    const slNum = parseFloat(signal.sl.replace(/,/g, "")) || 0;
    const riskAmount = (parseFloat(capital) * parseFloat(riskPct)) / 100;
    const priceDiff = Math.abs(entryNum - slNum);
    const posSize = priceDiff > 0 ? riskAmount / priceDiff : 0;

    return (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
        <div className="rounded-xl bg-accent/5 border border-accent/15 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1">
              <Calculator className="w-3 h-3" /> حاسبة المخاطر
            </p>
            <button onClick={() => setShowRiskCalc(false)} className="text-muted-foreground hover:text-foreground">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-mono text-muted-foreground block mb-1">رأس المال ($)</label>
              <input type="number" value={capital} onChange={e => setCapital(e.target.value)}
                className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[11px] font-mono border border-border/20 focus:border-accent/40 focus:outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-mono text-muted-foreground block mb-1">المخاطرة (%)</label>
              <input type="number" value={riskPct} onChange={e => setRiskPct(e.target.value)}
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
          "glass rounded-xl overflow-hidden transition-all duration-300",
          signal.alphaScore >= 90 ? "border-primary/25 glow-gold" : "border-border/10"
        )}
      >
        {/* Compact Header - NO chart, NO confidence visible */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {signal.icon && (
              <span className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center text-lg border border-border/20">
                {signal.icon}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[14px]">{signal.pair}</span>
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded-md font-mono font-bold",
                  status === "Active" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                )}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground">{signal.timeFrame}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className={cn(
                  "text-[10px] font-mono font-bold",
                  signal.direction === "صعودي" ? "text-primary" : "text-destructive"
                )}>
                  {signal.direction === "صعودي" ? "LONG ↑" : "SHORT ↓"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden confidence - blurred until analyzed */}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-[12px] border relative overflow-hidden",
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
                  <Lock className="w-3 h-3 text-muted-foreground absolute" />
                </>
              )}
            </div>

            {/* Direction icon */}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border",
              signal.direction === "صعودي" ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"
            )}>
              {signal.direction === "صعودي"
                ? <TrendingUp className="w-4 h-4 text-primary" />
                : <TrendingDown className="w-4 h-4 text-destructive" />}
            </div>
          </div>
        </div>

        {/* "Tap to Analyze" button - AI powered */}
        {!expanded && !aiAnalysis && (
          <div className="px-4 pb-3">
            <motion.button
              onClick={handleAnalyze}
              whileTap={{ scale: 0.97 }}
              disabled={analyzing}
              className={cn(
                "w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-mono font-bold transition-all border",
                analyzing
                  ? "bg-primary/5 text-primary/50 border-primary/10 cursor-wait"
                  : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
              )}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحليل بالذكاء الاصطناعي...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  اضغط للتحليل
                  <Zap className="w-3.5 h-3.5 text-accent" />
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* AI Analysis Loading Animation */}
        <AnimatePresence>
          {analyzing && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 overflow-hidden"
            >
              <div className="rounded-xl bg-primary/5 border border-primary/15 p-5 flex flex-col items-center justify-center gap-3">
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
                <div className="text-center space-y-1">
                  <p className="text-[12px] font-mono font-bold text-primary">تحليل AI جاري...</p>
                  <p className="text-[10px] font-mono text-muted-foreground">تحديد مناطق الدخول والخروج والسيناريوهات</p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis Results */}
        <AnimatePresence>
          {aiAnalysis && !aiAnalysis.error && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/10 pt-3">
                <button
                  onClick={() => setExpanded(false)}
                  className="w-full flex items-center justify-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  <motion.div animate={{ rotate: 180 }}>
                    <ChevronDown className="w-3 h-3" />
                  </motion.div>
                  إخفاء التحليل
                </button>

                {/* Verdict */}
                {aiAnalysis.verdict && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-primary/5 border border-primary/15 p-3"
                  >
                    <p className="text-[11px] font-mono font-bold text-primary leading-relaxed">
                      ⚡ {aiAnalysis.verdict}
                    </p>
                  </motion.div>
                )}

                {/* Entry Zone */}
                {aiAnalysis.entryZone && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Crosshair className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">منطقة الدخول</span>
                      <span className="text-[9px] font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded-md">{aiAnalysis.entryZone.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-accent/5 rounded-lg px-3 py-2 text-center border border-accent/10">
                        <p className="text-[9px] font-mono text-muted-foreground">من</p>
                        <p className="text-[14px] font-mono font-bold">{aiAnalysis.entryZone.from}</p>
                      </div>
                      <div className="bg-accent/5 rounded-lg px-3 py-2 text-center border border-accent/10">
                        <p className="text-[9px] font-mono text-muted-foreground">إلى</p>
                        <p className="text-[14px] font-mono font-bold">{aiAnalysis.entryZone.to}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Exit Zones (TPs) */}
                {aiAnalysis.exitZones && aiAnalysis.exitZones.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">مناطق الخروج</span>
                    </div>
                    <div className="space-y-1.5">
                      {aiAnalysis.exitZones.map((zone, i) => (
                        <div key={i} className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
                          <span className="text-[10px] font-mono font-bold text-primary w-8">{zone.label}</span>
                          <span className="text-[13px] font-mono font-bold flex-1">{zone.target}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${zone.probability}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-muted-foreground">{zone.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Stop Loss */}
                {aiAnalysis.stopLoss && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2 border border-destructive/10">
                      <Shield className="w-4 h-4 text-destructive" />
                      <div className="flex-1">
                        <p className="text-[9px] font-mono text-muted-foreground">وقف الخسارة</p>
                        <p className="text-[13px] font-mono font-bold text-destructive">{aiAnalysis.stopLoss.price}</p>
                      </div>
                      <p className="text-[9px] font-mono text-muted-foreground max-w-[120px] text-left leading-relaxed">{aiAnalysis.stopLoss.reason}</p>
                    </div>
                  </motion.div>
                )}

                {/* R:R & Time Horizon */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="flex gap-2"
                >
                  {aiAnalysis.riskReward && (
                    <div className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-center">
                      <p className="text-[9px] font-mono text-muted-foreground flex items-center justify-center gap-1"><ArrowDownUp className="w-3 h-3" /> R:R</p>
                      <p className="text-[14px] font-mono font-bold text-primary">{aiAnalysis.riskReward}</p>
                    </div>
                  )}
                  {aiAnalysis.timeHorizon && (
                    <div className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-center">
                      <p className="text-[9px] font-mono text-muted-foreground flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> المدة</p>
                      <p className="text-[12px] font-mono font-bold">{aiAnalysis.timeHorizon}</p>
                    </div>
                  )}
                </motion.div>

                {/* Entry Reasons */}
                {aiAnalysis.entryReasons && aiAnalysis.entryReasons.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">أسباب الدخول</span>
                    </div>
                    <div className="space-y-1.5">
                      {aiAnalysis.entryReasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 bg-secondary/20 rounded-lg px-3 py-2">
                          <span className="text-primary font-bold text-[11px] mt-0.5">{i + 1}</span>
                          <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Scenarios */}
                {aiAnalysis.scenarios && aiAnalysis.scenarios.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Route className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">السيناريوهات المتوقعة</span>
                    </div>
                    <div className="space-y-2">
                      {aiAnalysis.scenarios.map((scenario, i) => {
                        const isPositive = scenario.title.includes("إيجابي") || scenario.title.includes("صعود");
                        const isNegative = scenario.title.includes("سلبي") || scenario.title.includes("هبوط");
                        return (
                          <div key={i} className={cn(
                            "rounded-xl p-3 border space-y-2",
                            isPositive ? "bg-primary/5 border-primary/15" :
                            isNegative ? "bg-destructive/5 border-destructive/15" :
                            "bg-secondary/20 border-border/10"
                          )}>
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "text-[11px] font-mono font-bold",
                                isPositive ? "text-primary" : isNegative ? "text-destructive" : "text-muted-foreground"
                              )}>
                                {isPositive ? "🟢" : isNegative ? "🔴" : "🟡"} {scenario.title}
                              </p>
                              <span className={cn(
                                "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md",
                                isPositive ? "bg-primary/10 text-primary" :
                                isNegative ? "bg-destructive/10 text-destructive" :
                                "bg-warning/10 text-warning"
                              )}>
                                {scenario.probability}%
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-foreground/70 leading-relaxed">{scenario.description}</p>
                            {scenario.targets && scenario.targets.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {scenario.targets.map((t, ti) => (
                                  <span key={ti} className="text-[9px] font-mono bg-secondary/40 px-1.5 py-0.5 rounded-md">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Strategy */}
                {aiAnalysis.strategy && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="rounded-xl bg-accent/5 border border-accent/10 p-3"
                  >
                    <p className="text-[10px] font-mono text-accent font-bold mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> الاستراتيجية المقترحة
                    </p>
                    <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">{aiAnalysis.strategy}</p>
                  </motion.div>
                )}

                {/* Key Levels */}
                {aiAnalysis.keyLevels && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
                      <p className="text-[9px] font-mono text-muted-foreground mb-1">دعم</p>
                      {aiAnalysis.keyLevels.support?.map((s, i) => (
                        <p key={i} className="text-[11px] font-mono font-bold text-primary">{s}</p>
                      ))}
                    </div>
                    <div className="bg-destructive/5 rounded-lg p-2 border border-destructive/10">
                      <p className="text-[9px] font-mono text-muted-foreground mb-1">مقاومة</p>
                      {aiAnalysis.keyLevels.resistance?.map((r, i) => (
                        <p key={i} className="text-[11px] font-mono font-bold text-destructive">{r}</p>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Risk Calculator Button */}
                <button
                  onClick={() => setShowRiskCalc(!showRiskCalc)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-accent/5 border border-accent/15 text-[10px] font-mono text-accent font-bold hover:bg-accent/10 transition-colors"
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
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary/30 border border-border/10 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors">
                      <Layers className="w-3.5 h-3.5" />
                      {deepDiveOpen ? "إخفاء المؤشرات" : "المؤشرات الفنية (RSI · MACD · BB)"}
                      <motion.div animate={{ rotate: deepDiveOpen ? 180 : 0 }}>
                        <ChevronDown className="w-3 h-3" />
                      </motion.div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-3 space-y-2">
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">RSI</p>
                          <p className={cn("text-[13px] font-mono font-bold",
                            signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-primary" : "text-foreground"
                          )}>{signal.rsi}</p>
                          <p className="text-[9px] font-mono text-muted-foreground">{signal.rsiSignal}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">MACD</p>
                          <p className={cn("text-[13px] font-mono font-bold",
                            signal.macd === "صعودي" ? "text-primary" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
                          )}>{signal.macdHist}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">BB</p>
                          <p className="text-[13px] font-mono font-bold">{signal.bbPosition.replace("نطاق ", "")}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-[9px] font-mono text-muted-foreground">Vol</p>
                          <p className="text-[13px] font-mono font-bold">{signal.volume}</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => navigate("/trade-journal", {
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
                    })}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Log to Journal
                  </button>
                  <button
                    onClick={() => navigate(`/asset/${encodeURIComponent(signal.pair)}`)}
                    className="text-[11px] font-mono font-bold bg-accent/10 text-accent px-3 py-2 rounded-lg hover:bg-accent/20 transition-colors"
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

        {/* Show collapsed state after analysis */}
        {aiAnalysis && !expanded && (
          <div className="px-4 pb-3">
            <motion.button
              onClick={() => setExpanded(true)}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-[11px] font-mono font-bold bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              عرض التحليل
              <ChevronDown className="w-3 h-3" />
            </motion.button>
          </div>
        )}
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
