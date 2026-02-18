import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { Target } from "lucide-react";

const WealthProgressCircle = () => {
  const { goal, stats } = useGoalPlanner();

  if (!goal || !stats) {
    return (
      <div className="rounded-lg p-4 border border-border/15 bg-card/50 flex flex-col items-center justify-center gap-2 min-h-[180px]">
        <Target className="w-5 h-5 text-muted-foreground/30" />
        <p className="text-[9px] font-mono text-muted-foreground/50">لا يوجد هدف مالي نشط</p>
      </div>
    );
  }

  const progress = Math.min(100, Math.max(0, stats.progress));
  const radius = 62;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Watch tick marks (60 like a real watch)
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  const majorTicks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const tickRadius = 72;
  const center = 80;

  const progressColor = progress >= 75 ? "hsl(var(--success))" : progress >= 40 ? "hsl(var(--primary))" : "hsl(var(--warning))";
  const progressColorClass = progress >= 75 ? "text-success" : progress >= 40 ? "text-primary" : "text-warning";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg p-4 border border-border/15 bg-card/50"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-wider">تقدم الثروة</span>
        <span className="text-[8px] font-mono text-muted-foreground/40">{stats.title}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Watch Face */}
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <svg viewBox="0 0 160 160" className="w-full h-full">
            {/* Outer bezel ring */}
            <circle cx={center} cy={center} r="76" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />

            {/* Tick marks */}
            {ticks.map((i) => {
              const angle = (i / 60) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const isMajor = majorTicks.includes(i);
              const outerR = tickRadius;
              const innerR = isMajor ? tickRadius - 6 : tickRadius - 3;
              return (
                <line
                  key={i}
                  x1={center + Math.cos(rad) * innerR}
                  y1={center + Math.sin(rad) * innerR}
                  x2={center + Math.cos(rad) * outerR}
                  y2={center + Math.sin(rad) * outerR}
                  stroke={isMajor ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isMajor ? "1" : "0.5"}
                  opacity={isMajor ? 0.25 : 0.12}
                />
              );
            })}

            {/* Background track */}
            <circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              opacity="0.1"
            />

            {/* Progress arc */}
            <motion.circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
              transform={`rotate(-90 ${center} ${center})`}
            />

            {/* Glow effect on progress end */}
            <motion.circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
              transform={`rotate(-90 ${center} ${center})`}
              opacity="0.1"
              filter="blur(4px)"
            />

            {/* Inner circle border */}
            <circle cx={center} cy={center} r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15" />

            {/* Center dot */}
            <circle cx={center} cy={center} r="2" fill={progressColor} opacity="0.6" />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("text-2xl font-mono font-bold tabular-nums", progressColorClass)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {Math.round(progress)}%
            </motion.span>
            <span className="text-[7px] font-mono text-muted-foreground/40 mt-0.5">PROGRESS</span>
          </div>
        </div>

        {/* Stats panel */}
        <div className="flex-1 space-y-2.5 min-w-0">
          <div>
            <p className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-wider">الرصيد الحالي</p>
            <p className={cn("text-[15px] font-mono font-bold tabular-nums", progressColorClass)}>
              ${stats.effectiveBalance.toLocaleString()}
            </p>
          </div>
          <div className="h-px bg-border/10" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[7px] font-mono text-muted-foreground/40">الهدف</p>
              <p className="text-[10px] font-mono font-semibold tabular-nums">${goal.target_goal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[7px] font-mono text-muted-foreground/40">المتبقي</p>
              <p className="text-[10px] font-mono font-semibold tabular-nums text-warning">${stats.remaining.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-px bg-border/10" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[7px] font-mono text-muted-foreground/40">المستوى</p>
              <p className="text-[9px] font-mono font-semibold">{stats.title}</p>
            </div>
            <div>
              <p className="text-[7px] font-mono text-muted-foreground/40">أيام متبقية</p>
              <p className="text-[10px] font-mono font-semibold tabular-nums">{stats.daysRemaining || "∞"}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WealthProgressCircle;
