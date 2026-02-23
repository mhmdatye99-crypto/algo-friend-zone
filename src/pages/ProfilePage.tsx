import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, LogOut, ShieldCheck,
  Target, ChevronLeft, Crown,
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
  show: { opacity: 1, transition: { duration: 0.1 } },
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

  const { data: openTrades = [] } = useQuery({
    queryKey: ["open-trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

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
      {/* TOTAL EQUITY */}
      <motion.div variants={fade} className="p-4 border border-border/15 bg-card/50" style={{ borderRadius: '4px' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-[0.15em]">إجمالي رأس المال</span>
          </div>
          <span className={cn("text-[7px] font-mono font-bold px-1.5 py-0.5",
            hasSubscription ? "text-success bg-success/8" : "text-muted-foreground/50 bg-secondary/30"
          )} style={{ borderRadius: '2px' }}>
            {hasSubscription ? "PRO" : "FREE"}
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
            <span className={cn("text-[11px] font-mono font-bold tabular-nums",
              (perf?.totalPnl ?? 0) >= 0 ? "text-success" : "text-destructive"
            )}>
              {(perf?.totalPnl ?? 0) >= 0 ? "+" : ""}${(perf?.totalPnl ?? 0).toLocaleString()}
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/30">P&L</span>
          </div>
          <div className="h-3 w-px bg-border/10" />
          <div>
            <span className={cn("text-[10px] font-mono font-bold tabular-nums",
              (perf?.winRate ?? 0) >= 50 ? "text-success" : "text-destructive"
            )}>
              {(perf?.winRate ?? 0).toFixed(1)}%
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/30 mr-1">WIN</span>
          </div>
          <div className="h-3 w-px bg-border/10" />
          <div>
            <span className="text-[10px] font-mono font-bold tabular-nums text-foreground/60">{perf?.closedTrades ?? 0}</span>
            <span className="text-[7px] font-mono text-muted-foreground/30 mr-1">TRADES</span>
          </div>
        </div>
      </motion.div>

      {/* KPI ROW */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-1.5">
        {[
          { label: "PROFIT FACTOR", value: perf?.profitFactor === Infinity ? "∞" : (perf?.profitFactor ?? 0).toFixed(2), color: "text-primary" },
          { label: "MAX DD", value: `$${(perf?.maxDrawdown ?? 0).toFixed(0)}`, color: "text-destructive" },
          { label: "AVG WIN", value: `$${(perf?.avgWin ?? 0).toFixed(0)}`, color: "text-success" },
        ].map((kpi, i) => (
          <div key={i} className="p-2.5 bg-card/40 border border-border/8 text-center" style={{ borderRadius: '4px' }}>
            <p className={cn("text-[13px] font-mono font-bold tabular-nums", kpi.color)}>{kpi.value}</p>
            <p className="text-[6px] font-mono text-muted-foreground/30 uppercase tracking-wider mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </motion.div>

      {/* GOAL PROGRESS */}
      {goal && stats && (
        <motion.div variants={fade} className="p-3 border border-border/12 bg-card/40" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-primary/50" />
              <span className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-[0.15em]">مستهدفات النمو</span>
            </div>
            <button onClick={() => navigate("/tools")} className="text-[7px] font-mono text-primary/40 flex items-center gap-0.5 hover:text-primary transition-colors">
              التفاصيل <ChevronLeft className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">
              ${goal.initial_capital.toLocaleString()} → ${goal.target_goal.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono font-bold text-primary tabular-nums">{stats.progress.toFixed(1)}%</span>
          </div>
          <Progress value={stats.progress} className="h-1.5 bg-secondary/20" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[7px] font-mono text-muted-foreground/30 tabular-nums">
              الرصيد: <span className="text-foreground/60 font-bold">${stats.effectiveBalance.toLocaleString()}</span>
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/30 tabular-nums">
              المتبقي: <span className="text-warning font-bold">${stats.remaining.toLocaleString()}</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* EQUITY CURVE */}
      {closedTrades.length > 0 && (
        <motion.div variants={fade} className="p-3 border border-border/8 bg-card/30" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-primary/40" />
            <span className="text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.15em]">EQUITY CURVE</span>
          </div>
          <div className="h-14 flex items-end gap-px">
            {closedTrades.slice().reverse().slice(0, 30).map((t: any, i: number) => {
              const pnl = t.pnl ?? 0;
              const max = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
              const h = Math.max((Math.abs(pnl) / max) * 100, 6);
              return <div key={i} className={cn("flex-1 min-w-[3px]", pnl >= 0 ? "bg-success/30" : "bg-destructive/30")} style={{ height: `${h}%`, borderRadius: '1px' }} />;
            })}
          </div>
        </motion.div>
      )}

      {/* PAIR ALLOCATION */}
      {pairAllocation.length > 0 && (
        <motion.div variants={fade} className="p-3 border border-border/8 bg-card/30" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <PieChart className="w-3 h-3 text-accent/40" />
            <span className="text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.15em]">ALLOCATION</span>
          </div>
          <div className="space-y-1">
            {pairAllocation.map((p) => (
              <div key={p.pair} className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold w-16 truncate">{p.pair}</span>
                <div className="flex-1 h-1 bg-secondary/15 overflow-hidden" style={{ borderRadius: '1px' }}>
                  <div
                    className={cn("h-full", p.pnl >= 0 ? "bg-success/40" : "bg-destructive/40")}
                    style={{ width: `${Math.max(p.pct, 4)}%`, borderRadius: '1px' }}
                  />
                </div>
                <span className="text-[8px] font-mono text-muted-foreground/40 tabular-nums w-7 text-left">{p.pct}%</span>
                <span className={cn("text-[8px] font-mono font-bold tabular-nums w-12 text-left",
                  p.pnl >= 0 ? "text-success" : "text-destructive"
                )}>
                  {p.pnl >= 0 ? "+" : ""}${p.pnl}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* OPEN POSITIONS */}
      <motion.div variants={fade} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-[0.15em]">المراكز المفتوحة ({openTrades.length})</span>
          <button onClick={() => navigate("/journal")} className="text-[7px] font-mono text-primary/40 flex items-center gap-0.5 hover:text-primary transition-colors">
            سجل صفقة <ChevronLeft className="w-2.5 h-2.5" />
          </button>
        </div>
        {openTrades.length === 0 ? (
          <div className="p-4 bg-card/20 border border-border/5 text-center" style={{ borderRadius: '4px' }}>
            <p className="text-[9px] font-mono text-muted-foreground/25">لا توجد مراكز مفتوحة</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {openTrades.map((trade: any) => (
              <div key={trade.id} className="px-3 py-2 bg-card/30 border border-border/5 flex items-center gap-2" style={{ borderRadius: '4px' }}>
                <div className={cn("w-5 h-5 flex items-center justify-center shrink-0",
                  trade.direction === "long" ? "text-success" : "text-destructive")}>
                  {trade.direction === "long" ?
                    <TrendingUp className="w-3 h-3" /> :
                    <TrendingDown className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold">{trade.pair}</span>
                    <span className={cn("text-[7px] font-mono font-bold px-1 py-0.5",
                      trade.direction === "long" ? "text-success bg-success/6" : "text-destructive bg-destructive/6"
                    )} style={{ borderRadius: '2px' }}>
                      {trade.direction === "long" ? "LONG" : "SHORT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[7px] font-mono text-muted-foreground/35 tabular-nums">E {trade.entry_price}</span>
                    {trade.stop_loss && <span className="text-[7px] font-mono text-destructive/40 tabular-nums">SL {trade.stop_loss}</span>}
                    {trade.take_profit && <span className="text-[7px] font-mono text-success/40 tabular-nums">TP {trade.take_profit}</span>}
                  </div>
                </div>
                {trade.position_size && (
                  <span className="text-[8px] font-mono text-muted-foreground/30 tabular-nums">${trade.position_size}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* RECENT CLOSED */}
      {closedTrades.length > 0 && (
        <motion.div variants={fade} className="space-y-1">
          <span className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-[0.15em]">آخر الصفقات المغلقة</span>
          <div className="space-y-px">
            {closedTrades.slice(0, 8).map((trade: any) => (
              <div key={trade.id} className="px-3 py-1.5 bg-card/20 border border-border/3 flex items-center justify-between" style={{ borderRadius: '3px' }}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 flex items-center justify-center",
                    trade.direction === "long" ? "text-success" : "text-destructive")}>
                    {trade.direction === "long" ?
                      <TrendingUp className="w-2.5 h-2.5" /> :
                      <TrendingDown className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p className="text-[8px] font-mono font-bold">{trade.pair}</p>
                    <p className="text-[6px] font-mono text-muted-foreground/25">
                      {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-mono font-bold tabular-nums",
                  (trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* QUICK LINKS */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-1.5">
        <button onClick={() => navigate("/journal")} className="flex items-center gap-2 p-3 bg-card/30 border border-border/8 hover:border-border/20 transition-all" style={{ borderRadius: '4px' }}>
          <BookOpen className="w-3.5 h-3.5 text-primary/40" />
          <span className="text-[8px] font-mono font-bold text-foreground/60">سجل الصفقات</span>
        </button>
        <button onClick={() => navigate("/tools")} className="flex items-center gap-2 p-3 bg-card/30 border border-border/8 hover:border-border/20 transition-all" style={{ borderRadius: '4px' }}>
          <Target className="w-3.5 h-3.5 text-accent/40" />
          <span className="text-[8px] font-mono font-bold text-foreground/60">حاسبة المخاطر</span>
        </button>
      </motion.div>

      {!hasSubscription && (
        <motion.button variants={fade} onClick={() => navigate("/subscription")}
          className="w-full p-3 flex items-center gap-3 hover:brightness-110 transition-all border border-primary/10 bg-primary/4"
          style={{ borderRadius: '4px' }}>
          <Crown className="w-3.5 h-3.5 text-primary" />
          <div className="flex-1 text-right">
            <p className="text-[9px] font-mono font-bold">ترقية إلى Pro</p>
            <p className="text-[6px] font-mono text-muted-foreground/30">فتح جميع الميزات</p>
          </div>
          <ChevronLeft className="w-3 h-3 text-primary/30" />
        </motion.button>
      )}

      {isAdmin && (
        <motion.div variants={fade}>
          <button onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-destructive/4 border border-destructive/8"
            style={{ borderRadius: '4px' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-destructive/60" />
            <span className="text-[9px] font-mono font-bold text-foreground/60">لوحة الإدارة</span>
          </button>
        </motion.div>
      )}

      <motion.button variants={fade} onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-destructive/60 text-[9px] font-mono font-bold hover:bg-destructive/5 transition-all border border-destructive/6"
        style={{ borderRadius: '4px' }}>
        <LogOut className="w-3 h-3" /> تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default ProfilePage;
