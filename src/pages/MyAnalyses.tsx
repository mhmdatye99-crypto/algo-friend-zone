import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, TrendingUp, TrendingDown, Minus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const directionColor = (d: string) =>
  d === "صعودي" ? "text-success" : d === "هبوطي" ? "text-destructive" : "text-warning";
const directionBg = (d: string) =>
  d === "صعودي" ? "bg-success/15 text-success border-success/25" : d === "هبوطي" ? "bg-destructive/15 text-destructive border-destructive/25" : "bg-warning/15 text-warning border-warning/25";

const MyAnalyses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["saved-analyses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_analyses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["chart-analyses"] });
    },
  });

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-4 pb-28 max-w-lg mx-auto space-y-4"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : analyses.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16 space-y-3">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-[13px] font-mono text-muted-foreground">لا توجد تحليلات محفوظة</p>
          <p className="text-[11px] font-mono text-muted-foreground/60">
            اذهب لأي أصل واضغط "حفظ التحليل" لتسجيله هنا
          </p>
          <button
            onClick={() => navigate("/markets")}
            className="mt-2 px-4 py-2 rounded-[10px] bg-primary/10 text-primary text-[11px] font-mono font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            تصفح الأسواق
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <motion.p variants={fadeUp} className="text-[10px] font-mono text-muted-foreground px-1">
            {analyses.length} تحليل محفوظ
          </motion.p>
          {analyses.map((a: any) => (
            <motion.div
              key={a.id}
              variants={fadeUp}
              className="glass rounded-[14px] p-4 space-y-2 border border-border/10 cursor-pointer"
              onClick={() =>
                a.source === "chart"
                  ? navigate(`/chart-analysis/result/${a.id}`)
                  : navigate(`/asset/${encodeURIComponent(a.pair)}`)
              }
            >
              {a.source === "chart" && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5">
                  <ImageIcon className="w-3 h-3" /> تحليل صورة
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border", directionBg(a.direction))}>
                  {a.direction === "صعودي" ? <TrendingUp className="w-3 h-3" /> : a.direction === "هبوطي" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {a.direction === "صعودي" ? "BUY" : a.direction === "هبوطي" ? "SELL" : "WAIT"}
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-mono font-bold text-foreground">{a.pair}</p>
                  <p className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ar })}
                    <span className="mx-0.5">·</span>
                    {a.timeframe}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-mono font-bold tabular-nums">${Number(a.price).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">Price</p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold">{a.confidence}%</span>
                    <span className="text-[9px] font-mono text-muted-foreground">Confidence</span>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${a.confidence}%`,
                        background: a.confidence >= 70
                          ? "linear-gradient(90deg, hsl(155 100% 35%), hsl(155 100% 50%))"
                          : a.confidence >= 50
                          ? "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))"
                          : "linear-gradient(90deg, hsl(350 80% 40%), hsl(350 100% 55%))",
                      }}
                    />
                  </div>
                </div>
              </div>

              {a.notes && (
                <p className="text-[10px] font-mono text-muted-foreground bg-secondary/30 rounded-lg px-2 py-1.5 border border-border/10">
                  {a.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                  {a.rsi && <span>RSI: <span className="text-foreground font-bold">{a.rsi}</span></span>}
                  {a.macd && <span>MACD: <span className={cn("font-bold", directionColor(a.macd))}>{a.macd}</span></span>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(a.id); }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyAnalyses;