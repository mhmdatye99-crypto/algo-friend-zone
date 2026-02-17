import { motion } from "framer-motion";
import { Lock, Crown, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  featureName: string;
  children: React.ReactNode;
  className?: string;
}

export const SubscriptionGate = ({ featureName, children, className }: Props) => {
  const navigate = useNavigate();

  return (
    <div className={cn("relative", className)}>
      {/* Blurred content */}
      <div className="blur-[8px] opacity-30 pointer-events-none select-none">
        {children}
      </div>

      {/* Institutional Upgrade Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
      >
        <div
          className="flex flex-col items-center gap-4 rounded-2xl backdrop-blur-xl px-8 py-8 max-w-xs w-full mx-4"
          style={{
            background: "hsla(240, 15%, 4%, 0.92)",
            border: "1px solid hsla(43, 100%, 50%, 0.12)",
            boxShadow: "0 16px 48px hsla(0,0%,0%,0.5), 0 0 32px hsla(43,100%,50%,0.04)",
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary/80" />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-bold font-mono">ترقية مطلوبة</h3>
            <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
              {featureName} متاح حصرياً لمشتركي X-Pro و X-Elite
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/subscription")}
            className="w-full py-3.5 rounded-xl font-mono font-bold text-[12px] flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/25 text-primary hover:from-primary/30 hover:to-accent/30 transition-all"
          >
            <Crown className="w-4 h-4" />
            عرض الخطط
          </motion.button>

          <div className="flex items-center gap-1.5 text-[8px] font-mono text-muted-foreground/50">
            <Shield className="w-3 h-3" />
            <span>دفع آمن • إلغاء في أي وقت</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
