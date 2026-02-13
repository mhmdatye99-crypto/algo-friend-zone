import { useState, useMemo } from "react";
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

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        pair,
        direction,
        entry_price: entry,
        exit_price: exit,
        stop_loss: sl,
        take_profit: tp,
        position_size: size,
        pnl,
        status,
        emotion: emotion || null,
        notes: notes || null,
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
      const pnl = trade.direction === "buy"
        ? (exitP - trade.entry_price) * size
        : (trade.entry_price - exitP) * size;

      const { error } = await supabase.from("trades").update({
        exit_price: exitP,
        pnl,
        status: "closed",
        closed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success("تم إغلاق الصفقة");
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
              className="w-full max-w-lg rounded-t-[20px] max-h-[85vh] overflow-y-auto"
              style={{ background: "hsl(240, 15%, 3.5%)", border: "1px solid hsla(43, 100%, 50%, 0.1)" }}
            >
              <div className="p-4 space-y-4">
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

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">ملاحظات</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="سبب الدخول، الاستراتيجية، الدروس..."
                    className="w-full h-20 rounded-[10px] bg-secondary/40 border border-border/10 px-3 py-2 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/30"
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
    <motion.div variants={fadeUp} className="glass rounded-[12px] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            trade.direction === "buy" ? "bg-success/15" : "bg-destructive/15"
          )}>
            {trade.direction === "buy"
              ? <TrendingUp className="w-3.5 h-3.5 text-success" />
              : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
          </div>
          <div>
            <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
            <p className="text-[9px] font-mono text-muted-foreground">
              {new Date(trade.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[9px] font-mono px-2 py-0.5 rounded-md",
            trade.status === "open" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
          )}>
            {trade.status === "open" ? "مفتوحة" : "مغلقة"}
          </span>
          {trade.emotion && <span className="text-sm">{trade.emotion}</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="الدخول" value={trade.entry_price.toFixed(2)} />
        <MiniStat label="الخروج" value={trade.exit_price?.toFixed(2) ?? "—"} />
        <MiniStat
          label="الربح/الخسارة"
          value={trade.pnl !== null ? `${trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}` : "—"}
          color={trade.pnl !== null ? (trade.pnl >= 0 ? "text-success" : "text-destructive") : undefined}
        />
      </div>

      {(trade.stop_loss || trade.take_profit) && (
        <div className="grid grid-cols-2 gap-2">
          {trade.stop_loss && <MiniStat label="SL" value={trade.stop_loss.toFixed(2)} color="text-destructive" />}
          {trade.take_profit && <MiniStat label="TP" value={trade.take_profit.toFixed(2)} color="text-success" />}
        </div>
      )}

      {trade.notes && (
        <p className="text-[10px] font-mono text-muted-foreground bg-secondary/30 rounded-lg px-2 py-1.5">{trade.notes}</p>
      )}

      <div className="flex gap-2 pt-1">
        {trade.status === "open" && (
          <>
            {showClose ? (
              <div className="flex gap-1.5 flex-1">
                <input
                  type="number"
                  value={closePrice}
                  onChange={e => setClosePrice(e.target.value)}
                  placeholder="سعر الإغلاق"
                  className="flex-1 h-8 rounded-lg bg-secondary/60 border border-border/20 px-2 text-[11px] font-mono focus:outline-none focus:border-primary/30"
                />
                <button
                  onClick={() => { if (closePrice) onClose(parseFloat(closePrice)); }}
                  className="px-3 h-8 rounded-lg bg-primary/15 text-primary text-[10px] font-mono font-bold border border-primary/30"
                >
                  إغلاق
                </button>
                <button onClick={() => setShowClose(false)} className="px-2 h-8 rounded-lg bg-secondary text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClose(true)}
                className="flex-1 h-8 rounded-lg bg-accent/10 text-accent text-[10px] font-mono font-bold border border-accent/20"
              >
                إغلاق الصفقة
              </button>
            )}
          </>
        )}
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20"
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
