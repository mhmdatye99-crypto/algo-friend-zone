import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number;
  label: string;
}

const GaugeChart = ({ value, label }: GaugeChartProps) => {
  const angle = (value / 100) * 180 - 90; // -90 to 90 degrees
  const colorClass = value >= 70 ? "text-success" : value >= 45 ? "text-warning" : "text-destructive";
  const color = value >= 70 ? "hsl(var(--success))" : value >= 45 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px]">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" />
            <stop offset="50%" stopColor="hsl(var(--warning))" />
            <stop offset="100%" stopColor="hsl(var(--success))" />
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
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        />
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transformOrigin: "100px 100px" }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        />
        <circle cx="100" cy="100" r="5" fill={color} />
      </svg>

      <motion.div
        className="absolute bottom-0 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span className={cn("nx-num-lg text-[30px]", colorClass)}>
          {value}
        </span>
        <span className={cn("nx-label mt-0.5", colorClass)}>
          {label}
        </span>
      </motion.div>
    </div>
  );
};

export default GaugeChart;
