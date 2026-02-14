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
            className="relative w-full max-w-sm rounded-2xl p-5 space-y-4"
            style={{
              background: "hsla(240, 15%, 3%, 0.95)",
              border: "1px solid hsla(43, 100%, 50%, 0.15)",
              boxShadow: "0 20px 60px hsla(0,0%,0%,0.5), 0 0 40px hsla(43,100%,50%,0.08)",
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold tracking-wider">NEXUS CREDITS</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">رصيدك الحالي</p>
              <p className="text-3xl font-mono font-bold text-primary mt-1">{currentCredits}</p>
              <p className="text-[10px] font-mono text-muted-foreground">Nexus Credits</p>
            </div>

            <div className="space-y-2.5">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleBuy(pkg)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all hover:brightness-110",
                    pkg.id === "pro" ? "border-primary/25" : "border-border/15",
                  )}
                  style={{
                    background: pkg.id === "whale"
                      ? "linear-gradient(135deg, hsla(43,100%,50%,0.1), hsla(190,100%,50%,0.05))"
                      : "hsla(240, 15%, 5%, 0.8)",
                    border: `1px solid ${pkg.id === "whale" ? "hsla(43,100%,50%,0.2)" : "hsla(240,10%,15%,0.5)"}`,
                  }}
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
                    <p className="text-[12px] font-mono font-bold">{pkg.nameAr}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
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
          className="relative w-full max-w-xs rounded-2xl p-5 text-center space-y-4"
          style={{
            background: "hsla(240, 15%, 3%, 0.95)",
            border: "1px solid hsla(350, 100%, 50%, 0.2)",
            boxShadow: "0 20px 60px hsla(0,0%,0%,0.5), 0 0 30px hsla(350,100%,50%,0.1)",
          }}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="text-sm font-display font-bold tracking-wider">INSUFFICIENT CREDITS</h3>
          <p className="text-[11px] font-mono text-muted-foreground">
            هذا الإجراء يحتاج <span className="text-primary font-bold">{requiredCredits}</span> رصيد —
            لديك <span className="text-destructive font-bold">{currentCredits}</span> فقط
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-secondary text-[11px] font-mono font-bold text-muted-foreground">
              لاحقاً
            </button>
            <button
              onClick={() => { onClose(); onBuyCredits(); }}
              className="flex-1 py-2.5 rounded-xl text-[11px] font-mono font-bold btn-nexus text-primary"
            >
              شراء رصيد
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
