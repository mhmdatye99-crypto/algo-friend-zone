import { motion } from "framer-motion";
import { BarChart3, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = {
  totalPredictions: 1247,
  correctPredictions: 892,
  successRate: 71.5,
  weeklyChange: +2.3,
  breakdown: [
    { label: "كريبتو", rate: 74, total: 520 },
    { label: "فوركس", rate: 69, total: 412 },
    { label: "سلع", rate: 72, total: 315 },
  ],
};

const CommunitySuccessRate = () => {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
            معدل نجاح المجتمع
          </span>
        </div>
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded-md",
          stats.weeklyChange > 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
        )}>
          {stats.weeklyChange > 0 ? "+" : ""}{stats.weeklyChange}% هذا الأسبوع
        </span>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-3xl font-bold font-mono text-success">{stats.successRate}%</span>
        <div className="mb-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" />{stats.correctPredictions} صحيح</span>
            <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" />{stats.totalPredictions - stats.correctPredictions} خطأ</span>
          </div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-success to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${stats.successRate}%` }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.breakdown.map((cat, i) => (
          <div key={i} className="bg-secondary/40 rounded-lg px-2 py-2 text-center border border-border/10">
            <p className="text-[10px] text-muted-foreground font-mono mb-1">{cat.label}</p>
            <p className={cn("text-[14px] font-bold font-mono", cat.rate >= 72 ? "text-success" : "text-accent")}>{cat.rate}%</p>
            <p className="text-[8px] font-mono text-muted-foreground">{cat.total} تحليل</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunitySuccessRate;
