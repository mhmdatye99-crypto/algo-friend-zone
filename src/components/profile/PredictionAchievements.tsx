import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, Award, BarChart3, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PredictionStats {
  total: number;
  correct: number;
  incorrect: number;
  pending: number;
  successRate: number;
  bullishCorrect: number;
  bearishCorrect: number;
  bestPair: string | null;
  reputationPoints: number;
  streak: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35 }
  }),
};

const PredictionAchievements = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setLoading(true);

      const [{ data: posts }, { data: profile }] = await Promise.all([
        supabase
          .from("community_posts")
          .select("prediction, outcome, pair")
          .eq("user_id", user.id),
        supabase
          .from("profiles")
          .select("reputation_points")
          .eq("user_id", user.id)
          .single(),
      ]);

      if (!posts) { setLoading(false); return; }

      const total = posts.length;
      const correct = posts.filter(p => p.outcome === "correct").length;
      const incorrect = posts.filter(p => p.outcome === "incorrect").length;
      const pending = posts.filter(p => p.outcome === "pending").length;
      const successRate = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

      const bullishCorrect = posts.filter(p => p.prediction === "bullish" && p.outcome === "correct").length;
      const bearishCorrect = posts.filter(p => p.prediction === "bearish" && p.outcome === "correct").length;

      // Best pair by correct predictions
      const pairMap = new Map<string, number>();
      posts.filter(p => p.outcome === "correct").forEach(p => {
        pairMap.set(p.pair, (pairMap.get(p.pair) || 0) + 1);
      });
      let bestPair: string | null = null;
      let bestCount = 0;
      pairMap.forEach((count, pair) => {
        if (count > bestCount) { bestCount = count; bestPair = pair; }
      });

      // Calculate streak of correct predictions
      const resolved = posts
        .filter(p => p.outcome === "correct" || p.outcome === "incorrect")
        .sort((a, b) => 0); // already ordered
      let streak = 0;
      for (const p of resolved) {
        if (p.outcome === "correct") streak++;
        else break;
      }

      setStats({
        total, correct, incorrect, pending, successRate,
        bullishCorrect, bearishCorrect, bestPair,
        reputationPoints: profile?.reputation_points || 0,
        streak,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center space-y-2">
        <Target className="w-8 h-8 text-primary mx-auto opacity-50" />
        <p className="text-[12px] font-mono font-bold">لا توجد توقعات بعد</p>
        <p className="text-[10px] font-mono text-muted-foreground">انشر أول تحليل في غرفة العمليات لبدء تتبع إنجازاتك!</p>
      </div>
    );
  }

  const tier = stats.successRate >= 80 ? { label: "أسطوري", icon: Crown, color: "text-primary" }
    : stats.successRate >= 60 ? { label: "محترف", icon: Award, color: "text-accent" }
    : stats.successRate >= 40 ? { label: "واعد", icon: Zap, color: "text-success" }
    : { label: "مبتدئ", icon: Target, color: "text-muted-foreground" };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (stats.successRate / 100) * circumference;

  return (
    <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
      {/* Success Rate Ring */}
      <motion.div className="glass rounded-xl p-5 flex items-center gap-5" variants={fadeUp} custom={0}>
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.2" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke={stats.successRate >= 60 ? "hsl(var(--success))" : stats.successRate >= 40 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold font-mono">{stats.successRate}%</span>
            <span className="text-[8px] font-mono text-muted-foreground uppercase">نسبة النجاح</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <tier.icon className={cn("w-4 h-4", tier.color)} />
            <span className="text-[12px] font-mono font-bold">{tier.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">
              <span className="text-foreground font-bold">{stats.reputationPoints}</span> نقطة سمعة
            </span>
          </div>
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span className="text-[10px] font-mono text-muted-foreground">
                سلسلة <span className="text-foreground font-bold">{stats.streak}</span> توقعات صحيحة
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-2 gap-2" variants={fadeUp} custom={1}>
        <StatCard icon={Target} label="إجمالي التوقعات" value={stats.total} color="text-primary" />
        <StatCard icon={Award} label="توقعات صحيحة" value={stats.correct} color="text-success" />
        <StatCard icon={TrendingUp} label="صعودي صحيح" value={stats.bullishCorrect} color="text-success" />
        <StatCard icon={TrendingDown} label="هبوطي صحيح" value={stats.bearishCorrect} color="text-destructive" />
      </motion.div>

      {/* Pending & Best Pair */}
      <motion.div className="grid grid-cols-2 gap-2" variants={fadeUp} custom={2}>
        <div className="glass rounded-xl p-3 text-center border border-border/10">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">قيد التحقق</p>
          <p className="text-lg font-bold font-mono text-warning">{stats.pending}</p>
        </div>
        {stats.bestPair && (
          <div className="glass rounded-xl p-3 text-center border border-border/10">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">أفضل أصل</p>
            <p className="text-sm font-bold font-mono text-primary">{stats.bestPair}</p>
          </div>
        )}
      </motion.div>

      {/* Breakdown Bar */}
      {(stats.correct + stats.incorrect) > 0 && (
        <motion.div className="glass rounded-xl p-3 space-y-2" variants={fadeUp} custom={3}>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">توزيع النتائج</p>
          <div className="h-2 rounded-full bg-muted overflow-hidden flex">
            <motion.div
              className="h-full bg-success"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.correct / (stats.correct + stats.incorrect)) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              className="h-full bg-destructive"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.incorrect / (stats.correct + stats.incorrect)) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-success font-bold">{stats.correct} صحيح</span>
            <span className="text-destructive font-bold">{stats.incorrect} خاطئ</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) => (
  <div className="glass rounded-xl p-3 text-center border border-border/10">
    <Icon className={cn("w-4 h-4 mx-auto mb-1.5", color)} />
    <p className="text-lg font-bold font-mono">{value}</p>
    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
  </div>
);

export default PredictionAchievements;
