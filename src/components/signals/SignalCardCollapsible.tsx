import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronDown, Lock, Unlock, Layers, Zap, Eye, Info, BookOpen, Calculator, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { InsufficientCreditsPopup, BuyCreditsModal } from "@/components/credits/CreditModals";
import { toast } from "sonner";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

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
  const [showWhyTooltip, setShowWhyTooltip] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const navigate = useNavigate();
  const { credits, spendCredits, canAfford, isFounder } = useCredits();

  // Simulated status based on confidence
  const status = signal.confidence >= 80 ? "Active" : "Pending";

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

  // Mini risk calculator
  const RiskCalcInline = () => {
    const [capital, setCapital] = useState("10000");
    const [riskPct, setRiskPct] = useState("2");
    const entryNum = parseFloat(signal.entry.replace(/,/g, "")) || 0;
    const slNum = parseFloat(signal.sl.replace(/,/g, "")) || 0;
    const riskAmount = (parseFloat(capital) * parseFloat(riskPct)) / 100;
    const priceDiff = Math.abs(entryNum - slNum);
    const posSize = priceDiff > 0 ? riskAmount / priceDiff : 0;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
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
        {/* Compact Header */}
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
                {/* Status Label */}
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded-md font-mono font-bold",
                  status === "Active"
                    ? "bg-primary/15 text-primary"
                    : "bg-warning/15 text-warning"
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
            {/* Confidence badge with "Why?" */}
            <div className="relative">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-[12px] border cursor-pointer",
                signal.confidence >= 85 ? "bg-primary/10 text-primary border-primary/20" :
                signal.confidence >= 70 ? "bg-accent/10 text-accent border-accent/20" :
                "bg-warning/10 text-warning border-warning/20"
              )}
                onClick={(e) => { e.stopPropagation(); setShowWhyTooltip(!showWhyTooltip); }}
              >
                {signal.confidence}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowWhyTooltip(!showWhyTooltip); }}
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center border border-accent/30"
              >
                <Info className="w-2.5 h-2.5" />
              </button>
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

        {/* "Why?" Confidence Explanation */}
        <AnimatePresence>
          {showWhyTooltip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 overflow-hidden"
            >
              <div className="rounded-xl bg-accent/5 border border-accent/15 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> لماذا {signal.confidence}%؟
                  </p>
                  <button onClick={() => setShowWhyTooltip(false)} className="text-muted-foreground hover:text-foreground">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {signal.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] font-mono text-foreground/80">
                      <span className="text-primary mt-0.5">▸</span>
                      {reason}
                    </li>
                  ))}
                  {signal.rsi > 60 && <li className="flex items-start gap-2 text-[11px] font-mono text-foreground/80"><span className="text-primary mt-0.5">▸</span>RSI عند {signal.rsi} — {signal.rsiSignal}</li>}
                  {signal.macd !== "محايد" && <li className="flex items-start gap-2 text-[11px] font-mono text-foreground/80"><span className="text-primary mt-0.5">▸</span>MACD {signal.macd} ({signal.macdHist})</li>}
                </ul>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", signal.convergence >= 4 ? "bg-primary" : signal.convergence >= 3 ? "bg-accent" : "bg-warning")} style={{ width: `${(signal.convergence / 5) * 100}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{signal.convergence}/5 تقارب</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Tap to Analyze" button */}
        {!expanded && (
          <div className="px-4 pb-3">
            <motion.button
              onClick={() => setExpanded(true)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-mono font-bold transition-all border",
                "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
              )}
            >
              <Eye className="w-4 h-4" />
              اضغط للتحليل
              <Zap className="w-3.5 h-3.5 text-accent" />
            </motion.button>
          </div>
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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

                {/* Reveal or show levels */}
                {!revealed ? (
                  <motion.button
                    onClick={handleReveal}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-mono font-bold transition-all btn-nexus text-primary"
                  >
                    <Lock className="w-4 h-4" />
                    كشف المستويات
                    <span className="text-[10px] bg-primary/15 px-1.5 py-0.5 rounded-md">
                      {isFounder ? "مجاني" : `${CREDIT_COSTS.reveal_signal} نقطة`}
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
                      <Unlock className="w-3 h-3" /> تم كشف المستويات
                    </div>
                    {/* Entry / TP / SL grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-secondary/30 rounded-lg px-2 py-2 text-center">
                        <p className="text-[9px] font-mono text-muted-foreground">Entry</p>
                        <p className="text-[13px] font-mono font-bold">{signal.entry}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg px-2 py-2 text-center border border-primary/10">
                        <p className="text-[9px] font-mono text-muted-foreground">TP</p>
                        <p className="text-[13px] font-mono font-bold text-primary">{signal.target1}</p>
                      </div>
                      <div className="bg-destructive/5 rounded-lg px-2 py-2 text-center border border-destructive/10">
                        <p className="text-[9px] font-mono text-muted-foreground">SL</p>
                        <p className="text-[13px] font-mono font-bold text-destructive">{signal.sl}</p>
                      </div>
                    </div>

                    {/* Risk & R:R */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={cn(
                        "px-2 py-1 rounded-lg",
                        signal.risk === "منخفض" ? "bg-primary/10 text-primary" : signal.risk === "متوسط" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                      )}>
                        Risk: {signal.risk}
                      </span>
                      <span className="text-muted-foreground">R:R {signal.rr}</span>
                    </div>

                    {/* Reasons */}
                    <div className="flex flex-wrap gap-1.5">
                      {signal.reasons.map((r, ri) => (
                        <span key={ri} className="text-[10px] font-mono bg-secondary px-2 py-1 rounded-md text-muted-foreground">{r}</span>
                      ))}
                    </div>

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
                  </motion.div>
                )}

                {/* Deep Dive */}
                {revealed && (
                  <Collapsible open={deepDiveOpen} onOpenChange={setDeepDiveOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary/30 border border-border/10 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {deepDiveOpen ? "إخفاء التفاصيل المتقدمة" : "تحليل معمّق (RSI · MACD · BB)"}
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
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-primary/5 rounded-lg px-2 py-1.5 text-center border border-primary/10">
                            <p className="text-[9px] font-mono text-muted-foreground">TP 2</p>
                            <p className="text-[12px] font-mono font-semibold text-primary">{signal.target2}</p>
                          </div>
                          <div className="bg-secondary/30 rounded-lg px-2 py-1.5 text-center">
                            <p className="text-[9px] font-mono text-muted-foreground">Sentiment</p>
                            <p className="text-[12px] font-mono font-semibold">{signal.sentiment}%</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  {revealed && (
                    <button
                      onClick={() => navigate("/trade-journal", {
                        state: {
                          prefill: {
                            pair: signal.pair,
                            direction: signal.direction === "صعودي" ? "buy" : "sell",
                            entry: signal.entry,
                            tp: signal.target1,
                            sl: signal.sl,
                            reason: signal.reasons.join(" • "),
                            strategy: `${signal.timeFrame} | ${signal.direction} | ثقة ${signal.confidence}%`,
                          }
                        }
                      })}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Log to Journal
                    </button>
                  )}
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
