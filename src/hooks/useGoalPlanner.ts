import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type RiskAppetite = "conservative" | "aggressive";

export interface FinancialGoal {
  id: string;
  user_id: string;
  initial_capital: number;
  target_goal: number;
  risk_appetite: RiskAppetite;
  current_balance: number;
  current_level: number;
  expert_title: string;
  started_at: string;
  target_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalEntry {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  entry_date: string;
  created_at: string;
}

const EXPERT_TITLES = [
  "مبتدئ", "مراقب", "محلل", "استراتيجي", "تاكتيكي",
  "خبير", "قائد", "نخبوي", "أسطوري", "أسطورة الأسواق"
];

function getLevelForProgress(progress: number): number {
  return Math.min(10, Math.max(1, Math.ceil(progress / 10)));
}

export function useGoalPlanner() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ["financial-goal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as FinancialGoal | null;
    },
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["goal-entries", goal?.id],
    enabled: !!goal,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_entries")
        .select("*")
        .eq("goal_id", goal!.id)
        .order("entry_date", { ascending: true });
      if (error) throw error;
      return data as GoalEntry[];
    },
  });

  // Fetch closed trades P&L to sync with goal
  const { data: tradePnl } = useQuery({
    queryKey: ["trades-pnl-total", user?.id],
    enabled: !!user && !!goal,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("pnl, closed_at, pair, direction")
        .eq("user_id", user!.id)
        .eq("status", "closed")
        .not("pnl", "is", null)
        .order("closed_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Compute the real balance from trades
  const tradeStats = useMemo(() => {
    if (!tradePnl || !goal) return null;
    const totalPnl = tradePnl.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const realBalance = goal.initial_capital + totalPnl;
    const wins = tradePnl.filter(t => (t.pnl ?? 0) > 0).length;
    const losses = tradePnl.filter(t => (t.pnl ?? 0) < 0).length;
    const recentTrades = tradePnl.slice(-5);
    
    return {
      totalPnl: Math.round(totalPnl * 100) / 100,
      realBalance: Math.round(realBalance * 100) / 100,
      tradeCount: tradePnl.length,
      wins,
      losses,
      winRate: tradePnl.length > 0 ? Math.round((wins / tradePnl.length) * 100) : 0,
      recentTrades,
    };
  }, [tradePnl, goal]);

  const createGoal = useMutation({
    mutationFn: async (params: { initial_capital: number; target_goal: number; risk_appetite: RiskAppetite; target_date?: string }) => {
      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          user_id: user!.id,
          initial_capital: params.initial_capital,
          target_goal: params.target_goal,
          risk_appetite: params.risk_appetite,
          current_balance: params.initial_capital,
          target_date: params.target_date || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial-goal"] });
      toast.success("تم إنشاء الهدف المالي بنجاح");
    },
    onError: () => toast.error("فشل إنشاء الهدف"),
  });

  const addEntry = useMutation({
    mutationFn: async (params: { amount: number; note?: string }) => {
      if (!goal) throw new Error("No goal");
      const { error: entryErr } = await supabase
        .from("goal_entries")
        .insert({
          goal_id: goal.id,
          user_id: user!.id,
          amount: params.amount,
          note: params.note || null,
        });
      if (entryErr) throw entryErr;

      const newBalance = (goal.current_balance || goal.initial_capital) + params.amount;
      const totalNeeded = goal.target_goal - goal.initial_capital;
      const achieved = newBalance - goal.initial_capital;
      const progress = totalNeeded > 0 ? Math.max(0, (achieved / totalNeeded) * 100) : 0;
      const newLevel = getLevelForProgress(progress);
      const newTitle = EXPERT_TITLES[newLevel - 1] || EXPERT_TITLES[0];

      const { error: updateErr } = await supabase
        .from("financial_goals")
        .update({
          current_balance: newBalance,
          current_level: newLevel,
          expert_title: newTitle,
        })
        .eq("id", goal.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial-goal"] });
      qc.invalidateQueries({ queryKey: ["goal-entries"] });
      toast.success("تم تسجيل الأرباح");
    },
    onError: () => toast.error("فشل تسجيل الأرباح"),
  });

  const stats = useMemo(() => {
    if (!goal) return null;
    
    // Use trade-linked balance if available
    const effectiveBalance = tradeStats ? tradeStats.realBalance : goal.current_balance;
    
    const totalNeeded = goal.target_goal - goal.initial_capital;
    const achieved = effectiveBalance - goal.initial_capital;
    const progress = totalNeeded > 0 ? Math.max(0, Math.min(100, (achieved / totalNeeded) * 100)) : 0;

    const startDate = new Date(goal.started_at);
    const now = new Date();
    const daysPassed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000));

    let daysRemaining = 0;
    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 86400000));
    }

    const remaining = Math.max(0, totalNeeded - achieved);
    const dailyRequired = daysRemaining > 0 ? remaining / daysRemaining : remaining;

    // Losing streak from trades
    const recentEntries = entries.slice(-5);
    const losingStreak = recentEntries.filter(e => e.amount < 0).length >= 3;

    // Missed days
    const today = new Date().toISOString().split("T")[0];
    const todayLogged = entries.some(e => e.entry_date === today);
    const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
    let missedDays = 0;
    if (lastEntry) {
      const lastDate = new Date(lastEntry.entry_date);
      const diffMs = now.getTime() - lastDate.getTime();
      missedDays = Math.max(0, Math.floor(diffMs / 86400000) - 1);
    } else {
      missedDays = Math.max(0, daysPassed - 1);
    }

    // Growth path
    const avgDailyProfit = daysPassed > 0 ? achieved / daysPassed : 0;
    const projectionDays = daysRemaining > 0 ? daysRemaining : 90;
    const growthPath = Array.from({ length: Math.min(projectionDays, 90) }, (_, i) => ({
      day: i + 1,
      projected: goal.initial_capital + avgDailyProfit * (daysPassed + i + 1),
      target: goal.initial_capital + (totalNeeded / projectionDays) * (i + 1),
    }));

    return {
      progress,
      achieved: Math.round(achieved * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      effectiveBalance: Math.round(effectiveBalance * 100) / 100,
      daysPassed,
      daysRemaining,
      dailyRequired,
      losingStreak,
      todayLogged,
      missedDays,
      growthPath,
      level: getLevelForProgress(progress),
      title: EXPERT_TITLES[getLevelForProgress(progress) - 1],
    };
  }, [goal, entries, tradeStats]);

  return {
    goal,
    entries,
    stats,
    tradeStats,
    loading: goalLoading || entriesLoading,
    createGoal,
    addEntry,
    EXPERT_TITLES,
  };
}
