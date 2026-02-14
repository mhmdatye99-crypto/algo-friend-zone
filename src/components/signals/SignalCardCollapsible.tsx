import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronDown, Lock, Unlock, Layers, Zap, Eye } from "lucide-react";
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

const SignalCardCollapsible = ({ signal }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const navigate = useNavigate();
  const { credits, spendCredits, canAfford, isFounder } = useCredits();

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

  return (
    <>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        className={cn(
          "glass rounded-xl overflow-hidden transition-all duration-300",
          signal.alphaScore >= 90 ? "border-primary/25 glow-gold" : "border-border/10"
        )}
      >
        {/* Compact Header — always visible */}
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
                {signal.alphaScore >= 90 && (
                  <span className="text-[8px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-mono font-bold animate-pulse">⚡ ألفا</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground">{signal.timeFrame}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className={cn(
                  "text-[10px] font-mono font-bold",
                  signal.direction === "صعودي" ? "text-success" : "text-destructive"
                )}>
                  {signal.direction}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Confidence badge */}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-[12px] border",
              signal.confidence >= 85 ? "bg-success/10 text-success border-success/20" :
              signal.confidence >= 70 ? "bg-primary/10 text-primary border-primary/20" :
              "bg-warning/10 text-warning border-warning/20"
            )}>
              {signal.confidence}
            </div>

            {/* Direction icon */}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border",
              signal.direction === "صعودي" ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"
            )}>
              {signal.direction === "صعودي" 
                ? <TrendingUp className="w-4 h-4 text-success" /> 
                : <TrendingDown className="w-4 h-4 text-destructive" />}
            </div>
          </div>
        </div>

        {/* "Tap to Analyze" button — shown when collapsed */}
        {!expanded && (
          <div className="px-4 pb-3">
            <motion.button
              onClick={() => setExpanded(true)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-mono font-bold transition-all border",
                "bg-accent/5 text-accent border-accent/20 hover:bg-accent/10"
              )}
            >
              <Eye className="w-4 h-4" />
              اضغط للتحليل
              <Zap className="w-3.5 h-3.5 text-primary" />
            </motion.button>
          </div>
        )}

        {/* Expanded analysis content */}
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
                {/* Collapse button */}
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
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-success">
                      <Unlock className="w-3 h-3" /> تم كشف المستويات
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-secondary/30 rounded-lg px-2 py-2 text-center">
                        <p className="text-[9px] font-mono text-muted-foreground">الدخول</p>
                        <p className="text-[13px] font-mono font-bold">{signal.entry}</p>
                      </div>
                      <div className="bg-success/5 rounded-lg px-2 py-2 text-center">
                        <p className="text-[9px] font-mono text-muted-foreground">الهدف</p>
                        <p className="text-[13px] font-mono font-bold text-success">{signal.target1}</p>
                      </div>
                      <div className="bg-destructive/5 rounded-lg px-2 py-2 text-center">
                        <p className="text-[9px] font-mono text-muted-foreground">وقف</p>
                        <p className="text-[13px] font-mono font-bold text-destructive">{signal.sl}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={cn(
                        "px-2 py-1 rounded-lg",
                        signal.risk === "منخفض" ? "bg-success/10 text-success" : signal.risk === "متوسط" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                      )}>
                        مخاطرة: {signal.risk}
                      </span>
                      <span className="text-muted-foreground">R:R {signal.rr}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {signal.reasons.map((r, ri) => (
                        <span key={ri} className="text-[10px] font-mono bg-secondary px-2 py-1 rounded-md text-muted-foreground">{r}</span>
                      ))}
                    </div>
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
                              signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-success" : "text-foreground"
                            )}>{signal.rsi}</p>
                            <p className="text-[9px] font-mono text-muted-foreground">{signal.rsiSignal}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                            <p className="text-[9px] font-mono text-muted-foreground">MACD</p>
                            <p className={cn("text-[13px] font-mono font-bold",
                              signal.macd === "صعودي" ? "text-success" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
                            )}>{signal.macdHist}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                            <p className="text-[9px] font-mono text-muted-foreground">BB</p>
                            <p className="text-[13px] font-mono font-bold">{signal.bbPosition.replace("نطاق ", "")}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center">
                            <p className="text-[9px] font-mono text-muted-foreground">الحجم</p>
                            <p className="text-[13px] font-mono font-bold">{signal.volume}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-success/5 rounded-lg px-2 py-1.5 text-center">
                            <p className="text-[9px] font-mono text-muted-foreground">هدف 2</p>
                            <p className="text-[12px] font-mono font-semibold text-success">{signal.target2}</p>
                          </div>
                          <div className="bg-secondary/30 rounded-lg px-2 py-1.5 text-center">
                            <p className="text-[9px] font-mono text-muted-foreground">معنويات</p>
                            <p className="text-[12px] font-mono font-semibold">{signal.sentiment}%</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Footer */}
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
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold bg-success/10 text-success px-3 py-2 rounded-lg hover:bg-success/20 transition-colors border border-success/20"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      نفّذ وسجّل
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/asset/${encodeURIComponent(signal.pair)}`)}
                    className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    تفاصيل الأصل
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <InsufficientCreditsPopup
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        onBuyCredits={() => setShowBuyCredits(true)}
        requiredCredits={CREDIT_COSTS.reveal_signal}
        currentCredits={credits}
      />
      <BuyCreditsModal
        open={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        currentCredits={credits}
      />
    </>
  );
};

export default SignalCardCollapsible;
