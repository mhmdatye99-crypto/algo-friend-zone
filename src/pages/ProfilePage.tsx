import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, LogOut, ShieldCheck,
  BarChart3, Target, ChevronLeft, Crown,
  BookOpen, Wallet, ArrowUpRight, ArrowDownRight,
  PieChart, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useTradePerformance } from "@/hooks/useTradePerformance";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSubscribed: hasSubscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: perf } = useTradePerformance();
  const { goal, stats } = useGoalPlanner();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  // Open positions
  const { data: openTrades = [] } = useQuery({
    queryKey: ["open-trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  // Closed trades for history
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["portfolio-closed", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("status", "closed").order("closed_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const totalEquity = useMemo(() => {
    const capital = goal?.initial_capital ?? 0;
    const pnl = perf?.totalPnl ?? 0;
    return capital + pnl;
  }, [goal, perf]);

  const pairAllocation = useMemo(() => {
    if (!perf?.pairBreakdown || perf.pairBreakdown.length === 0) return [];
    const total = perf.pairBreakdown.reduce((s, p) => s + p.count, 0);
    return perf.pairBreakdown.slice(0, 5).map(p => ({
      pair: p.pair,
      pct: total > 0 ? Math.round((p.count / total) * 100) : 0,
      pnl: p.pnl,
    }));
  }, [perf]);

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-4 pt-3 pb-28 space-y-3 max-w-lg mx-auto"
    >
      {/* ═══ TOTAL EQUITY HERO ═══ */}
      <motion.div variants={fade} className="rounded-xl p-4 border border-border/15 bg-card/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">إجمالي رأس المال</span>
          </div>
          <span className={cn("text-[8px] font-mono font-bold px-2 py-0.5 rounded-md",
            hasSubscription ? "text-success bg-success/10" : "text-muted-foreground bg-secondary/50"
          )}>
            {hasSubscription ? "Pro" : "Free"}
          </span>
        </div>
        <p className="text-[28px] font-mono font-bold tabular-nums tracking-tight">
          ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            {(perf?.totalPnl ?? 0) >= 0 ? (
              <ArrowUpRight className="w-3 h-3 text-success" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-destructive" />
            )}
            <span className={cn("text-[12px] font-mono font-bold tabular-nums",
              (perf?.totalPnl ?? 0) >= 0 ? "text-success" : "text-destructive"
            )}>
              {(perf?.totalPnl ?? 0) >= 0 ? "+" : ""}${(perf?.totalPnl ?? 0).toLocaleString()}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/40">P&L</span>
          </div>
          <div className="h-3 w-px bg-border/20" />
          <div>
            <span className={cn("text-[11px] font-mono font-bold tabular-nums",
              (perf?.winRate ?? 0) >= 50 ? "text-success" : "text-destructive"
            )}>
              {(perf?.winRate ?? 0).toFixed(1)}%
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/40 mr-1">Win</span>
          </div>
          <div className="h-3 w-px bg-border/20" />
          <div>
            <span className="text-[11px] font-mono font-bold tabular-nums text-foreground/70">
              {perf?.closedTrades ?? 0}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/40 mr-1">صفقة</span>
          </div>
        </div>
      </motion.div>

      {/* ═══ KPI ROW ═══ */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-2">
        {[
          { label: "عامل الربح", value: perf?.profitFactor === Infinity ? "∞" : (perf?.profitFactor ?? 0).toFixed(2), color: "text-primary" },
          { label: "أقصى تراجع", value: `$${(perf?.maxDrawdown ?? 0).toFixed(0)}`, color: "text-destructive" },
          { label: "متوسط الربح", value: `$${(perf?.avgWin ?? 0).toFixed(0)}`, color: "text-success" },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl p-2.5 bg-card/40 border border-border/10 text-center">
            <p className={cn("text-[14px] font-mono font-bold tabular-nums", kpi.color)}>{kpi.value}</p>
            <p className="text-[7px] font-mono text-muted-foreground/50">{kpi.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ═══ GOAL PROGRESS ═══ */}
      {goal && stats && (
        <motion.div variants={fade} className="rounded-xl p-3 border border-border/15 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-[9px] font-mono font-semibold text-muted-foreground/70">مستهدفات النمو</span>
            </div>
            <button onClick={() => navigate("/tools")} className="text-[8px] font-mono text-primary/60 flex items-center gap-0.5">
              التفاصيل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-muted-foreground/50">
              ${goal.initial_capital.toLocaleString()} → ${goal.target_goal.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono font-bold text-primary tabular-nums">{stats.progress.toFixed(1)}%</span>
          </div>
          <Progress value={stats.progress} className="h-2 bg-secondary/30" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[8px] font-mono text-muted-foreground/40">
              الرصيد الحالي: <span className="text-foreground/70 font-bold">${stats.effectiveBalance.toLocaleString()}</span>
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/40">
              المتبقي: <span className="text-warning font-bold">${stats.remaining.toLocaleString()}</span>
            </span>
          </div>
          {stats.daysRemaining > 0 && (
            <p className="text-[7px] font-mono text-muted-foreground/30 mt-1">
              {stats.daysRemaining} يوم متبقي • مطلوب يومياً ${stats.dailyRequired.toFixed(0)}
            </p>
          )}
        </motion.div>
      )}

      {/* ═══ EQUITY CURVE ═══ */}
      {closedTrades.length > 0 && (
        <motion.div variants={fade} className="rounded-xl p-3 border border-border/10 bg-card/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-primary/50" />
            <span className="text-[9px] font-mono text-muted-foreground/60">منحنى رأس المال</span>
          </div>
          <div className="h-16 flex items-end gap-px">
            {closedTrades.slice().reverse().slice(0, 30).map((t: any, i: number) => {
              const pnl = t.pnl ?? 0;
              const max = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
              const h = Math.max((Math.abs(pnl) / max) * 100, 6);
              return <div key={i} className={cn("flex-1 rounded-t-sm min-w-[3px]", pnl >= 0 ? "bg-success/40" : "bg-destructive/40")} style={{ height: `${h}%` }} />;
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ PAIR ALLOCATION ═══ */}
      {pairAllocation.length > 0 && (
        <motion.div variants={fade} className="rounded-xl p-3 border border-border/10 bg-card/40">
          <div className="flex items-center gap-1.5 mb-2">
            <PieChart className="w-3 h-3 text-accent/50" />
            <span className="text-[9px] font-mono text-muted-foreground/60">توزيع الأصول</span>
          </div>
          <div className="space-y-1.5">
            {pairAllocation.map((p) => (
              <div key={p.pair} className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold w-20 truncate">{p.pair}</span>
                <div className="flex-1 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", p.pnl >= 0 ? "bg-success/50" : "bg-destructive/50")}
                    style={{ width: `${Math.max(p.pct, 4)}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums w-8 text-left">{p.pct}%</span>
                <span className={cn("text-[9px] font-mono font-bold tabular-nums w-14 text-left",
                  p.pnl >= 0 ? "text-success" : "text-destructive"
                )}>
                  {p.pnl >= 0 ? "+" : ""}${p.pnl}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ OPEN POSITIONS ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[9px] font-mono font-semibold text-muted-foreground/70">المراكز المفتوحة ({openTrades.length})</span>
          <button onClick={() => navigate("/journal")} className="text-[9px] font-mono text-primary/60 flex items-center gap-0.5">
            سجل صفقة <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        {openTrades.length === 0 ? (
          <div className="rounded-xl p-4 bg-card/30 border border-border/8 text-center">
            <p className="text-[10px] font-mono text-muted-foreground/40">لا توجد مراكز مفتوحة حالياً</p>
          </div>
        ) : (
          <div className="space-y-1">
            {openTrades.map((trade: any) => (
              <div key={trade.id} className="rounded-lg px-3 py-2.5 bg-card/40 border border-border/8 flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                  trade.direction === "long" ? "bg-success/10" : "bg-destructive/10")}>
                  {trade.direction === "long" ?
                    <TrendingUp className="w-3 h-3 text-success" /> :
                    <TrendingDown className="w-3 h-3 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold">{trade.pair}</span>
                    <span className={cn("text-[8px] font-mono font-bold px-1 py-0.5 rounded",
                      trade.direction === "long" ? "bg-success/8 text-success" : "bg-destructive/8 text-destructive"
                    )}>
                      {trade.direction === "long" ? "LONG" : "SHORT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-mono text-muted-foreground/50">دخول {trade.entry_price}</span>
                    {trade.stop_loss && <span className="text-[8px] font-mono text-destructive/50">SL {trade.stop_loss}</span>}
                    {trade.take_profit && <span className="text-[8px] font-mono text-success/50">TP {trade.take_profit}</span>}
                  </div>
                </div>
                {trade.position_size && (
                  <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">${trade.position_size}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ═══ RECENT CLOSED ═══ */}
      {closedTrades.length > 0 && (
        <motion.div variants={fade} className="space-y-1.5">
          <span className="text-[9px] font-mono font-semibold text-muted-foreground/70 px-0.5">آخر الصفقات المغلقة</span>
          <div className="space-y-0.5">
            {closedTrades.slice(0, 8).map((trade: any) => (
              <div key={trade.id} className="rounded-lg px-3 py-2 bg-card/30 border border-border/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center",
                    trade.direction === "long" ? "bg-success/8" : "bg-destructive/8")}>
                    {trade.direction === "long" ?
                      <TrendingUp className="w-2.5 h-2.5 text-success" /> :
                      <TrendingDown className="w-2.5 h-2.5 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold">{trade.pair}</p>
                    <p className="text-[7px] font-mono text-muted-foreground/40">
                      {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
                <span className={cn("text-[10px] font-mono font-bold tabular-nums",
                  (trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ QUICK LINKS ═══ */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-2">
        <button onClick={() => navigate("/journal")} className="flex items-center gap-2 p-3 rounded-xl bg-primary/6 border border-primary/10 hover:bg-primary/10 transition-all">
          <BookOpen className="w-4 h-4 text-primary/60" />
          <span className="text-[9px] font-mono font-bold">سجل الصفقات</span>
        </button>
        <button onClick={() => navigate("/tools")} className="flex items-center gap-2 p-3 rounded-xl bg-accent/6 border border-accent/10 hover:bg-accent/10 transition-all">
          <Target className="w-4 h-4 text-accent/60" />
          <span className="text-[9px] font-mono font-bold">حاسبة المخاطر</span>
        </button>
      </motion.div>

      {!hasSubscription && (
        <motion.button variants={fade} onClick={() => navigate("/subscription")}
          className="w-full rounded-xl p-3 flex items-center gap-3 hover:brightness-110 transition-all border border-primary/10 bg-primary/5">
          <Crown className="w-4 h-4 text-primary" />
          <div className="flex-1 text-right">
            <p className="text-[10px] font-mono font-bold">ترقية إلى Pro</p>
            <p className="text-[7px] font-mono text-muted-foreground/40">فتح جميع الميزات</p>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-primary/40" />
        </motion.button>
      )}

      {isAdmin && (
        <motion.div variants={fade}>
          <button onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-destructive/5 border border-destructive/10">
            <ShieldCheck className="w-4 h-4 text-destructive" />
            <span className="text-[10px] font-mono font-bold">لوحة الإدارة</span>
          </button>
        </motion.div>
      )}

      <motion.button variants={fade} onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-destructive text-[10px] font-mono font-bold hover:bg-destructive/8 transition-all border border-destructive/8">
        <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default ProfilePage;
