import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TradePerformance {
  totalTrades: number;
  closedTrades: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  bestPair: string;
  worstPair: string;
  pnlCurve: { date: string; pnl: number }[];
  winLoss: { wins: number; losses: number; breakeven: number };
  weeklyPnl: { day: string; pnl: number }[];
  pairBreakdown: { pair: string; pnl: number; count: number }[];
}

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function useTradePerformance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trade-performance", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TradePerformance> => {
      const { data: trades, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const all = trades || [];
      const closed = all.filter((t) => t.status === "closed" && t.pnl !== null);

      const wins = closed.filter((t) => (t.pnl ?? 0) > 0);
      const losses = closed.filter((t) => (t.pnl ?? 0) < 0);
      const breakeven = closed.filter((t) => (t.pnl ?? 0) === 0);

      const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
      const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0;
      const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

      // PnL curve (cumulative)
      let cumPnl = 0;
      let peak = 0;
      let maxDd = 0;
      const pnlCurve = closed.map((t) => {
        cumPnl += t.pnl ?? 0;
        if (cumPnl > peak) peak = cumPnl;
        const dd = peak - cumPnl;
        if (dd > maxDd) maxDd = dd;
        const d = t.closed_at || t.created_at;
        return { date: new Date(d).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }), pnl: cumPnl };
      });

      // Weekly PnL
      const weekMap = new Array(7).fill(0);
      closed.forEach((t) => {
        const day = new Date(t.closed_at || t.created_at).getDay();
        weekMap[day] += t.pnl ?? 0;
      });
      const weeklyPnl = weekMap.map((pnl, i) => ({ day: DAYS_AR[i], pnl: Math.round(pnl * 100) / 100 }));

      // Pair breakdown
      const pairMap: Record<string, { pnl: number; count: number }> = {};
      closed.forEach((t) => {
        if (!pairMap[t.pair]) pairMap[t.pair] = { pnl: 0, count: 0 };
        pairMap[t.pair].pnl += t.pnl ?? 0;
        pairMap[t.pair].count++;
      });
      const pairBreakdown = Object.entries(pairMap)
        .map(([pair, v]) => ({ pair, pnl: Math.round(v.pnl * 100) / 100, count: v.count }))
        .sort((a, b) => b.pnl - a.pnl);

      const bestPair = pairBreakdown[0]?.pair || "—";
      const worstPair = pairBreakdown[pairBreakdown.length - 1]?.pair || "—";

      return {
        totalTrades: all.length,
        closedTrades: closed.length,
        winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
        totalPnl: Math.round(totalPnl * 100) / 100,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        maxDrawdown: Math.round(maxDd * 100) / 100,
        bestPair,
        worstPair,
        pnlCurve,
        winLoss: { wins: wins.length, losses: losses.length, breakeven: breakeven.length },
        weeklyPnl,
        pairBreakdown,
      };
    },
  });
}
