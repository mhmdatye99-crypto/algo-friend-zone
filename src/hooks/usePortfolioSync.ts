import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useLivePnl } from "@/hooks/useLivePnl";

/**
 * Unified portfolio sync hook:
 * Combines realized (closed) + unrealized (open live) PnL
 * into a single totalEquity and goalProgress.
 */
export function usePortfolioSync() {
  const { user } = useAuth();
  const { goal } = useGoalPlanner();
  const { calculateLivePnl, priceMap } = useLivePnl();

  const { data: closedTrades = [] } = useQuery({
    queryKey: ["portfolio-closed-pnl", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("pnl")
        .eq("user_id", user!.id)
        .eq("status", "closed")
        .not("pnl", "is", null);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: openTrades = [] } = useQuery({
    queryKey: ["portfolio-open-trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("id, pair, direction, entry_price, position_size, stop_loss, take_profit, status")
        .eq("user_id", user!.id)
        .eq("status", "open");
      return data || [];
    },
    enabled: !!user,
  });

  const realizedPnl = useMemo(
    () => closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0),
    [closedTrades]
  );

  const unrealizedPnl = useMemo(() => {
    return openTrades.reduce((sum, trade) => {
      const livePnl = calculateLivePnl(
        trade.pair,
        trade.direction,
        trade.entry_price,
        trade.position_size
      );
      return sum + (livePnl ?? 0);
    }, 0);
  }, [openTrades, priceMap, calculateLivePnl]);

  const initialCapital = goal?.initial_capital ?? 0;
  const totalEquity = initialCapital + realizedPnl + unrealizedPnl;
  const targetGoal = goal?.target_goal ?? 0;
  const totalNeeded = targetGoal - initialCapital;
  const goalProgress =
    totalNeeded > 0
      ? Math.max(0, Math.min(100, ((totalEquity - initialCapital) / totalNeeded) * 100))
      : 0;

  return {
    totalEquity,
    realizedPnl,
    unrealizedPnl,
    goalProgress,
    initialCapital,
    targetGoal,
    openTradesCount: openTrades.length,
    openTrades,
  };
}
