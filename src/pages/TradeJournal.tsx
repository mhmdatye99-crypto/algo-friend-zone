import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, TrendingUp, TrendingDown, X, BarChart3, Clock, DollarSign,
  Target, AlertTriangle, ChevronDown, Trash2, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useLocation } from "react-router-dom";

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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const TradeJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { goal, addEntry } = useGoalPlanner();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
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

  // Auto-prefill from signal "Execute & Log"
  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill) {
      // Normalize pair name to match available pairs or add it
      const matchedPair = pairs.find(p => prefill.pair.includes(p.split("/")[0])) || prefill.pair;
      setPair(matchedPair);
      setDirection(prefill.direction || "buy");
      setEntryPrice(prefill.entry?.replace(/,/g, "") || "");
      setTakeProfit(prefill.tp?.replace(/,/g, "") || "");
      setStopLoss(prefill.sl?.replace(/,/g, "") || "");
      setEntryReason(prefill.reason || "");
      setStrategy(prefill.strategy || "");
      setShowForm(true);
      // Clear navigation state to prevent re-prefill
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false });
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
        user_id: user.id,
        pair,
        direction: dbDirection,
        entry_price: entry,
        exit_price: exit,
        stop_loss: sl,
        take_profit: tp,
        position_size: size,
        pnl,
        status,
        emotion: emotion || null,
        notes: notes || null,
        entry_reason: entryReason || null,
        strategy: strategy || null,
        closed_at: status === "closed" ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
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
      toast.success("تم حذف الصفقة");
    },
  });

  const closeTrade = useMutation({
    mutationFn: async ({ id, exitP }: { id: string; exitP: number }) => {
      const trade = trades.find(t => t.id === id);
      if (!trade) throw new Error("Trade not found");
      const size = trade.position_size || 1;
      const pnl = trade.direction === "long"
        ? (exitP - trade.entry_price) * size
        : (trade.entry_price - exitP) * size;

      const { error } = await supabase.from("trades").update({
        exit_price: exitP,
        pnl,
        status: "closed",
        closed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;

      // Update financial goal with PnL
      if (goal) {
        try {
          await addEntry.mutateAsync({ amount: pnl, note: `إغلاق صفقة ${trade.pair} | ${pnl >= 0 ? "ربح" : "خسارة"}` });
        } catch (e) {
          console.error("Failed to update goal:", e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success("تم إغلاق الصفقة وتحديث المحفظة");
    },
  });

  const resetForm = () => {
    setPair(pairs[0]);
    setDirection("buy");
    setEntryPrice("");
    setExitPrice("");
    setStopLoss("");
    setTakeProfit("");
    setPositionSize("");
    setEmotion("");
    setNotes("");
    setEntryReason("");
    setStrategy("");
  };

  const filtered = useMemo(() => {
    if (filter === "all") return trades;
    return trades.filter(t => t.status === filter);
  }, [trades, filter]);

  // Analytics
  const analytics = useMemo(() => {
    const closed = trades.filter(t => t.status === "closed" && t.pnl !== null);
    const wins = closed.filter(t => (t.pnl ?? 0) > 0);
    const losses = closed.filter(t => (t.pnl ?? 0) < 0);
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0;
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
    const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Emotion analysis
    const emotionStats = emotions.map(e => ({
      ...e,
      count: closed.filter(t => t.emotion === e.emoji).length,
      avgPnl: (() => {
        const em = closed.filter(t => t.emotion === e.emoji);
        return em.length ? em.reduce((s, t) => s + (t.pnl ?? 0), 0) / em.length : 0;
      })(),
    }));

    // Pair performance
    const pairMap = new Map<string, { wins: number; total: number; pnl: number }>();
    closed.forEach(t => {
      const cur = pairMap.get(t.pair) || { wins: 0, total: 0, pnl: 0 };
      cur.total++;
      cur.pnl += t.pnl ?? 0;
      if ((t.pnl ?? 0) > 0) cur.wins++;
      pairMap.set(t.pair, cur);
    });
    const pairStats = Array.from(pairMap.entries())
      .map(([pair, s]) => ({ pair, ...s, winRate: (s.wins / s.total) * 100 }))
      .sort((a, b) => b.pnl - a.pnl);

    return { closed: closed.length, wins: wins.length, losses: losses.length, totalPnl, avgWin, avgLoss, winRate, rrRatio, emotionStats, pairStats };
  }, [trades]);

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-4 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">سجل الصفقات</h1>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Trade Journal & Analytics</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-primary text-primary-foreground text-[11px] font-mono font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> تسجيل صفقة
        </button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
        {[
          { label: "الإجمالي", value: trades.length, icon: BarChart3, color: "text-accent" },
          { label: "مفتوحة", value: trades.filter(t => t.status === "open").length, icon: Clock, color: "text-warning" },
          { label: "ربح", value: analytics.wins, icon: TrendingUp, color: "text-success" },
          { label: "خسارة", value: analytics.losses, icon: TrendingDown, color: "text-destructive" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-[10px] p-2.5 text-center">
            <s.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", s.color)} />
            <p className="text-sm font-mono font-bold">{s.value}</p>
            <p className="text-[9px] font-mono text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2">
        {(["trades", "analytics"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-[10px] text-[11px] font-mono font-bold transition-all",
              tab === t ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/40 text-muted-foreground border border-border/10"
            )}
          >
            {t === "trades" ? "📋 الصفقات" : "📊 التحليلات"}
          </button>
        ))}
      </motion.div>

      {tab === "trades" && (
        <>
          {/* Filter */}
          <motion.div variants={fadeUp} className="flex gap-1.5">
            {(["all", "open", "closed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all",
                  filter === f ? "bg-accent/15 text-accent border border-accent/30" : "bg-secondary/30 text-muted-foreground"
                )}
              >
                {f === "all" ? "الكل" : f === "open" ? "مفتوحة" : "مغلقة"}
              </button>
            ))}
          </motion.div>

          {/* Trades List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div variants={fadeUp} className="glass rounded-[14px] p-8 text-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-mono">لا توجد صفقات مسجلة</p>
              <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">ابدأ بتسجيل صفقتك الأولى</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filtered.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onDelete={() => deleteTrade.mutate(trade.id)}
                  onClose={(exitP) => closeTrade.mutate({ id: trade.id, exitP })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "analytics" && (
        <AnalyticsPanel analytics={analytics} />
      )}

      {/* Add Trade Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "hsla(0,0%,0%,0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-[20px] max-h-[85vh] overflow-y-auto bg-card border border-border/30"
            >
              <div className="p-4 pb-32 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">تسجيل صفقة جديدة</h2>
                  <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Direction */}
                <div className="flex gap-2">
                  {(["buy", "sell"] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={cn(
                        "flex-1 py-2.5 rounded-[10px] text-[12px] font-mono font-bold transition-all flex items-center justify-center gap-1.5",
                        direction === d
                          ? d === "buy" ? "bg-success/15 text-success border border-success/30" : "bg-destructive/15 text-destructive border border-destructive/30"
                          : "bg-secondary/40 text-muted-foreground border border-border/10"
                      )}
                    >
                      {d === "buy" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {d === "buy" ? "شراء (Long)" : "بيع (Short)"}
                    </button>
                  ))}
                </div>

                {/* Pair selector */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">الزوج / الأصل</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {pairs.map(p => (
                      <button
                        key={p}
                        onClick={() => setPair(p)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all",
                          pair === p ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/40 text-muted-foreground"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="سعر الدخول *" value={entryPrice} onChange={setEntryPrice} placeholder="0.00" />
                  <FormInput label="سعر الخروج" value={exitPrice} onChange={setExitPrice} placeholder="اختياري" />
                  <FormInput label="وقف الخسارة" value={stopLoss} onChange={setStopLoss} placeholder="SL" />
                  <FormInput label="جني الأرباح" value={takeProfit} onChange={setTakeProfit} placeholder="TP" />
                </div>

                {/* Smart Position Size Calculator */}
                {entryPrice && stopLoss && (
                  <SmartPositionSizer
                    entryPrice={parseFloat(entryPrice)}
                    stopLoss={parseFloat(stopLoss)}
                    takeProfit={takeProfit ? parseFloat(takeProfit) : null}
                    onApply={(size) => setPositionSize(size.toString())}
                  />
                )}

                <FormInput label="حجم الصفقة (لوت / عقود)" value={positionSize} onChange={setPositionSize} placeholder="1.0" />

                {/* Emotion */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">الحالة النفسية</label>
                  <div className="flex gap-2">
                    {emotions.map(e => (
                      <button
                        key={e.emoji}
                        onClick={() => setEmotion(emotion === e.emoji ? "" : e.emoji)}
                        className={cn(
                          "flex-1 py-2 rounded-[10px] text-center transition-all",
                          emotion === e.emoji ? "bg-primary/15 border border-primary/30 scale-105" : "bg-secondary/40 border border-border/10"
                        )}
                      >
                        <span className="text-lg">{e.emoji}</span>
                        <p className="text-[8px] font-mono text-muted-foreground mt-0.5">{e.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entry Reason */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">سبب الدخول</label>
                  <textarea
                    value={entryReason}
                    onChange={e => setEntryReason(e.target.value)}
                    placeholder="لماذا دخلت هذه الصفقة؟ ما الإشارة التي رأيتها؟"
                    className="w-full h-16 rounded-[10px] bg-secondary/40 border border-border/10 px-3 py-2 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/30"
                  />
                </div>

                {/* Strategy */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">الاستراتيجية</label>
                  <input
                    type="text"
                    value={strategy}
                    onChange={e => setStrategy(e.target.value)}
                    placeholder="مثال: كسر مقاومة، ارتداد دعم، MTF..."
                    className="w-full h-10 rounded-[10px] bg-secondary/40 border border-border/10 px-3 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">ملاحظات إضافية</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ملاحظات، دروس مستفادة..."
                    className="w-full h-16 rounded-[10px] bg-secondary/40 border border-border/10 px-3 py-2 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/30"
                  />
                </div>

                <button
                  onClick={() => addTrade.mutate()}
                  disabled={!entryPrice || addTrade.isPending}
                  className="w-full py-3 rounded-[10px] bg-primary text-primary-foreground text-[12px] font-mono font-bold disabled:opacity-50 transition-all"
                >
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

  const riskPresets = [500, 1000, 5000, 10000];

  return (
    <div className="rounded-[12px] bg-accent/5 border border-accent/20 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-accent" />
        <span className="text-[11px] font-mono font-bold text-accent">حاسبة الحجم الذكية</span>
      </div>

      {/* Capital presets */}
      <div>
        <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">رأس المال ($)</label>
        <div className="flex gap-1.5 mb-1.5">
          {riskPresets.map(p => (
            <button
              key={p}
              onClick={() => setCapital(p)}
              className={cn(
                "px-2 py-1 rounded-md text-[9px] font-mono font-medium transition-all",
                capital === p ? "bg-accent/15 text-accent border border-accent/30" : "bg-secondary/40 text-muted-foreground"
              )}
            >
              ${p.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={capital}
          onChange={e => setCapital(parseFloat(e.target.value) || 0)}
          className="w-full h-8 rounded-lg bg-secondary/40 border border-border/10 px-2 text-[11px] font-mono focus:outline-none focus:border-accent/30"
        />
      </div>

      {/* Risk % slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">نسبة المخاطرة</label>
          <span className="text-[11px] font-mono font-bold text-accent">{riskPercent}%</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={riskPercent}
          onChange={e => setRiskPercent(parseFloat(e.target.value))}
          className="w-full accent-accent h-1.5"
        />
        <div className="flex justify-between text-[8px] font-mono text-muted-foreground mt-0.5">
          <span>0.5%</span>
          <span>10%</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-secondary/40 rounded-lg px-2 py-2 text-center">
          <p className="text-[8px] font-mono text-muted-foreground">مبلغ المخاطرة</p>
          <p className="text-[12px] font-mono font-bold text-destructive">${riskAmount.toFixed(2)}</p>
        </div>
        <div className="bg-success/5 rounded-lg px-2 py-2 text-center">
          <p className="text-[8px] font-mono text-muted-foreground">الحجم المقترح</p>
          <p className="text-[12px] font-mono font-bold text-success">{suggestedSize}</p>
        </div>
        {rrRatio !== null && (
          <div className="bg-primary/5 rounded-lg px-2 py-2 text-center">
            <p className="text-[8px] font-mono text-muted-foreground">R:R</p>
            <p className={cn("text-[12px] font-mono font-bold", rrRatio >= 2 ? "text-success" : rrRatio >= 1 ? "text-primary" : "text-destructive")}>
              1:{rrRatio}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => onApply(suggestedSize)}
        disabled={suggestedSize <= 0}
        className="w-full py-2 rounded-lg bg-accent/15 text-accent text-[11px] font-mono font-bold border border-accent/25 hover:bg-accent/25 transition-colors disabled:opacity-50"
      >
        ✓ تطبيق الحجم المقترح ({suggestedSize})
      </button>
    </div>
  );
};

/* ─── Form Input ─── */
const FormInput = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div>
    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 rounded-[10px] bg-secondary/40 border border-border/10 px-3 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
    />
  </div>
);

/* ─── Trade Card ─── */
const TradeCard = ({ trade, onDelete, onClose }: { trade: Trade; onDelete: () => void; onClose: (exitP: number) => void }) => {
  const [showClose, setShowClose] = useState(false);
  const [closePrice, setClosePrice] = useState("");

  return (
    <motion.div
      variants={fadeUp}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-2.5 space-y-1.5"
    >
      {/* Header Row - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center",
            trade.direction === "long" ? "bg-success/12" : "bg-destructive/12"
          )}>
            {trade.direction === "long"
              ? <TrendingUp className="w-3 h-3 text-success" />
              : <TrendingDown className="w-3 h-3 text-destructive" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-mono font-bold">{trade.pair}</p>
              {trade.emotion && <span className="text-xs">{trade.emotion}</span>}
              {trade.strategy && (
                <span className="text-[7px] font-mono text-accent bg-accent/8 px-1 py-0.5 rounded">{trade.strategy}</span>
              )}
            </div>
            <p className="text-[8px] font-mono text-muted-foreground">
              {new Date(trade.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-[8px] font-mono px-1.5 py-0.5 rounded",
            trade.status === "open" ? "bg-warning/12 text-warning" : "bg-muted text-muted-foreground"
          )}>
            {trade.status === "open" ? "مفتوحة" : "مغلقة"}
          </span>
          {trade.pnl !== null && (
            <span className={cn("text-[10px] font-mono font-bold tabular-nums", trade.pnl >= 0 ? "text-success" : "text-destructive")}>
              {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Price Row - Inline */}
      <div className="flex items-center gap-1.5 text-[9px] font-mono">
        <span className="text-muted-foreground">دخول:</span>
        <span className="font-semibold tabular-nums">{trade.entry_price.toFixed(2)}</span>
        {trade.exit_price && (
          <>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold tabular-nums">{trade.exit_price.toFixed(2)}</span>
          </>
        )}
        {trade.stop_loss && <span className="text-destructive tabular-nums">SL {trade.stop_loss.toFixed(2)}</span>}
        {trade.take_profit && <span className="text-success tabular-nums">TP {trade.take_profit.toFixed(2)}</span>}
      </div>

      {trade.entry_reason && (
        <p className="text-[8px] font-mono text-foreground/70 bg-primary/4 rounded px-2 py-1 border border-primary/8 leading-relaxed">{trade.entry_reason}</p>
      )}

      {trade.notes && (
        <p className="text-[8px] font-mono text-muted-foreground/80 leading-relaxed">{trade.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-1.5">
        {trade.status === "open" && (
          <>
            {showClose ? (
              <div className="flex gap-1 flex-1">
                <input
                  type="number"
                  value={closePrice}
                  onChange={e => setClosePrice(e.target.value)}
                  placeholder="سعر الإغلاق"
                  className="flex-1 h-7 rounded-md bg-secondary/50 border border-border/15 px-2 text-[10px] font-mono focus:outline-none focus:border-primary/30"
                />
                <button
                  onClick={() => { if (closePrice) onClose(parseFloat(closePrice)); }}
                  className="px-2.5 h-7 rounded-md bg-primary/12 text-primary text-[9px] font-mono font-bold border border-primary/20"
                >
                  تأكيد
                </button>
                <button onClick={() => setShowClose(false)} className="px-1.5 h-7 rounded-md bg-secondary text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClose(true)}
                className="flex-1 h-7 rounded-md bg-accent/8 text-accent text-[9px] font-mono font-bold border border-accent/15"
              >
                إغلاق الصفقة
              </button>
            )}
          </>
        )}
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-md bg-destructive/8 flex items-center justify-center border border-destructive/15"
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Mini Stat ─── */
const MiniStat = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div className="bg-secondary/30 rounded-lg px-2 py-1.5 text-center">
    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={cn("text-[11px] font-mono font-bold", color)}>{value}</p>
  </div>
);

/* ─── Analytics Panel ─── */
const AnalyticsPanel = ({ analytics }: { analytics: any }) => (
  <div className="space-y-3">
    {/* Performance Overview */}
    <motion.div variants={fadeUp} className="glass rounded-[14px] p-4">
      <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5 text-primary" /> ملخص الأداء
      </p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="إجمالي الربح/الخسارة" value={`${analytics.totalPnl >= 0 ? "+" : ""}$${analytics.totalPnl.toFixed(2)}`} color={analytics.totalPnl >= 0 ? "text-success" : "text-destructive"} />
        <StatCard label="نسبة الفوز" value={`${analytics.winRate.toFixed(1)}%`} color={analytics.winRate >= 50 ? "text-success" : "text-warning"} />
        <StatCard label="متوسط الربح" value={`+$${analytics.avgWin.toFixed(2)}`} color="text-success" />
        <StatCard label="متوسط الخسارة" value={`-$${analytics.avgLoss.toFixed(2)}`} color="text-destructive" />
        <StatCard label="نسبة RR" value={analytics.rrRatio.toFixed(2)} color="text-accent" />
        <StatCard label="صفقات مغلقة" value={analytics.closed.toString()} color="text-foreground" />
      </div>
    </motion.div>

    {/* Win Rate Bar */}
    {analytics.closed > 0 && (
      <motion.div variants={fadeUp} className="glass rounded-[14px] p-4">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">معدل الفوز</p>
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          <div className="h-full bg-success transition-all" style={{ width: `${analytics.winRate}%` }} />
          <div className="h-full bg-destructive transition-all" style={{ width: `${100 - analytics.winRate}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-mono">
          <span className="text-success">{analytics.wins} ربح</span>
          <span className="text-destructive">{analytics.losses} خسارة</span>
        </div>
      </motion.div>
    )}

    {/* Emotion Analysis */}
    {analytics.emotionStats.some((e: any) => e.count > 0) && (
      <motion.div variants={fadeUp} className="glass rounded-[14px] p-4">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🧠 تحليل الحالة النفسية
        </p>
        <div className="space-y-2">
          {analytics.emotionStats.filter((e: any) => e.count > 0).map((e: any) => (
            <div key={e.emoji} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
              <span className="text-lg">{e.emoji}</span>
              <span className="text-[10px] font-mono text-muted-foreground flex-1">{e.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{e.count} صفقة</span>
              <span className={cn("text-[10px] font-mono font-bold", e.avgPnl >= 0 ? "text-success" : "text-destructive")}>
                {e.avgPnl >= 0 ? "+" : ""}${e.avgPnl.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    )}

    {/* Pair Performance */}
    {analytics.pairStats.length > 0 && (
      <motion.div variants={fadeUp} className="glass rounded-[14px] p-4">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-accent" /> أداء الأزواج
        </p>
        <div className="space-y-2">
          {analytics.pairStats.map((p: any) => (
            <div key={p.pair} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
              <span className="text-[11px] font-mono font-bold flex-1">{p.pair}</span>
              <span className="text-[9px] font-mono text-muted-foreground">{p.total} صفقة</span>
              <span className={cn("text-[9px] font-mono", p.winRate >= 50 ? "text-success" : "text-warning")}>{p.winRate.toFixed(0)}% فوز</span>
              <span className={cn("text-[10px] font-mono font-bold", p.pnl >= 0 ? "text-success" : "text-destructive")}>
                {p.pnl >= 0 ? "+" : ""}${p.pnl.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    )}

    {analytics.closed === 0 && (
      <motion.div variants={fadeUp} className="glass rounded-[14px] p-8 text-center">
        <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground font-mono">لا توجد بيانات كافية</p>
        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">أغلق بعض الصفقات لعرض التحليلات</p>
      </motion.div>
    )}
  </div>
);

/* ─── Stat Card ─── */
const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-secondary/30 rounded-[10px] p-2.5 text-center">
    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
    <p className={cn("text-sm font-mono font-bold", color)}>{value}</p>
  </div>
);

export default TradeJournal;
