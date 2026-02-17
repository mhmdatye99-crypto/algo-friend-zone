import { motion } from "framer-motion";
import {
  Zap, Target, TrendingUp, TrendingDown, ChevronLeft, Gauge,
  Activity, Shield, Crown, BarChart3, AlertTriangle, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useLivePrices, formatPrice, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP } from "@/hooks/useLivePrices";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChallenges } from "@/hooks/useChallenges";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useTradePerformance } from "@/hooks/useTradePerformance";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const { latestScore } = useChallenges();
  const { stats } = useGoalPlanner();
  const { data: perf } = useTradePerformance();
  const assets = useLivePrices();

  const activeSignals = useMemo(() => signals.filter(s => s.confidence >= 70), [signals]);

  const marketPulse = useMemo(() => {
    if (signals.length === 0) return { index: 50, label: "محايد" };
    const bullish = signals.filter(s => s.direction === "صعودي").length;
    const index = Math.round((bullish / signals.length) * 100);
    const label = index >= 70 ? "صعودي قوي" : index >= 55 ? "صعودي" : index >= 45 ? "محايد" : index >= 30 ? "هبوطي" : "هبوطي قوي";
    return { index, label };
  }, [signals]);

  const { data: activeTrades = [] } = useQuery({
    queryKey: ["active-trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades").select("*").eq("status", "open")
        .order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  // Weekly performance
  const weeklyPnl = perf?.totalPnl ?? 0;
  const winRate = perf?.winRate ?? 0;

  // Equity curve (last 20 closed trades)
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["equity-curve", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("pnl, closed_at")
        .eq("status", "closed").order("closed_at", { ascending: true }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const topSignals = useMemo(() => signals.slice(0, 5), [signals]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="px-4 pt-3 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* ═══ HEADER ═══ */}
      <motion.div variants={fadeUp}>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">مركز القيادة</p>
        <h1 className="text-lg font-bold">
          <span className="text-gradient-gold">Trading Intelligence</span> Center
        </h1>
      </motion.div>

      {/* ═══ PERFORMANCE OVERVIEW ROW ═══ */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-4 gap-2"
      >
        {[
          {
            icon: Gauge, label: "نبض السوق",
            value: `${marketPulse.index}%`,
            color: marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-primary",
          },
          {
            icon: Activity, label: "إشارات نشطة",
            value: `${activeSignals.length}`,
            color: "text-success",
          },
          {
            icon: Shield, label: "الانضباط",
            value: `${latestScore?.score ?? 50}`,
            color: (latestScore?.score ?? 50) >= 70 ? "text-success" : (latestScore?.score ?? 50) >= 40 ? "text-warning" : "text-destructive",
          },
          {
            icon: Target, label: "معدل الفوز",
            value: `${winRate.toFixed(0)}%`,
            color: winRate >= 50 ? "text-success" : "text-destructive",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-2.5 text-center bg-card/60 border border-border/10"
          >
            <item.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", item.color)} />
            <p className={cn("text-sm font-mono font-bold", item.color)}>{item.value}</p>
            <p className="text-[7px] font-mono text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ═══ WEEKLY SUMMARY ═══ */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-3 flex items-center justify-between"
        style={{
          background: weeklyPnl >= 0
            ? "linear-gradient(135deg, hsla(145, 80%, 48%, 0.06) 0%, transparent 100%)"
            : "linear-gradient(135deg, hsla(0, 85%, 55%, 0.06) 0%, transparent 100%)",
          border: `1px solid ${weeklyPnl >= 0 ? "hsla(145, 80%, 48%, 0.12)" : "hsla(0, 85%, 55%, 0.12)"}`,
        }}
      >
        <div>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">ملخص الأداء</p>
          <p className={cn("text-xl font-mono font-bold", weeklyPnl >= 0 ? "text-success" : "text-destructive")}>
            {weeklyPnl >= 0 ? "+" : ""}${weeklyPnl.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="text-center">
            <p className="text-muted-foreground">صفقات</p>
            <p className="font-bold">{perf?.closedTrades ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">R:R</p>
            <p className="font-bold text-primary">
              {perf?.profitFactor === Infinity ? "∞" : (perf?.profitFactor ?? 0).toFixed(1)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══ EQUITY CURVE PREVIEW ═══ */}
      {closedTrades.length > 2 && (
        <motion.div variants={fadeUp} className="rounded-xl p-3 bg-card/60 border border-border/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> منحنى رأس المال
            </p>
            <button onClick={() => navigate("/profile")} className="text-[8px] font-mono text-primary hover:underline">
              التفاصيل
            </button>
          </div>
          <div className="h-16 flex items-end gap-0.5">
            {closedTrades.map((t: any, i: number) => {
              const pnl = t.pnl ?? 0;
              const max = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
              const h = Math.max((Math.abs(pnl) / max) * 100, 6);
              return (
                <div
                  key={i}
                  className={cn("flex-1 rounded-t-sm", pnl >= 0 ? "bg-success/50" : "bg-destructive/50")}
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ UPGRADE BANNER ═══ */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate("/subscription")}
        className="w-full rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] hover:brightness-110"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(280, 80%, 60%, 0.06) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.12)",
        }}
      >
        <Crown className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="flex-1 text-right">
          <p className="text-[11px] font-mono font-bold">ترقية إلى Pro — تحليلات بلا حدود</p>
          <p className="text-[8px] font-mono text-muted-foreground">إشارات فورية + AI Scan + لوحة أداء كاملة</p>
        </div>
        <ChevronLeft className="w-4 h-4 text-amber-400 shrink-0" />
      </motion.button>

      {/* ═══ LIVE AI SIGNALS ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary" />
            <span className="font-bold text-foreground">إشارات AI حية</span>
          </p>
          <button onClick={() => navigate("/trade-center")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {topSignals.map((signal) => (
            <SignalCardCollapsible key={signal.pair} signal={signal} />
          ))}
        </div>
      </motion.div>

      {/* ═══ ACTIVE TRADES ═══ */}
      {activeTrades.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-accent" /> صفقات مفتوحة
              <span className="bg-accent/12 text-accent text-[8px] font-bold px-1.5 py-0.5 rounded-md">{activeTrades.length}</span>
            </p>
            <button onClick={() => navigate("/trade-journal")} className="text-[9px] font-mono text-primary hover:underline flex items-center gap-0.5">
              السجل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          {activeTrades.slice(0, 3).map((trade: any) => (
            <div
              key={trade.id}
              onClick={() => navigate("/trade-journal")}
              className="rounded-lg px-3 py-2.5 cursor-pointer bg-card/60 border border-border/10 hover:bg-card/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center",
                    trade.direction === "long" ? "bg-success/12" : "bg-destructive/12"
                  )}>
                    {trade.direction === "long"
                      ? <TrendingUp className="w-3 h-3 text-success" />
                      : <TrendingDown className="w-3 h-3 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold">{trade.pair}</p>
                    <p className="text-[8px] font-mono text-muted-foreground">
                      {trade.direction === "long" ? "شراء" : "بيع"} • {formatPrice(trade.entry_price)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-[8px] font-mono">
                  {trade.take_profit && <span className="text-success">TP {trade.take_profit}</span>}
                  {trade.stop_loss && <span className="text-destructive">SL {trade.stop_loss}</span>}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ═══ MARKET SENTIMENT ═══ */}
      <motion.div variants={fadeUp} className="rounded-xl p-3 bg-card/60 border border-border/10">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">مؤشر المزاج العام</p>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              marketPulse.index >= 55 ? "bg-success" : marketPulse.index <= 45 ? "bg-destructive" : "bg-warning"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${marketPulse.index}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[8px] font-mono text-muted-foreground">
          <span>هبوطي</span>
          <span className={cn("font-bold", marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-warning")}>
            {marketPulse.label} — {marketPulse.index}%
          </span>
          <span>صعودي</span>
        </div>
      </motion.div>

      {/* ═══ RISK DISCLAIMER ═══ */}
      <motion.div variants={fadeUp} className="rounded-xl p-3 border border-warning/10">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <p className="text-[8px] font-mono text-muted-foreground/70 leading-relaxed">
            جميع البيانات والتوصيات لأغراض تعليمية فقط. التداول ينطوي على مخاطر عالية. لا تتداول بأموال لا يمكنك تحمّل خسارتها. الأداء السابق لا يضمن النتائج المستقبلية.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
