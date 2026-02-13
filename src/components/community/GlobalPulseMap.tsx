import { motion } from "framer-motion";
import { Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const hotspots = [
  { x: 72, y: 28, label: "طوكيو", active: true, sentiment: "bullish" },
  { x: 50, y: 32, label: "لندن", active: true, sentiment: "bearish" },
  { x: 30, y: 35, label: "نيويورك", active: true, sentiment: "bullish" },
  { x: 60, y: 45, label: "دبي", active: true, sentiment: "bullish" },
  { x: 78, y: 55, label: "سيدني", active: false, sentiment: "bearish" },
  { x: 45, y: 60, label: "ساو باولو", active: false, sentiment: "bullish" },
  { x: 55, y: 25, label: "فرانكفورت", active: true, sentiment: "bearish" },
  { x: 82, y: 38, label: "شنغهاي", active: true, sentiment: "bullish" },
];

const GlobalPulseMap = () => {
  const activeCount = hotspots.filter(h => h.active).length;
  const bullishCount = hotspots.filter(h => h.sentiment === "bullish").length;

  return (
    <div className="glass rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">النبض العالمي — مباشر</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-success flex items-center gap-1">
            <Zap className="w-3 h-3" /> {activeCount} أسواق نشطة
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-44 bg-secondary/30 rounded-lg border border-border/20 overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[20, 40, 60, 80].map(x => (
            <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          ))}
          {[25, 50, 75].map(y => (
            <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="hsl(var(--accent))" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {hotspots.filter(h => h.active).map((h, i, arr) => {
            const next = arr[(i + 1) % arr.length];
            return (
              <line key={i} x1={`${h.x}%`} y1={`${h.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke="hsl(var(--accent))" strokeWidth="0.5" strokeDasharray="4 4" />
            );
          })}
        </svg>

        {/* Hotspots */}
        {hotspots.map((spot, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {spot.active && (
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full",
                  spot.sentiment === "bullish" ? "bg-success/30" : "bg-destructive/30"
                )}
                style={{ width: 24, height: 24, margin: "-6px" }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              spot.active
                ? spot.sentiment === "bullish"
                  ? "bg-success border-success glow-success"
                  : "bg-destructive border-destructive glow-danger"
                : "bg-muted-foreground/30 border-muted-foreground/20"
            )} />
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground whitespace-nowrap">
              {spot.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[10px] font-mono text-muted-foreground">صعودي {bullishCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-[10px] font-mono text-muted-foreground">هبوطي {hotspots.length - bullishCount}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-accent">الميل العام: صعودي</span>
      </div>
    </div>
  );
};

export default GlobalPulseMap;
