import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserTier = "guest" | "alpha" | "founder";

interface CreditTransaction {
  id: string;
  amount: number;
  action: string;
  description: string | null;
  created_at: string;
}

interface CreditsState {
  credits: number;
  tier: UserTier;
  loading: boolean;
  transactions: CreditTransaction[];
}

export const CREDIT_COSTS = {
  chart_analysis: 5,
  chat_session: 2,
  reveal_signal: 1,
} as const;

export const CREDIT_PACKAGES = [
  { id: "starter", name: "Starter", nameAr: "المبتدئ", credits: 50, price: 4.99 },
  { id: "pro", name: "Pro", nameAr: "المحترف", credits: 200, price: 14.99 },
  { id: "whale", name: "Whale", nameAr: "الحوت", credits: -1, price: 49.99, unlimited: true },
] as const;

export const useCredits = () => {
  const { user } = useAuth();
  const [state, setState] = useState<CreditsState>({
    credits: 0,
    tier: "guest",
    loading: true,
    transactions: [],
  });

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setState({ credits: 0, tier: "guest", loading: false, transactions: [] });
      return;
    }

    const [profileRes, tierRes, txRes] = await Promise.all([
      supabase.from("profiles").select("credits, subscription_tier").eq("user_id", user.id).maybeSingle(),
      supabase.rpc("get_user_tier", { _user_id: user.id }),
      supabase.from("credit_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);

    const credits = (profileRes.data as any)?.credits ?? 20;
    const tier = ((tierRes.data as string) || (profileRes.data as any)?.subscription_tier || "guest") as UserTier;

    setState({
      credits,
      tier,
      loading: false,
      transactions: (txRes.data as any[]) || [],
    });
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const spendCredits = useCallback(async (
    amount: number,
    action: string,
    description?: string
  ): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase.rpc("spend_credits", {
      _user_id: user.id,
      _amount: amount,
      _action: action,
      _description: description || null,
    });

    if (error) {
      console.error("spend_credits error:", error);
      return false;
    }

    const success = data as boolean;
    if (success) {
      await fetchCredits(); // refresh state
    }
    return success;
  }, [user, fetchCredits]);

  const canAfford = useCallback((cost: number): boolean => {
    if (state.tier === "founder") return true;
    return state.credits >= cost;
  }, [state.credits, state.tier]);

  const isFounder = state.tier === "founder";
  const isAlpha = state.tier === "alpha" || isFounder;
  const isGuest = state.tier === "guest";

  return {
    ...state,
    spendCredits,
    canAfford,
    isFounder,
    isAlpha,
    isGuest,
    refresh: fetchCredits,
  };
};
