import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getBias, type AIAnalysisResult } from "@/components/analysis/types";

export interface SavedChartAnalysis {
  id: string;
  pair: string;
  price: number;
  direction: string;
  confidence: number;
  timeframe: string;
  notes: string | null;
  stop_loss: string | null;
  take_profit1: string | null;
  take_profit2: string | null;
  analysis: AIAnalysisResult | null;
  created_at: string;
}

const parsePrice = (v?: string) => Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/** Persist a chart image analysis to history + signals. Returns the new row id. */
export const saveChartAnalysis = async (userId: string, a: AIAnalysisResult) => {
  const bias = getBias(a);
  const { data, error } = await supabase
    .from("saved_analyses")
    .insert({
      user_id: userId,
      source: "chart",
      pair: a.pair || "غير محدد",
      price: parsePrice(a.entry),
      direction: bias === "long" ? "صعودي" : bias === "short" ? "هبوطي" : "جانبي",
      confidence: a.directionConfidence ?? 0,
      timeframe: a.timeframe || "—",
      notes: a.summary || a.strategy || null,
      stop_loss: a.stopLoss || null,
      take_profit1: a.takeProfit1 || null,
      take_profit2: a.takeProfit2 || null,
      analysis: a as never,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
};

export const useChartAnalyses = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["chart-analyses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_analyses")
        .select("*")
        .eq("user_id", user.id)
        .eq("source", "chart")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SavedChartAnalysis[];
    },
    enabled: !!user,
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["chart-analyses"] });
    qc.invalidateQueries({ queryKey: ["saved-analyses"] });
  };
  return { ...query, invalidate };
};

export const useChartAnalysis = (id?: string) =>
  useQuery({
    queryKey: ["chart-analysis", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("saved_analyses").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as unknown as SavedChartAnalysis | null) ?? null;
    },
    enabled: !!id,
  });
