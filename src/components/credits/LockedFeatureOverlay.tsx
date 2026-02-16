import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { InsufficientCreditsPopup, BuyCreditsModal } from "@/components/credits/CreditModals";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Props {
  cost: number;
  featureName: string;
  featureDescription?: string;
  onUnlock: () => void;
  children: React.ReactNode;
  locked: boolean;
  compact?: boolean;
}

export const LockedFeatureOverlay = ({
  cost,
  featureName,
  featureDescription,
  onUnlock,
  children,
  locked,
  compact = false,
}: Props) => {
  const { credits, spendCredits, canAfford, isFounder } = useCredits();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  if (!locked) return <>{children}</>;

  const handleUnlock = async () => {
    if (!user) {
      toast.error("سجّل دخولك أولاً");
      navigate("/auth");
      return;
    }

    if (isFounder) {
      onUnlock();
      toast.success("Founder — وصول مجاني");
      return;
    }

    if (!canAfford(cost)) {
      setShowInsufficient(true);
      return;
    }

    setUnlocking(true);
    const success = await spendCredits(cost, featureName, featureDescription || featureName);
    if (success) {
      onUnlock();
      toast.success(`تم فتح ${featureDescription || featureName} — ${cost} نقطة`);
    } else {
      setShowInsufficient(true);
    }
    setUnlocking(false);
  };

  return (
    <>
      <div className="relative">
        {/* Blurred content */}
        <div className="blur-[6px] opacity-40 pointer-events-none select-none">
          {children}
        </div>

        {/* Lock overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
        >
          <div
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl backdrop-blur-md",
              compact ? "px-4 py-3" : "px-6 py-5"
            )}
            style={{
              background: "hsla(240, 15%, 3%, 0.85)",
              border: "1px solid hsla(43, 100%, 50%, 0.15)",
              boxShadow: "0 8px 32px hsla(0,0%,0%,0.4), 0 0 24px hsla(43,100%,50%,0.06)",
            }}
          >
            <div className={cn(
              "rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center",
              compact ? "w-8 h-8" : "w-12 h-12"
            )}>
              <Lock className={cn("text-primary", compact ? "w-4 h-4" : "w-5 h-5")} />
            </div>

            {!compact && (
              <p className="text-[11px] font-mono text-muted-foreground text-center max-w-[200px]">
                {featureDescription || "هذه الميزة تحتاج رصيد"}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUnlock}
              disabled={unlocking}
              className={cn(
                "flex items-center gap-2 rounded-xl font-mono font-bold transition-all",
                compact ? "px-3 py-2 text-[10px]" : "px-5 py-2.5 text-[11px]",
                "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary hover:from-primary/30 hover:to-accent/30"
              )}
            >
              {unlocking ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              فتح
              <span className="bg-primary/15 px-1.5 py-0.5 rounded-md text-[9px]">
                {isFounder ? "مجاني" : `${cost} نقطة`}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <InsufficientCreditsPopup
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        onBuyCredits={() => setShowBuyCredits(true)}
        requiredCredits={cost}
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
