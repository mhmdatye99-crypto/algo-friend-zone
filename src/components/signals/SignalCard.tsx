import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import AssetLogo from "@/components/shared/AssetLogo";
import type { DynamicSignal } from "@/hooks/useSignals";

interface SignalCardProps {
  signal: DynamicSignal;
  variant?: "full" | "compact";
  onOpen?: () => void;
}

const Level = ({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) => (
  <div className="rounded-xl bg-secondary/60 border border-border/60 py-2 px-2 text-center">
    <p className="text-[13px] font-medium text-muted-foreground leading-none mb-1.5">{label}</p>
    <p
      className={cn(
        "font-mono text-[14px] font-semibold tabular-nums nx-ltr leading-none",
        tone === "up" && "text-success",
        tone === "down" && "text-destructive",
        !tone && "text-foreground"
      )}
    >
      {value}
    </p>
  </div>
);

const SignalCard = ({ signal, variant = "full", onOpen }: SignalCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const isLong = signal.direction === "صعودي";

  const handlePrimary = () => {
    if (onOpen) onOpen();
    else setExpanded((v) => !v);
  };

  return (
    <div className="nx-card space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AssetLogo pair={signal.pair} icon={signal.icon} category={signal.category} size={40} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[16px] font-bold text-foreground nx-ltr truncate">{signal.pair}</p>
          <p className="nx-meta">{signal.category} · {signal.timeFrame}</p>
        </div>
        <span className={isLong ? "nx-badge-long" : "nx-badge-short"}>{isLong ? "LONG" : "SHORT"}</span>
      </div>

      {/* Primary metric */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[30px] font-bold tabular-nums text-primary leading-none nx-ltr">
          {signal.confidence}%
        </span>
        <span className="nx-label">ثقة التحليل</span>
      </div>

      {/* Trade setup */}
      <div className="grid grid-cols-4 gap-2">
        <Level label="ENTRY" value={signal.entry} />
        <Level label="STOP" value={signal.sl} tone="down" />
        <Level label="TP1" value={signal.target1} tone="up" />
        <Level label="TP2" value={signal.target2} tone="up" />
      </div>

      {variant === "full" && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="nx-meta">الاتجاه</p>
            <p className={cn("text-[15px] font-semibold", isLong ? "text-success" : "text-destructive")}>
              {isLong ? "صاعد" : "هابط"}
            </p>
          </div>
          <div>
            <p className="nx-meta">المخاطرة</p>
            <p className="text-[15px] font-semibold text-foreground">{signal.risk}</p>
          </div>
          <div>
            <p className="nx-meta">R:R</p>
            <p className="font-mono text-[15px] font-semibold text-foreground nx-ltr">{signal.rr}</p>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex items-center gap-2">
        <button onClick={handlePrimary} className="nx-btn-secondary nx-btn-sm flex-1">
          {variant === "compact" ? "عرض التحليل" : "عرض التحليل الكامل"}
          {!onOpen && (
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
          )}
        </button>
        {variant === "full" && (
          <button
            onClick={() => setSaved((v) => !v)}
            aria-label="حفظ"
            className={cn(
              "nx-tap flex items-center justify-center rounded-xl border transition-colors shrink-0 w-11 h-11",
              saved ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
            )}
          >
            {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border pt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="nx-meta">RSI</p>
                  <p className="font-mono text-[16px] font-semibold nx-ltr">{signal.rsi}</p>
                </div>
                <div className="text-center">
                  <p className="nx-meta">الزخم</p>
                  <p className="text-[15px] font-semibold">{signal.rsiSignal}</p>
                </div>
                <div className="text-center">
                  <p className="nx-meta">احتمال النجاح</p>
                  <p className="font-mono text-[16px] font-semibold nx-ltr">{signal.winProbability}%</p>
                </div>
              </div>
              <ul className="space-y-2">
                {signal.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2 nx-body text-[15px]">
                    <span className="text-primary">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignalCard;
