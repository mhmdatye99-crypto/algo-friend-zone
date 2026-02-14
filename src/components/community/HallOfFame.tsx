import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Award, Target, TrendingUp, Gift, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LeaderEntry {
  rank: number;
  display_name: string;
  reputation_points: number;
  prediction_count: number;
  user_id: string;
}

const rankIcons = [Crown, Award, Target, TrendingUp, TrendingUp];
const rankBadges = ["أفضل متنبئ", "أستاذ الشارت", "متتبع الحيتان", "محلل ناشئ", "محلل ناشئ"];

const HallOfFame = () => {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Get top profiles by reputation
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, reputation_points")
        .order("reputation_points", { ascending: false })
        .limit(10);

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const userIds = profiles.map(p => p.user_id);
      const { data: posts } = await supabase
        .from("community_posts")
        .select("user_id")
        .in("user_id", userIds);

      const postCountMap = new Map<string, number>();
      posts?.forEach(p => postCountMap.set(p.user_id, (postCountMap.get(p.user_id) || 0) + 1));

      const entries: LeaderEntry[] = profiles.map((p, i) => ({
        rank: i + 1,
        display_name: p.display_name || "محلل مجهول",
        reputation_points: p.reputation_points,
        prediction_count: postCountMap.get(p.user_id) || 0,
        user_id: p.user_id,
      }));

      setLeaders(entries);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center space-y-2">
        <Trophy className="w-8 h-8 text-primary mx-auto" />
        <p className="text-[13px] font-mono font-bold">لم يتم تسجيل أي نقاط سمعة بعد</p>
        <p className="text-[11px] font-mono text-muted-foreground">شارك تحليلاتك واكسب نقاط السمعة!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Weekly Rewards Banner */}
      <div className="glass rounded-xl p-3 border border-primary/15 bg-gradient-to-l from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-mono font-bold text-primary">مكافآت الأسبوع</span>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          أفضل 3 محللين يحصلون على رصيد Nexus مجاني: 🥇 50 نقطة · 🥈 30 نقطة · 🥉 15 نقطة
        </p>
      </div>

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
          {leaders.map((analyst, i) => {
            const Icon = rankIcons[Math.min(i, rankIcons.length - 1)];
            const badge = rankBadges[Math.min(i, rankBadges.length - 1)];
            return (
              <motion.div
                key={analyst.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                  i === 0
                    ? "bg-primary/5 border-primary/20"
                    : i === 1
                    ? "bg-accent/5 border-accent/20"
                    : i === 2
                    ? "bg-warning/5 border-warning/20"
                    : "bg-secondary/40 border-border/10"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-mono font-bold",
                  i === 0 ? "bg-primary/20 text-primary" : i === 1 ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                )}>
                  {analyst.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-mono font-medium">{analyst.display_name}</span>
                    <Icon className={cn("w-3 h-3", i === 0 ? "text-primary" : i === 1 ? "text-accent" : "text-muted-foreground")} />
                    {i < 3 && <Gift className="w-3 h-3 text-warning" />}
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{badge} · {analyst.prediction_count} تحليل</span>
                </div>

                <div className="text-end">
                  <span className={cn(
                    "text-[14px] font-mono font-bold",
                    i === 0 ? "text-primary" : i === 1 ? "text-accent" : "text-muted-foreground"
                  )}>
                    {analyst.reputation_points}
                  </span>
                  <p className="text-[8px] font-mono text-muted-foreground">سمعة</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
