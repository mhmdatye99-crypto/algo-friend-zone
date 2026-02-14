import { motion } from "framer-motion";
import { BarChart3, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = {
  totalPredictions: 1247,
  correctPredictions: 892,
  successRate: 71.5,
  weeklyChange: +2.3,
  breakdown: [
    { label: "كريبتو", rate: 74, total: 520, color: "text-primary" },
    { label: "فوركس", rate: 69, total: 412, color: "text-accent" },
    { label: "سلع", rate: 72, total: 315, color: "text-success" },
  ],
};

// Thin circular progress component
const CircularProgress = ({ value, size = 72, strokeWidth = 3, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="hsla(240, 10%, 15%, 0.5)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-[15px] font-mono font-bold", color)}>{value}%</span>
      </div>
    </div>
  );
};

const CommunitySuccessRate = () => {
  return (
    <div className="space-y-3">
      {/* Main Rate Card */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">إحصائيات المجتمع</span>
          </div>
          <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-md border",
            "text-success bg-success/5 border-success/15"
          )}>
            <TrendingUp className="w-3 h-3 inline mr-1" />+{stats.weeklyChange}%
          </span>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <CircularProgress value={stats.successRate} size={88} strokeWidth={4} color="text-success" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">معدل النجاح</p>
              <p className="text-2xl font-mono font-bold text-success">{stats.successRate}%</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="w-3 h-3" /> {stats.correctPredictions}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="w-3 h-3" /> {stats.totalPredictions - stats.correctPredictions}
              </span>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground">
              من أصل {stats.totalPredictions.toLocaleString()} تحليل
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards — Bloomberg style */}
      <div className="grid grid-cols-3 gap-2">
        {stats.breakdown.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-3 flex flex-col items-center gap-2"
          >
            <CircularProgress value={cat.rate} size={56} strokeWidth={2.5} color={cat.color} />
            <div className="text-center">
              <p className="text-[10px] font-mono font-medium">{cat.label}</p>
              <p className="text-[8px] font-mono text-muted-foreground">{cat.total} تحليل</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terminal-style data strip */}
      <div className="glass rounded-xl p-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "اليوم", value: "12", sub: "تحليل" },
            { label: "نشط", value: "89", sub: "محلل" },
            { label: "دقة AI", value: "84%", sub: "متوسط" },
            { label: "تصويتات", value: "2.4K", sub: "هذا الأسبوع" },
          ].map((item, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-[14px] font-mono font-bold text-foreground">{item.value}</p>
              <p className="text-[7px] font-mono text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySuccessRate;
