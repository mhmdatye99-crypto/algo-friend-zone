import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, TrendingUp, TrendingDown, X, BarChart3, Clock, DollarSign,
  Target, AlertTriangle, Trash2, Filter, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useLocation } from "react-router-dom";
import { useLivePnl, useAutoCloseMonitor } from "@/hooks/useLivePnl";

type Trade = {
  id: string;
  pair: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: number | null;
  pnl: number | null;
  status: string;
  emotion: string | null;
  notes: string | null;
  entry_reason: string | null;
  strategy: string | null;
  analysis_id: string | null;
  created_at: string;
  closed_at: string | null;
};

const emotions = [
  { emoji: "😤", label: "خوف" },
  { emoji: "😰", label: "طمع" },
  { emoji: "😐", label: "محايد" },
  { emoji: "😊", label: "واثق" },
  { emoji: "🧘", label: "منضبط" },
];

const pairs = [
  "BTC/USD", "ETH/USD", "XAU/USD", "EUR/USD", "GBP/USD",
  "USD/JPY", "SOL/USD", "BNB/USD", "ADA/USD", "XRP/USD",
];

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

// Post-Trade Grade calculation
const getTradeGrade = (trade: Trade): { grade: string; badge: string } => {
  if (trade.status !== "closed" || trade.pnl === null) return { grade: "—", badge: "nx-badge-neutral" };
  const hadSL = !!trade.stop_loss;
  const hadTP = !!trade.take_profit;
  const hadReason = !!trade.entry_reason;
  const hadStrategy = !!trade.strategy;
  const isWin = trade.pnl > 0;

  let score = 0;
  if (hadSL) score += 25;
  if (hadTP) score += 20;
  if (hadReason) score += 20;
  if (hadStrategy) score += 15;
  if (isWin) score += 20;

  if (score >= 90) return { grade: "A", badge: "nx-badge-gold" };
  if (score >= 70) return { grade: "B", badge: "nx-badge-long" };
  if (score >= 45) return { grade: "C", badge: "nx-badge-warn" };
  return { grade: "D", badge: "nx-badge-short" };
};

const TradeJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { goal, addEntry } = useGoalPlanner();
  const location = useLocation();
  const { calculateLivePnl, getLivePrice, priceMap } = useLivePnl();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "wins" | "losses">("all");
  const [tab, setTab] = useState<"trades" | "analytics">("trades");

  // Form state
  const [pair, setPair] = useState(pairs[0]);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [emotion, setEmotion] = useState("");
  const [notes, setNotes] = useState("");
  const [entryReason, setEntryReason] = useState("");
  const [strategy, setStrategy] = useState("");

  // Auto-prefill from signal
  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill) {
      const matchedPair = pairs.find(p => prefill.pair.includes(p.split("/")[0])) || prefill.pair;
      setPair(matchedPair);
      setDirection(prefill.direction || "buy");
      setEntryPrice(prefill.entry?.replace(/,/g, "") || "");
      setTakeProfit(prefill.tp?.replace(/,/g, "") || "");
      setStopLoss(prefill.sl?.replace(/,/g, "") || "");
      setEntryReason(prefill.reason || "");
      setStrategy(prefill.strategy || "");
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("trades").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user,
  });

  const addTrade = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const entry = parseFloat(entryPrice);
      const exit = exitPrice ? parseFloat(exitPrice) : null;
      const sl = stopLoss ? parseFloat(stopLoss) : null;
      const tp = takeProfit ? parseFloat(takeProfit) : null;
      const size = positionSize ? parseFloat(positionSize) : null;

      let pnl: number | null = null;
      let status = "open";
      if (exit !== null && size) {
        pnl = direction === "buy" ? (exit - entry) * size : (entry - exit) * size;
        status = "closed";
      }

      const dbDirection = direction === "buy" ? "long" : "short";

      const { error } = await supabase.from("trades").insert({
        user_id: user.id, pair, direction: dbDirection, entry_price: entry,
        exit_price: exit, stop_loss: sl, take_profit: tp, position_size: size,
        pnl, status, emotion: emotion || null, notes: notes || null,
        entry_reason: entryReason || null, strategy: strategy || null,
        closed_at: status === "closed" ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dash-equity"] });
      queryClient.invalidateQueries({ queryKey: ["trade-performance"] });
      queryClient.invalidateQueries({ queryKey: ["trades-pnl-total"] });
      resetForm();
      setShowForm(false);
      toast.success("تم تسجيل الصفقة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء التسجيل"),
  });

  const deleteTrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dash-equity"] });
      queryClient.invalidateQueries({ queryKey: ["trade-performance"] });
      queryClient.invalidateQueries({ queryKey: ["trades-pnl-total"] });
      toast.success("تم حذف الصفقة");
    },
  });

  const closeTrade = useMutation({
    mutationFn: async ({ id, exitP }: { id: string; exitP: number }) => {
      const trade = trades.find(t => t.id === id);
      if (!trade) throw new Error("Trade not found");
      const size = trade.position_size || 1;
      const pnl = trade.direction === "long" ? (exitP - trade.entry_price) * size : (trade.entry_price - exitP) * size;

      const { error } = await supabase.from("trades").update({
        exit_price: exitP, pnl, status: "closed", closed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;

      if (goal) {
        try { await addEntry.mutateAsync({ amount: pnl, note: `إغلاق ${trade.pair} | ${pnl >= 0 ? "ربح" : "خسارة"}` }); }
        catch (e) { console.error("Failed to update goal:", e); }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dash-equity"] });
      queryClient.invalidateQueries({ queryKey: ["trade-performance"] });
      queryClient.invalidateQueries({ queryKey: ["trades-pnl-total"] });
      queryClient.invalidateQueries({ queryKey: ["financial-goal"] });
      toast.success("تم إغلاق الصفقة");
    },
  });

  const resetForm = () => {
    setPair(pairs[0]); setDirection("buy"); setEntryPrice(""); setExitPrice("");
    setStopLoss(""); setTakeProfit(""); setPositionSize(""); setEmotion("");
    setNotes(""); setEntryReason(""); setStrategy("");
  };

  // TP/SL Auto-Close Monitor
  const handleAutoClose = useCallback(
    async (tradeId: string, exitPrice: number, result: "tp_hit" | "sl_hit") => {
      const trade = trades.find((t) => t.id === tradeId);
      if (!trade) return;
      const size = trade.position_size || 1;
      const pnl =
        trade.direction === "long"
          ? (exitPrice - trade.entry_price) * size
          : (trade.entry_price - exitPrice) * size;

      const { error } = await supabase
        .from("trades")
        .update({
          exit_price: exitPrice,
          pnl,
          status: "closed",
          closed_at: new Date().toISOString(),
        })
        .eq("id", tradeId);

      if (error) {
        console.error("Auto-close failed:", error);
        return;
      }

      if (goal) {
        try {
          await addEntry.mutateAsync({
            amount: pnl,
            note: `${result === "tp_hit" ? "TP" : "SL"} ${trade.pair} | ${pnl >= 0 ? "ربح" : "خسارة"}`,
          });
        } catch (e) {
          console.error("Failed to update goal:", e);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dash-equity"] });
      queryClient.invalidateQueries({ queryKey: ["trade-performance"] });
      queryClient.invalidateQueries({ queryKey: ["trades-pnl-total"] });
      queryClient.invalidateQueries({ queryKey: ["financial-goal"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-closed-pnl"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-open-trades"] });

      toast.success(
        result === "tp_hit"
          ? `🎯 ${trade.pair} وصل الهدف — تم الإغلاق تلقائياً (+$${pnl.toFixed(2)})`
          : `🛑 ${trade.pair} وصل وقف الخسارة — تم الإغلاق تلقائياً (${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)})`
      );
    },
    [trades, goal, addEntry, queryClient]
  );

  useAutoCloseMonitor(
    trades as any,
    priceMap,
    handleAutoClose
  );

  const filtered = useMemo(() => {
    if (filter === "all") return trades;
    if (filter === "wins") return trades.filter(t => t.status === "closed" && (t.pnl ?? 0) > 0);
    if (filter === "losses") return trades.filter(t => t.status === "closed" && (t.pnl ?? 0) < 0);
    return trades.filter(t => t.status === filter);
  }, [trades, filter]);

  const analytics = useMemo(() => {
    const closed = trades.filter(t => t.status === "closed" && t.pnl !== null);
    const wins = closed.filter(t => (t.pnl ?? 0) > 0);
    const losses = closed.filter(t => (t.pnl ?? 0) < 0);
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0;
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
    const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    const emotionStats = emotions.map(e => ({
      ...e,
      count: closed.filter(t => t.emotion === e.emoji).length,
      avgPnl: (() => { const em = closed.filter(t => t.emotion === e.emoji); return em.length ? em.reduce((s, t) => s + (t.pnl ?? 0), 0) / em.length : 0; })(),
    }));

    const pairMap = new Map<string, { wins: number; total: number; pnl: number }>();
    closed.forEach(t => {
      const cur = pairMap.get(t.pair) || { wins: 0, total: 0, pnl: 0 };
      cur.total++; cur.pnl += t.pnl ?? 0; if ((t.pnl ?? 0) > 0) cur.wins++;
      pairMap.set(t.pair, cur);
    });
    const pairStats = Array.from(pairMap.entries()).map(([pair, s]) => ({ pair, ...s, winRate: (s.wins / s.total) * 100 })).sort((a, b) => b.pnl - a.pnl);

    return { closed: closed.length, wins: wins.length, losses: losses.length, totalPnl, avgWin, avgLoss, winRate, rrRatio, emotionStats, pairStats };
  }, [trades]);

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="nx-page"
    >
      {/* Header */}
      <motion.div variants={fade} className="flex items-center justify-end">
        <button onClick={() => setShowForm(true)}
          className="nx-btn-primary nx-btn-sm">
          <Plus className="w-4 h-4" /> تسجيل صفقة
        </button>
      </motion.div>

      {/* Quick Stats — Bank Statement Header */}
      <motion.div variants={fade} className="grid grid-cols-4 gap-2">
        {[
          { label: "الإجمالي", value: trades.length, color: "text-foreground" },
          { label: "مفتوحة", value: trades.filter(t => t.status === "open").length, color: "text-warning" },
          { label: "ربح", value: analytics.wins, color: "text-success" },
          { label: "خسارة", value: analytics.losses, color: "text-destructive" },
        ].map((s, i) => (
          <div key={i} className="nx-card-flat text-center">
            <p className={cn("nx-num", s.color)}>{s.value}</p>
            <p className="nx-meta">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade} className="flex gap-2">
        {(["trades", "analytics"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 nx-tap py-2.5 rounded-xl text-[14px] font-semibold transition-colors",
              tab === t ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border"
            )}>
            {t === "trades" ? "الصفقات" : "الأداء"}
          </button>
        ))}
      </motion.div>

      {tab === "trades" && (
        <>
          {/* One-Click Filters: All / Open / Closed / Wins / Losses */}
          <motion.div variants={fade} className="flex gap-1.5 flex-wrap">
            {(["all", "open", "closed", "wins", "losses"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                  filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                {f === "all" ? "الكل" : f === "open" ? "مفتوحة" : f === "closed" ? "مغلقة" : f === "wins" ? "✓ ربح" : "✗ خسارة"}
              </button>
            ))}
          </motion.div>

          {/* Trades — Bank Statement Rows */}
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div variants={fade} className="nx-card text-center py-10">
              <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="nx-body text-muted-foreground">لا توجد صفقات</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {/* Statement Header */}
              <div className="flex items-center gap-2 px-3 py-1.5 nx-meta uppercase border-b border-border">
                <span className="w-14">التاريخ</span>
                <span className="flex-1">الأصل</span>
                <span className="w-14 text-center">النتيجة</span>
                <span className="w-10 text-center">R:R</span>
                <span className="w-10 text-center">الرتبة</span>
                <span className="w-16 text-left">P&L</span>
              </div>
              {filtered.map((trade) => {
                const livePnl = trade.status === "open"
                  ? calculateLivePnl(trade.pair, trade.direction, trade.entry_price, trade.position_size)
                  : null;
                const livePrice = trade.status === "open" ? getLivePrice(trade.pair) : null;
                return (
                  <TradeRow key={trade.id} trade={trade}
                    livePnl={livePnl} livePrice={livePrice}
                    onDelete={() => deleteTrade.mutate(trade.id)}
                    onClose={(exitP) => closeTrade.mutate({ id: trade.id, exitP })} />
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "analytics" && <AnalyticsPanel analytics={analytics} />}

      {/* Add Trade Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "hsla(0,0%,0%,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-xl max-h-[85vh] overflow-y-auto bg-card border-t border-border/20"
            >
              <div className="p-4 pb-32 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold">تسجيل صفقة جديدة</h2>
                  <button onClick={() => setShowForm(false)} className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Direction */}
                <div className="flex gap-1.5">
                  {(["buy", "sell"] as const).map(d => (
                    <button key={d} onClick={() => setDirection(d)}
                      className={cn("flex-1 py-2 rounded-md text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors",
                        direction === d
                          ? d === "buy" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-muted/30 text-muted-foreground border border-border/10"
                      )}>
                      {d === "buy" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {d === "buy" ? "شراء" : "بيع"}
                    </button>
                  ))}
                </div>

                {/* Pair */}
                <div>
                  <label className="nx-meta mb-1 block">الزوج</label>
                  <div className="flex gap-1 flex-wrap">
                    {pairs.map(p => (
                      <button key={p} onClick={() => setPair(p)}
                        className={cn("px-2 py-1 rounded-md text-[9px] font-mono transition-colors",
                          pair === p ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground/60"
                        )}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-2">
                  <FormInput label="سعر الدخول *" value={entryPrice} onChange={setEntryPrice} placeholder="0.00" />
                  <FormInput label="سعر الخروج" value={exitPrice} onChange={setExitPrice} placeholder="اختياري" />
                  <FormInput label="وقف الخسارة" value={stopLoss} onChange={setStopLoss} placeholder="SL" />
                  <FormInput label="جني الأرباح" value={takeProfit} onChange={setTakeProfit} placeholder="TP" />
                </div>

                {entryPrice && stopLoss && (
                  <SmartPositionSizer
                    entryPrice={parseFloat(entryPrice)} stopLoss={parseFloat(stopLoss)}
                    takeProfit={takeProfit ? parseFloat(takeProfit) : null}
                    onApply={(size) => setPositionSize(size.toString())}
                  />
                )}

                <FormInput label="حجم الصفقة" value={positionSize} onChange={setPositionSize} placeholder="1.0" />

                {/* Emotion */}
                <div>
                  <label className="nx-meta mb-1 block">الحالة النفسية</label>
                  <div className="flex gap-1.5">
                    {emotions.map(e => (
                      <button key={e.emoji} onClick={() => setEmotion(emotion === e.emoji ? "" : e.emoji)}
                        className={cn("flex-1 py-1.5 rounded-md text-center transition-colors",
                          emotion === e.emoji ? "bg-primary/10 border border-primary/20" : "bg-muted/30 border border-border/5"
                        )}>
                        <span className="text-base">{e.emoji}</span>
                        <p className="text-[7px] font-mono text-muted-foreground/50 mt-0.5">{e.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="nx-meta mb-1 block">سبب الدخول</label>
                  <textarea value={entryReason} onChange={e => setEntryReason(e.target.value)}
                    placeholder="لماذا دخلت هذه الصفقة؟"
                    className="w-full h-16 rounded-xl bg-secondary border border-border px-3 py-2 text-[14px] placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/40" />
                </div>

                <div>
                  <label className="nx-meta mb-1 block">الاستراتيجية</label>
                  <input type="text" value={strategy} onChange={e => setStrategy(e.target.value)}
                    placeholder="كسر مقاومة، ارتداد دعم..."
                    className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40" />
                </div>

                <div>
                  <label className="nx-meta mb-1 block">ملاحظات</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="ملاحظات إضافية..."
                    className="w-full h-16 rounded-xl bg-secondary border border-border px-3 py-2 text-[14px] placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/40" />
                </div>

                <button onClick={() => addTrade.mutate()} disabled={!entryPrice || addTrade.isPending}
                  className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-[11px] font-mono font-semibold disabled:opacity-40 hover-lift">
                  {addTrade.isPending ? "جاري التسجيل..." : "✓ تسجيل الصفقة"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Smart Position Sizer ─── */
const SmartPositionSizer = ({ entryPrice, stopLoss, takeProfit, onApply }: {
  entryPrice: number; stopLoss: number; takeProfit: number | null; onApply: (size: number) => void;
}) => {
  const [capital, setCapital] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(2);

  const riskPerUnit = Math.abs(entryPrice - stopLoss);
  const riskAmount = capital * (riskPercent / 100);
  const suggestedSize = riskPerUnit > 0 ? parseFloat((riskAmount / riskPerUnit).toFixed(4)) : 0;
  const rrRatio = takeProfit && riskPerUnit > 0 ? parseFloat((Math.abs(takeProfit - entryPrice) / riskPerUnit).toFixed(2)) : null;

  return (
    <div className="rounded-md bg-primary/3 border border-primary/10 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3 text-primary/60" />
        <span className="text-[10px] font-mono font-semibold text-primary/70">حاسبة الحجم</span>
      </div>
      <div className="flex gap-1">
        {[500, 1000, 5000, 10000].map(p => (
          <button key={p} onClick={() => setCapital(p)}
            className={cn("px-2 py-1 rounded-sm text-[8px] font-mono transition-colors",
              capital === p ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground/50"
            )}>
            ${p.toLocaleString()}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono text-muted-foreground/50">المخاطرة</span>
        <span className="text-[10px] font-mono font-semibold text-primary/70">{riskPercent}%</span>
      </div>
      <input type="range" min={0.5} max={10} step={0.5} value={riskPercent}
        onChange={e => setRiskPercent(parseFloat(e.target.value))}
        className="w-full h-1 accent-primary" />
      <div className="grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded-sm px-2 py-1.5 text-center">
          <p className="text-[7px] font-mono text-muted-foreground/40">مخاطرة</p>
          <p className="text-[10px] font-mono font-semibold text-destructive">${riskAmount.toFixed(0)}</p>
        </div>
        <div className="bg-muted/30 rounded-sm px-2 py-1.5 text-center">
          <p className="text-[7px] font-mono text-muted-foreground/40">الحجم</p>
          <p className="text-[10px] font-mono font-semibold text-success">{suggestedSize}</p>
        </div>
        {rrRatio !== null && (
          <div className="bg-muted/30 rounded-sm px-2 py-1.5 text-center">
            <p className="text-[7px] font-mono text-muted-foreground/40">R:R</p>
            <p className={cn("text-[10px] font-mono font-semibold", rrRatio >= 2 ? "text-success" : "text-primary")}>1:{rrRatio}</p>
          </div>
        )}
      </div>
      <button onClick={() => onApply(suggestedSize)} disabled={suggestedSize <= 0}
        className="w-full py-1.5 rounded-sm bg-primary/8 text-primary text-[9px] font-mono font-semibold border border-primary/15 hover:bg-primary/15 transition-colors disabled:opacity-40">
        تطبيق الحجم ({suggestedSize})
      </button>
    </div>
  );
};

/* ─── Form Input ─── */
const FormInput = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div>
    <label className="nx-meta mb-1 block">{label}</label>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-[15px] placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40" />
  </div>
);

/* ─── Trade Row — Bank Statement Style ─── */
const TradeRow = ({ trade, livePnl, livePrice, onDelete, onClose }: { trade: Trade; livePnl?: number | null; livePrice?: number | null; onDelete: () => void; onClose: (exitP: number) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [closePrice, setClosePrice] = useState("");
  const { grade, badge: gradeBadge } = getTradeGrade(trade);

  // Calculate achieved R:R
  const achievedRR = (() => {
    if (trade.status !== "closed" || !trade.exit_price || !trade.stop_loss) return null;
    const riskDist = Math.abs(trade.entry_price - trade.stop_loss);
    if (riskDist === 0) return null;
    const rewardDist = trade.direction === "long"
      ? trade.exit_price - trade.entry_price
      : trade.entry_price - trade.exit_price;
    return parseFloat((rewardDist / riskDist).toFixed(1));
  })();

  // Use live PnL for open trades, stored PnL for closed
  const displayPnl = trade.status === "open" && livePnl !== null && livePnl !== undefined ? livePnl : trade.pnl;
  const isWin = displayPnl !== null && displayPnl > 0;
  const isLoss = displayPnl !== null && displayPnl < 0;

  // Discipline score: compare exit vs TP
  const disciplineNote = (() => {
    if (trade.status !== "closed" || !trade.exit_price || !trade.take_profit) return null;
    const tpDist = Math.abs(trade.take_profit - trade.entry_price);
    const exitDist = trade.direction === "long"
      ? trade.exit_price - trade.entry_price
      : trade.entry_price - trade.exit_price;
    const ratio = tpDist > 0 ? (exitDist / tpDist) * 100 : 0;
    if (ratio >= 90) return { text: "ممتاز", color: "text-success" };
    if (ratio >= 60) return { text: "جيد", color: "text-primary" };
    if (ratio >= 30) return { text: "مقبول", color: "text-warning" };
    return { text: "ضعيف", color: "text-destructive" };
  })();

  return (
    <div className="nx-card overflow-hidden !p-0">
      {/* Main Row — Table style */}
      <button onClick={() => setExpanded(!expanded)} className="nx-tap w-full flex items-center gap-2 px-3 py-3 text-right hover:bg-secondary/40 transition-colors">
        <span className="nx-meta nx-ltr tabular-nums w-14 shrink-0">
          {new Date(trade.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
        </span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className={cn("w-1 h-5 rounded-full shrink-0",
            trade.direction === "long" ? "bg-success" : "bg-destructive"
          )} />
          <span className="text-[14px] font-semibold truncate">{trade.pair}</span>
          {trade.emotion && <span className="text-sm">{trade.emotion}</span>}
        </div>
        {/* Result */}
        <span className={cn("text-[12px] font-semibold w-14 text-center px-1.5 py-1 rounded-lg",
          trade.status === "open" ? "bg-warning/12 text-warning" : isWin ? "bg-success/12 text-success" : isLoss ? "bg-destructive/12 text-destructive" : "text-muted-foreground"
        )}>
          {trade.status === "open" ? "مفتوح" : isWin ? "WIN" : isLoss ? "LOSS" : "—"}
        </span>
        {/* R:R achieved */}
        <span className={cn("font-mono text-[13px] font-semibold w-10 text-center tabular-nums",
          achievedRR === null ? "text-muted-foreground/50" : achievedRR >= 2 ? "text-success" : achievedRR >= 1 ? "text-primary" : "text-destructive"
        )}>
          {achievedRR !== null ? `${achievedRR > 0 ? "+" : ""}${achievedRR}` : "—"}
        </span>
        {/* Grade */}
        <span className={cn(gradeBadge, "w-9 justify-center")}>{grade}</span>
        {/* P&L */}
        <span className={cn("font-mono text-[14px] font-bold tabular-nums w-16 text-left transition-colors nx-ltr",
          displayPnl === null ? "text-muted-foreground/50" : displayPnl >= 0 ? "text-success" : "text-destructive"
        )}>
          {displayPnl !== null ? `${displayPnl >= 0 ? "+" : ""}$${displayPnl.toFixed(2)}` : "—"}
        </span>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border">
              <div className="flex items-center gap-3 nx-meta nx-ltr flex-wrap">
                <span>دخول: <span className="text-foreground font-semibold">{trade.entry_price.toFixed(2)}</span></span>
                {trade.status === "open" && livePrice != null && (
                  <span>الآن: <span className={cn("font-semibold animate-pulse", livePrice > trade.entry_price ? "text-success" : livePrice < trade.entry_price ? "text-destructive" : "text-foreground")}>{livePrice.toFixed(2)}</span></span>
                )}
                {trade.exit_price && <span>→ <span className="text-foreground font-semibold">{trade.exit_price.toFixed(2)}</span></span>}
                {trade.stop_loss && <span className="text-destructive">SL {trade.stop_loss.toFixed(2)}</span>}
                {trade.take_profit && <span className="text-success">TP {trade.take_profit.toFixed(2)}</span>}
              </div>
              {trade.entry_reason && (
                <p className="nx-body text-foreground/80 bg-secondary/60 rounded-lg px-3 py-2">{trade.entry_reason}</p>
              )}
              {trade.strategy && (
                <p className="text-[13px] font-medium text-primary bg-primary/8 rounded-lg px-3 py-1.5">{trade.strategy}</p>
              )}
              {trade.notes && (
                <p className="nx-meta">{trade.notes}</p>
              )}
              {disciplineNote && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/15">
                  <span className="nx-meta">انضباط الخروج:</span>
                  <span className={cn("text-[13px] font-semibold", disciplineNote.color)}>{disciplineNote.text}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {trade.status === "open" && (
                  <div className="flex gap-2 flex-1">
                    <input type="number" value={closePrice} onChange={e => setClosePrice(e.target.value)}
                      placeholder="سعر الإغلاق"
                      className="flex-1 h-10 rounded-xl bg-secondary border border-border px-3 text-[14px] focus:outline-none focus:border-primary/40" />
                    <button onClick={() => { if (closePrice) onClose(parseFloat(closePrice)); }}
                      className="nx-btn-primary nx-btn-sm">إغلاق</button>
                  </div>
                )}
                <button onClick={onDelete} className="nx-tap w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Analytics Panel ─── */
const AnalyticsPanel = ({ analytics }: { analytics: any }) => (
  <div className="space-y-3">
    <motion.div variants={fade} className="nx-card">
      <p className="nx-label mb-3 flex items-center gap-1.5">
        <BarChart3 className="w-4 h-4 text-primary" /> ملخص الأداء
      </p>
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="P&L" value={`${analytics.totalPnl >= 0 ? "+" : ""}$${analytics.totalPnl.toFixed(0)}`} color={analytics.totalPnl >= 0 ? "text-success" : "text-destructive"} />
        <StatCell label="نسبة الفوز" value={`${analytics.winRate.toFixed(0)}%`} color={analytics.winRate >= 50 ? "text-success" : "text-warning"} />
        <StatCell label="R:R" value={analytics.rrRatio.toFixed(1)} color="text-primary" />
      </div>
    </motion.div>

    {analytics.closed > 0 && (
      <motion.div variants={fade} className="nx-card">
        <p className="nx-label mb-2">معدل الفوز</p>
        <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
          <div className="h-full bg-success transition-all" style={{ width: `${analytics.winRate}%` }} />
          <div className="h-full bg-destructive/50 transition-all" style={{ width: `${100 - analytics.winRate}%` }} />
        </div>
        <div className="flex justify-between mt-2 nx-meta">
          <span>{analytics.wins} ربح</span>
          <span>{analytics.losses} خسارة</span>
        </div>
      </motion.div>
    )}

    {analytics.emotionStats.some((e: any) => e.count > 0) && (
      <motion.div variants={fade} className="nx-card">
        <p className="nx-label mb-2">تحليل الحالة النفسية</p>
        <div className="space-y-1.5">
          {analytics.emotionStats.filter((e: any) => e.count > 0).map((e: any) => (
            <div key={e.emoji} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60">
              <span className="text-base">{e.emoji}</span>
              <span className="text-[14px] text-muted-foreground flex-1">{e.label}</span>
              <span className="nx-meta">{e.count}x</span>
              <span className={cn("text-[13px] font-semibold nx-ltr", e.avgPnl >= 0 ? "text-success" : "text-destructive")}>
                {e.avgPnl >= 0 ? "+" : ""}${e.avgPnl.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    )}

    {analytics.pairStats.length > 0 && (
      <motion.div variants={fade} className="nx-card">
        <p className="nx-label mb-2 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-primary" /> أداء الأزواج
        </p>
        <div className="space-y-1.5">
          {analytics.pairStats.map((p: any) => (
            <div key={p.pair} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60">
              <span className="text-[14px] font-semibold flex-1">{p.pair}</span>
              <span className="nx-meta">{p.total}x</span>
              <span className={cn("text-[13px]", p.winRate >= 50 ? "text-success" : "text-warning")}>{p.winRate.toFixed(0)}%</span>
              <span className={cn("text-[13px] font-semibold nx-ltr", p.pnl >= 0 ? "text-success" : "text-destructive")}>
                {p.pnl >= 0 ? "+" : ""}${p.pnl.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    )}

    {analytics.closed === 0 && (
      <motion.div variants={fade} className="nx-card text-center py-10">
        <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="nx-body text-muted-foreground">لا توجد بيانات كافية</p>
      </motion.div>
    )}
  </div>
);

const StatCell = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-secondary/60 rounded-xl px-2 py-2 text-center">
    <p className="nx-meta">{label}</p>
    <p className={cn("text-[15px] font-bold nx-ltr", color)}>{value}</p>
  </div>
);

export default TradeJournal;
