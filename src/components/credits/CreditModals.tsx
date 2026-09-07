import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Crown, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CREDIT_PACKAGES } from "@/hooks/useCredits";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  currentCredits: number;
}

export const BuyCreditsModal = ({ open, onClose, currentCredits }: Props) => {
  const navigate = useNavigate();

  const handleBuy = (pkg: typeof CREDIT_PACKAGES[number]) => {
    toast.info(`سيتم تفعيل حزمة "${pkg.nameAr}" قريباً — تواصل مع المشرف`);
    onClose();
    navigate("/subscription");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-2xl p-5 space-y-4 bg-card border border-primary/15 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold tracking-wider">NEXUS CREDITS</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <p className="text-[13px] font-mono text-muted-foreground uppercase tracking-wider">رصيدك الحالي</p>
              <p className="text-3xl font-mono font-bold text-primary mt-1">{currentCredits}</p>
              <p className="text-[13px] font-mono text-muted-foreground">Nexus Credits</p>
            </div>

            <div className="space-y-2.5">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleBuy(pkg)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all hover:brightness-110 border",
                    pkg.id === "pro" ? "border-primary/25 bg-primary/5" : pkg.id === "whale" ? "bg-primary/10 border-primary/20" : "bg-secondary/60 border-border"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    pkg.id === "starter" ? "bg-accent/10" : pkg.id === "pro" ? "bg-primary/10" : "bg-primary/15",
                  )}>
                    {pkg.id === "starter" ? <Zap className="w-5 h-5 text-accent" /> :
                     pkg.id === "pro" ? <Sparkles className="w-5 h-5 text-primary" /> :
                     <Crown className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[13px] font-mono font-bold">{pkg.nameAr}</p>
                    <p className="text-[13px] font-mono text-muted-foreground">
                      {('unlimited' in pkg && pkg.unlimited) ? "رصيد غير محدود" : `${pkg.credits} Nexus Credits`}
                    </p>
                  </div>
                  <p className="text-[14px] font-mono font-bold text-primary">${pkg.price}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface InsufficientProps {
  open: boolean;
  onClose: () => void;
  onBuyCredits: () => void;
  requiredCredits: number;
  currentCredits: number;
}

export const InsufficientCreditsPopup = ({ open, onClose, onBuyCredits, requiredCredits, currentCredits }: InsufficientProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-5"
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-xs rounded-2xl p-5 text-center space-y-4 bg-card border border-destructive/20 shadow-2xl"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="text-sm font-display font-bold tracking-wider">INSUFFICIENT CREDITS</h3>
          <p className="text-[13px] font-mono text-muted-foreground">
            هذا الإجراء يحتاج <span className="text-primary font-bold">{requiredCredits}</span> رصيد —
            لديك <span className="text-destructive font-bold">{currentCredits}</span> فقط
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-secondary text-[13px] font-mono font-bold text-muted-foreground">
              لاحقاً
            </button>
            <button
              onClick={() => { onClose(); onBuyCredits(); }}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-mono font-bold btn-nexus text-primary"
            >
              شراء رصيد
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
