import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NexusSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0); // 0: logo, 1: connecting, 2: done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ background: "#020205" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, hsla(43, 100%, 50%, 0.3) 1px, transparent 1px), linear-gradient(0deg, hsla(43, 100%, 50%, 0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Central glow */}
        <motion.div
          className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsla(43, 100%, 50%, 0.08) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 text-center"
        >
          {/* Neural node icon */}
          <motion.div
            className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.15), hsla(190, 100%, 50%, 0.1))",
              border: "1px solid hsla(43, 100%, 50%, 0.2)",
              boxShadow: "0 0 40px hsla(43, 100%, 50%, 0.15), 0 0 80px hsla(43, 100%, 50%, 0.05)",
            }}
          >
            {/* Neural network SVG */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="8" r="3" fill="hsl(43, 100%, 50%)" opacity="0.9" />
              <circle cx="8" cy="28" r="3" fill="hsl(190, 100%, 50%)" opacity="0.7" />
              <circle cx="28" cy="28" r="3" fill="hsl(43, 100%, 50%)" opacity="0.8" />
              <circle cx="18" cy="20" r="4" fill="hsl(43, 100%, 50%)" />
              <line x1="18" y1="11" x2="18" y2="16" stroke="hsl(43, 100%, 50%)" strokeWidth="1.5" opacity="0.5" />
              <line x1="11" y1="26" x2="15" y2="22" stroke="hsl(190, 100%, 50%)" strokeWidth="1.5" opacity="0.4" />
              <line x1="25" y1="26" x2="21" y2="22" stroke="hsl(43, 100%, 50%)" strokeWidth="1.5" opacity="0.4" />
            </svg>

            {/* Spinning ring */}
            <motion.div
              className="absolute inset-[-2px] rounded-2xl pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, transparent, hsla(43, 100%, 50%, 0.3), transparent, hsla(190, 100%, 50%, 0.2), transparent)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          <h1
            className="text-3xl font-display font-bold tracking-[0.15em] text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(43, 100%, 55%), hsl(43, 100%, 45%), hsl(190, 100%, 50%))",
            }}
          >
            NEXUS
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase mt-1">
            TRADE AI
          </p>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="relative z-10 mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[11px] font-mono text-muted-foreground tracking-wider">
            {phase === 0 && "جاري تهيئة النظام..."}
            {phase === 1 && "الاتصال بـ Nexus Intelligence..."}
            {phase === 2 && "✓ متصل"}
          </p>

          {/* Progress bar */}
          <div className="w-48 h-[2px] mt-3 mx-auto bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(43, 100%, 50%), hsl(190, 100%, 50%))",
              }}
              initial={{ width: "0%" }}
              animate={{ width: phase >= 2 ? "100%" : phase >= 1 ? "70%" : "20%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NexusSplash;
