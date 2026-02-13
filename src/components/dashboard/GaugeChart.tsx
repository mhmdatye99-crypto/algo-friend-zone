import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number;
  label: string;
}

const GaugeChart = ({ value, label }: GaugeChartProps) => {
  const angle = (value / 100) * 180 - 90; // -90 to 90 degrees
  const color = value >= 70 ? "hsl(155 100% 45%)" : value >= 45 ? "hsl(43 100% 50%)" : "hsl(350 100% 50%)";
  const glowColor = value >= 70 ? "155, 100%, 45%" : value >= 45 ? "43, 100%, 50%" : "350, 100%, 50%";

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px]">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsla(240, 10%, 15%, 0.6)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Gradient arc */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(350 100% 50%)" />
            <stop offset="50%" stopColor="hsl(38 100% 50%)" />
            <stop offset="100%" stopColor="hsl(155 100% 45%)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        />
        {/* Needle */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: "100px 100px" }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        />
        {/* Center dot */}
        <circle cx="100" cy="100" r="5" fill={color} />
      </svg>

      {/* Value with glow */}
      <motion.div
        className="absolute bottom-0 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span
          className={cn("text-3xl font-bold font-mono")}
          style={{
            color,
            textShadow: `0 0 20px hsla(${glowColor}, 0.5), 0 0 40px hsla(${glowColor}, 0.2)`,
          }}
        >
          {value}
        </span>
        <span className="text-[11px] font-mono font-semibold mt-0.5" style={{ color }}>
          {label}
        </span>
      </motion.div>
    </div>
  );
};

export default GaugeChart;
