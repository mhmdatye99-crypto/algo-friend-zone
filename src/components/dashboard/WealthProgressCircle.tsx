import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { Target } from "lucide-react";

const WealthProgressCircle = () => {
  const { goal, stats } = useGoalPlanner();

  if (!goal || !stats) {
    return (
      <div className="nx-card flex flex-col items-center justify-center gap-2 min-h-[180px]">
        <Target className="w-6 h-6 text-muted-foreground" />
        <p className="nx-meta">لا يوجد هدف مالي نشط</p>
      </div>
    );
  }

  const progress = Math.min(100, Math.max(0, stats.progress));
  const radius = 62;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const center = 80;

  const progressColor = progress >= 75 ? "hsl(var(--success))" : progress >= 40 ? "hsl(var(--primary))" : "hsl(var(--warning))";
  const progressColorClass = progress >= 75 ? "text-success" : progress >= 40 ? "text-primary" : "text-warning";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="nx-card"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="nx-label">تقدم الثروة</span>
        <span className="nx-meta">{stats.title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 148, height: 148 }}>
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("nx-num-lg text-[26px]", progressColorClass)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {Math.round(progress)}%
            </motion.span>
            <span className="nx-meta text-[12px] mt-0.5">التقدم</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <p className="nx-meta">الرصيد الحالي</p>
            <p className={cn("nx-num nx-ltr text-[17px]", progressColorClass)}>
              ${stats.effectiveBalance.toLocaleString()}
            </p>
          </div>
          <div className="h-px bg-border" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="nx-meta">الهدف</p>
              <p className="nx-num nx-ltr text-[14px]">${goal.target_goal.toLocaleString()}</p>
            </div>
            <div>
              <p className="nx-meta">المتبقي</p>
              <p className="nx-num nx-ltr text-[14px] text-warning">${stats.remaining.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="nx-meta">المستوى</p>
              <p className="text-[13px] font-semibold">{stats.title}</p>
            </div>
            <div>
              <p className="nx-meta">أيام متبقية</p>
              <p className="nx-num nx-ltr text-[14px]">{stats.daysRemaining || "∞"}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WealthProgressCircle;
