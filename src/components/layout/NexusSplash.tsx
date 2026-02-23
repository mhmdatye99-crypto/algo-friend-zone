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
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ background: "#000" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Minimal grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, hsl(43 56% 52% / 0.4) 1px, transparent 1px), linear-gradient(0deg, hsl(43 56% 52% / 0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Central glow */}
        <motion.div
          className="absolute w-60 h-60 pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(43 56% 52% / 0.06) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 text-center"
        >
          <h1
            className="text-[28px] font-mono font-bold tracking-[0.25em] text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(43 56% 60%), hsl(43 56% 45%))",
            }}
          >
            NEXUS
          </h1>
          <p className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.4em] uppercase mt-1">
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
          <p className="text-[9px] font-mono text-muted-foreground/30 tracking-wider">
            {phase === 0 && "INITIALIZING..."}
            {phase === 1 && "CONNECTING TO X INTELLIGENCE..."}
            {phase === 2 && "✓ CONNECTED"}
          </p>

          {/* Progress */}
          <div className="w-40 h-[1px] mt-3 mx-auto bg-border/10 overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: "hsl(43 56% 52%)" }}
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
