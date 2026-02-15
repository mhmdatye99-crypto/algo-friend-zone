import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Challenge {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  challenge_type: string;
  target_value: number;
  metric: string;
  icon: string;
  badge_name: string;
  badge_name_ar: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
  trading_challenges?: Challenge;
}

export interface DisciplineScore {
  id: string;
  score: number;
  sl_respect: number;
  risk_adherence: number;
  no_overtrading: number;
  plan_following: number;
  consistency: number;
  score_date: string;
}

export interface TradingPlan {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  risk_per_trade: number;
  max_daily_trades: number;
  min_rr_ratio: number;
  max_daily_loss_percent: number;
  plan_type: string;
}

export interface UserBadge {
  id: string;
  badge_name: string;
  badge_name_ar: string;
  badge_icon: string;
  earned_at: string;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ["trading-challenges"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trading_challenges")
        .select("*")
        .eq("is_active", true);
      return (data || []) as Challenge[];
    },
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_challenges")
        .select("*, trading_challenges(*)")
        .order("created_at", { ascending: false });
      return (data || []) as UserChallenge[];
    },
    enabled: !!user,
  });

  const { data: disciplineScores = [] } = useQuery({
    queryKey: ["discipline-scores", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("discipline_scores")
        .select("*")
        .order("score_date", { ascending: false })
        .limit(30);
      return (data || []) as DisciplineScore[];
    },
    enabled: !!user,
  });

  const { data: tradingPlans = [] } = useQuery({
    queryKey: ["trading-plans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trading_plans")
        .select("*")
        .eq("is_active", true);
      return (data || []) as TradingPlan[];
    },
  });

  const { data: userPlan } = useQuery({
    queryKey: ["user-trading-plan", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_trading_plans")
        .select("*, trading_plans(*)")
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_badges")
        .select("*")
        .order("earned_at", { ascending: false });
      return (data || []) as UserBadge[];
    },
    enabled: !!user,
  });

  // Leaderboard - top discipline scores this week
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["discipline-leaderboard"],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from("discipline_scores")
        .select("user_id, score, score_date")
        .gte("score_date", weekAgo.toISOString().split("T")[0])
        .order("score", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase.from("user_challenges").insert({
        user_id: user!.id,
        challenge_id: challengeId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
      toast.success("تم الانضمام للتحدي بنجاح! 🎯");
    },
    onError: () => toast.error("فشل الانضمام للتحدي"),
  });

  const selectPlan = useMutation({
    mutationFn: async (planId: string) => {
      // Deactivate old plans
      await supabase
        .from("user_trading_plans")
        .update({ is_active: false })
        .eq("user_id", user!.id);
      // Insert new
      const { error } = await supabase.from("user_trading_plans").insert({
        user_id: user!.id,
        plan_id: planId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-trading-plan"] });
      toast.success("تم اختيار خطة التداول! 📋");
    },
    onError: () => toast.error("فشل اختيار الخطة"),
  });

  const latestScore = disciplineScores[0] || null;

  return {
    challenges,
    userChallenges,
    disciplineScores,
    latestScore,
    tradingPlans,
    userPlan,
    badges,
    leaderboard,
    joinChallenge,
    selectPlan,
  };
};
