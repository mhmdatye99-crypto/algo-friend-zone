import { motion } from "framer-motion";
import { Trophy, Crown, Award, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const topAnalysts = [
  { rank: 1, name: "أحمد ر.", accuracy: 94, predictions: 47, badge: "أفضل متنبئ", icon: Crown },
  { rank: 2, name: "سارة ك.", accuracy: 91, predictions: 38, badge: "أستاذ الشارت", icon: Award },
  { rank: 3, name: "محمد ع.", accuracy: 88, predictions: 52, badge: "متتبع الحيتان", icon: Target },
  { rank: 4, name: "ليلى م.", accuracy: 85, predictions: 29, badge: "محلل ناشئ", icon: TrendingUp },
  { rank: 5, name: "خالد ف.", accuracy: 83, predictions: 41, badge: "أفضل متنبئ", icon: Award },
];

const HallOfFame = () => {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
            قاعة المجد — الأسبوع الحالي
          </span>
        </div>
        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
          تحقق AI
        </span>
      </div>

      <div className="space-y-2">
        {topAnalysts.map((analyst, i) => {
          const Icon = analyst.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                i === 0
                  ? "bg-primary/5 border-primary/20"
                  : i === 1
                  ? "bg-accent/5 border-accent/20"
                  : "bg-secondary/40 border-border/10"
              )}
            >
              {/* Rank */}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-mono font-bold",
                i === 0 ? "bg-primary/20 text-primary" : i === 1 ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
              )}>
                {analyst.rank}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-mono font-medium">{analyst.name}</span>
                  <Icon className={cn("w-3 h-3", i === 0 ? "text-primary" : i === 1 ? "text-accent" : "text-muted-foreground")} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">{analyst.badge} · {analyst.predictions} تحليل</span>
              </div>

              {/* Accuracy */}
              <div className="text-end">
                <span className={cn(
                  "text-[14px] font-mono font-bold",
                  analyst.accuracy >= 90 ? "text-success" : analyst.accuracy >= 85 ? "text-primary" : "text-accent"
                )}>
                  {analyst.accuracy}%
                </span>
                <p className="text-[8px] font-mono text-muted-foreground">دقة</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HallOfFame;
