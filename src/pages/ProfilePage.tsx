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
import { usePortfolioSync } from "@/hooks/usePortfolioSync";
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
  const { totalEquity, realizedPnl, unrealizedPnl, openTradesCount } = usePortfolioSync();
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

  const pairAllocation = useMemo(() => {
    if (!perf?.pairBreakdown || perf.pairBreakdown.length === 0) return [];
    const total = perf.pairBreakdown.reduce((s, p) => s + p.count, 0);
    return perf.pairBreakdown.slice(0, 5).map(p => ({
      pair: p.pair,
      pct: total > 0 ? Math.round((p.count / total) * 100) : 0,
      pnl: p.pnl,
    }));
  }, [perf]);

  const totalPnl = realizedPnl + unrealizedPnl;
  const equityBase = totalEquity - totalPnl;
  const totalPnlPct = equityBase !== 0 ? (totalPnl / Math.abs(equityBase)) * 100 : 0;

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="nx-page"
    >
      {/* TOTAL EQUITY — PRIMARY CARD */}
      <motion.div variants={fade} className="nx-card-premium">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="nx-label">إجمالي المحفظة</span>
          </div>
          <span className={cn("nx-badge",
            hasSubscription ? "nx-badge-gold" : "nx-badge-neutral"
          )}>
            {hasSubscription ? "PRO" : "FREE"}
          </span>
        </div>
        <p className="nx-num-lg nx-ltr">
          ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-2 mt-3">
          {totalPnl >= 0 ? (
            <ArrowUpRight className="w-4 h-4 text-success" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-destructive" />
          )}
          <span className={cn("nx-ltr font-mono text-[16px] font-bold tabular-nums",
            totalPnl >= 0 ? "text-success" : "text-destructive"
          )}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className={cn("nx-ltr font-mono text-[14px] font-semibold",
            totalPnl >= 0 ? "text-success" : "text-destructive"
          )}>
            ({totalPnl >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%)
          </span>
          {unrealizedPnl !== 0 && (
            <span className="nx-badge nx-badge-warn mr-auto flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> غير محقق
            </span>
          )}
        </div>
      </motion.div>

      {/* 2x2 METRIC GRID */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-3">
        <div className="nx-card-flat text-center">
          <p className="nx-meta mb-1">الأرباح/الخسائر</p>
          <p className={cn("nx-num nx-ltr", realizedPnl >= 0 ? "text-success" : "text-destructive")}>
            {realizedPnl >= 0 ? "+" : ""}${realizedPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="nx-card-flat text-center">
          <p className="nx-meta mb-1">نسبة الفوز</p>
          <p className={cn("nx-num nx-ltr", (perf?.winRate ?? 0) >= 50 ? "text-success" : "text-destructive")}>
            {(perf?.winRate ?? 0).toFixed(1)}%
          </p>
        </div>
        <div className="nx-card-flat text-center">
          <p className="nx-meta mb-1">عامل الربح</p>
          <p className="nx-num nx-ltr text-primary">
            {perf?.profitFactor === Infinity ? "∞" : (perf?.profitFactor ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="nx-card-flat text-center">
          <p className="nx-meta mb-1">أقصى تراجع</p>
          <p className="nx-num nx-ltr text-destructive">
            ${(perf?.maxDrawdown ?? 0).toFixed(0)}
          </p>
        </div>
      </motion.div>

      {/* GOAL PROGRESS */}
      {goal && stats && (
        <motion.div variants={fade} className="nx-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-primary" />
              <span className="nx-label">مستهدفات النمو</span>
            </div>
            <button onClick={() => navigate("/tools")} className="nx-meta flex items-center gap-0.5 text-primary hover:text-primary/80 transition-colors">
              التفاصيل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="nx-meta nx-ltr">
              ${goal.initial_capital.toLocaleString()} → ${goal.target_goal.toLocaleString()}
            </span>
            <span className="font-mono text-[15px] font-bold text-primary tabular-nums">{stats.progress.toFixed(1)}%</span>
          </div>
          <Progress value={stats.progress} className="h-2 bg-secondary" />
          <div className="flex items-center justify-between mt-3">
            <span className="nx-meta">
              الرصيد: <span className="text-foreground font-semibold nx-ltr">${stats.effectiveBalance.toLocaleString()}</span>
            </span>
            <span className="nx-meta">
              المتبقي: <span className="text-warning font-semibold nx-ltr">${stats.remaining.toLocaleString()}</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* OPEN POSITIONS */}
      <motion.div variants={fade} className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="nx-label">المراكز المفتوحة ({openTrades.length})</span>
          <button onClick={() => navigate("/journal")} className="nx-meta flex items-center gap-0.5 text-primary hover:text-primary/80 transition-colors">
            سجل صفقة <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        {openTrades.length === 0 ? (
          <div className="nx-card-flat text-center">
            <p className="nx-meta">لا توجد مراكز مفتوحة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openTrades.map((trade: any) => (
              <div key={trade.id} className="nx-row px-4 py-3 flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  trade.direction === "long" ? "text-success bg-success/10" : "text-destructive bg-destructive/10")}>
                  {trade.direction === "long" ?
                    <TrendingUp className="w-4 h-4" /> :
                    <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px]">{trade.pair}</span>
                    <span className={trade.direction === "long" ? "nx-badge-long" : "nx-badge-short"}>
                      {trade.direction === "long" ? "LONG" : "SHORT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 nx-meta nx-ltr">
                    <span>E {trade.entry_price}</span>
                    {trade.stop_loss && <span className="text-destructive">SL {trade.stop_loss}</span>}
                    {trade.take_profit && <span className="text-success">TP {trade.take_profit}</span>}
                  </div>
                </div>
                {trade.position_size && (
                  <span className="nx-meta nx-ltr shrink-0">${trade.position_size}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* PERFORMANCE — EQUITY CURVE + ALLOCATION */}
      {(closedTrades.length > 0 || pairAllocation.length > 0) && (
        <motion.div variants={fade} className="space-y-3">
          <span className="nx-label">الأداء</span>

          {closedTrades.length > 0 && (
            <div className="nx-card">
              <div className="flex items-center gap-1.5 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="nx-meta">منحنى الأداء</span>
              </div>
              <div className="h-16 flex items-end gap-1">
                {closedTrades.slice().reverse().slice(0, 30).map((t: any, i: number) => {
                  const pnl = t.pnl ?? 0;
                  const max = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
                  const h = Math.max((Math.abs(pnl) / max) * 100, 8);
                  return <div key={i} className={cn("flex-1 min-w-[3px] rounded-sm", pnl >= 0 ? "bg-success/50" : "bg-destructive/50")} style={{ height: `${h}%` }} />;
                })}
              </div>
            </div>
          )}

          {pairAllocation.length > 0 && (
            <div className="nx-card">
              <div className="flex items-center gap-1.5 mb-3">
                <PieChart className="w-4 h-4 text-accent" />
                <span className="nx-meta">توزيع الأزواج</span>
              </div>
              <div className="space-y-2">
                {pairAllocation.map((p) => (
                  <div key={p.pair} className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold w-16 truncate">{p.pair}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", p.pnl >= 0 ? "bg-success/60" : "bg-destructive/60")}
                        style={{ width: `${Math.max(p.pct, 4)}%` }}
                      />
                    </div>
                    <span className="nx-meta nx-ltr w-9 text-left">{p.pct}%</span>
                    <span className={cn("font-mono text-[13px] font-semibold nx-ltr w-14 text-left",
                      p.pnl >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {p.pnl >= 0 ? "+" : ""}${p.pnl}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* RECENT CLOSED — سجل الصفقات */}
      <motion.div variants={fade} className="space-y-3">
        <span className="nx-label">سجل الصفقات</span>
        {closedTrades.length === 0 ? (
          <div className="nx-card-flat text-center">
            <p className="nx-meta">لا توجد صفقات مغلقة بعد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {closedTrades.slice(0, 8).map((trade: any) => (
              <div key={trade.id} className="nx-row px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center",
                    trade.direction === "long" ? "text-success bg-success/10" : "text-destructive bg-destructive/10")}>
                    {trade.direction === "long" ?
                      <TrendingUp className="w-3.5 h-3.5" /> :
                      <TrendingDown className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]">{trade.pair}</p>
                    <p className="nx-meta">
                      {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
                <span className={cn("font-mono text-[15px] font-bold tabular-nums nx-ltr",
                  (trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* QUICK LINKS */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/journal")} className="nx-card-flat nx-tap flex items-center gap-2 hover:border-primary/30 transition-all">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-[14px] font-semibold">سجل الصفقات</span>
        </button>
        <button onClick={() => navigate("/tools")} className="nx-card-flat nx-tap flex items-center gap-2 hover:border-accent/30 transition-all">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-[14px] font-semibold">حاسبة المخاطر</span>
        </button>
      </motion.div>

      {!hasSubscription && (
        <motion.button variants={fade} onClick={() => navigate("/subscription")}
          className="nx-tap w-full p-4 rounded-2xl flex items-center gap-3 hover:brightness-110 transition-all border border-primary/20 bg-primary/5">
          <Crown className="w-5 h-5 text-primary" />
          <div className="flex-1 text-right">
            <p className="text-[15px] font-bold">ترقية إلى Pro</p>
            <p className="nx-meta">فتح جميع الميزات</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-primary" />
        </motion.button>
      )}

      {isAdmin && (
        <motion.div variants={fade}>
          <button onClick={() => navigate("/admin")}
            className="nx-tap w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-destructive/5 border border-destructive/15">
            <ShieldCheck className="w-4 h-4 text-destructive" />
            <span className="text-[14px] font-semibold">لوحة الإدارة</span>
          </button>
        </motion.div>
      )}

      <motion.button variants={fade} onClick={handleSignOut}
        className="nx-tap w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-destructive text-[14px] font-semibold hover:bg-destructive/5 transition-all border border-destructive/15">
        <LogOut className="w-4 h-4" /> تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default ProfilePage;
