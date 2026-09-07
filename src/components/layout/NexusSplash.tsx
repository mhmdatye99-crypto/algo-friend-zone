import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NexusSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(onComplete, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Central glow */}
        <motion.div
          className="absolute w-60 h-60 pointer-events-none rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 text-center"
        >
          <h1 className="text-[30px] font-mono font-bold tracking-[0.25em] text-primary">
            NEXUS
          </h1>
          <p className="text-[13px] font-medium text-muted-foreground tracking-[0.3em] uppercase mt-1">
            TRADE AI
          </p>
        </motion.div>

        {/* Status */}
        <motion.div
          className="relative z-10 mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[13px] text-muted-foreground tracking-wide">
            {phase === 0 && "جارٍ التهيئة..."}
            {phase === 1 && "الاتصال بمركز الذكاء..."}
            {phase === 2 && "✓ تم الاتصال"}
          </p>

          <div className="w-40 h-1 mt-3 mx-auto rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: phase >= 2 ? "100%" : phase >= 1 ? "65%" : "15%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NexusSplash;
