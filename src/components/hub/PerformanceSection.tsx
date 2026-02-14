import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Activity, Award, BarChart3, PieChart as PieIcon } from "lucide-react";
import { useTradePerformance } from "@/hooks/useTradePerformance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";

const COLORS_PIE = ["hsl(155 100% 45%)", "hsl(350 100% 50%)", "hsl(43 100% 50%)"];

type Tab = "curve" | "weekly" | "pairs";

const PerformanceSection = () => {
  const { data: perf, isLoading } = useTradePerformance();
  const [tab, setTab] = useState<Tab>("curve");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!perf || perf.closedTrades === 0) {
    return (
      <div className="rounded-xl p-6 text-center border border-border/10 bg-secondary/20">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground font-mono">لا توجد صفقات مغلقة بعد</p>
        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">أغلق صفقاتك في سجل الصفقات لتظهر إحصائياتك هنا</p>
      </div>
    );
  }

  const kpis = [
    { icon: Target, label: "معدل الفوز", value: `${perf.winRate.toFixed(1)}%`, color: perf.winRate >= 50 ? "text-success" : "text-destructive" },
    { icon: Activity, label: "عامل الربح", value: perf.profitFactor === Infinity ? "∞" : perf.profitFactor.toFixed(2), color: perf.profitFactor >= 1.5 ? "text-success" : "text-warning" },
    { icon: perf.totalPnl >= 0 ? TrendingUp : TrendingDown, label: "إجمالي PnL", value: `$${perf.totalPnl.toLocaleString()}`, color: perf.totalPnl >= 0 ? "text-success" : "text-destructive" },
    { icon: Award, label: "أقصى تراجع", value: `$${perf.maxDrawdown.toLocaleString()}`, color: "text-warning" },
  ];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "curve", label: "منحنى PnL", icon: TrendingUp },
    { id: "weekly", label: "الأيام", icon: BarChart3 },
    { id: "pairs", label: "الأزواج", icon: PieIcon },
  ];

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {kpis.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-3 border border-border/10 bg-secondary/30"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <k.icon className={cn("w-3.5 h-3.5", k.color)} />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{k.label}</span>
            </div>
            <p className={cn("text-sm font-bold font-mono", k.color)}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Win/Loss mini pie */}
      <div className="flex items-center gap-3 rounded-xl p-3 border border-border/10 bg-secondary/20">
        <div className="w-14 h-14 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "فوز", value: perf.winLoss.wins },
                  { name: "خسارة", value: perf.winLoss.losses },
                  { name: "تعادل", value: perf.winLoss.breakeven },
                ].filter(d => d.value > 0)}
                cx="50%" cy="50%" innerRadius={14} outerRadius={26} paddingAngle={3} dataKey="value" strokeWidth={0}
              >
                {[0, 1, 2].map((i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-xs font-bold font-mono text-success">{perf.winLoss.wins}</p>
            <p className="text-[8px] font-mono text-muted-foreground">فوز</p>
          </div>
          <div>
            <p className="text-xs font-bold font-mono text-destructive">{perf.winLoss.losses}</p>
            <p className="text-[8px] font-mono text-muted-foreground">خسارة</p>
          </div>
          <div>
            <p className="text-xs font-bold font-mono text-warning">{perf.winLoss.breakeven}</p>
            <p className="text-[8px] font-mono text-muted-foreground">تعادل</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[9px] font-mono text-muted-foreground">متوسط الربح</p>
          <p className="text-[11px] font-bold font-mono text-success">${perf.avgWin}</p>
          <p className="text-[9px] font-mono text-muted-foreground mt-1">متوسط الخسارة</p>
          <p className="text-[11px] font-bold font-mono text-destructive">${perf.avgLoss}</p>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-secondary/30 border border-border/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all",
              tab === t.id ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl p-3 border border-border/10 bg-secondary/20 h-44"
        >
          <ResponsiveContainer width="100%" height="100%">
            {tab === "curve" ? (
              <AreaChart data={perf.pnlCurve}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43 100% 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(43 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsla(43,100%,50%,0.15)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "PnL"]}
                />
                <Area type="monotone" dataKey="pnl" stroke="hsl(43 100% 50%)" strokeWidth={2} fill="url(#pnlGrad)" dot={false} />
              </AreaChart>
            ) : tab === "weekly" ? (
              <BarChart data={perf.weeklyPnl}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsla(43,100%,50%,0.15)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "PnL"]}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {perf.weeklyPnl.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={perf.pairBreakdown.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.04)" />
                <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="pair" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={60} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsla(43,100%,50%,0.15)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "PnL"]}
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                  {perf.pairBreakdown.slice(0, 6).map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Extra stats row */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl p-2.5 border border-border/10 bg-secondary/20 text-center">
          <p className="text-[8px] font-mono text-muted-foreground uppercase">أفضل زوج</p>
          <p className="text-[11px] font-bold font-mono text-success">{perf.bestPair}</p>
        </div>
        <div className="flex-1 rounded-xl p-2.5 border border-border/10 bg-secondary/20 text-center">
          <p className="text-[8px] font-mono text-muted-foreground uppercase">أسوأ زوج</p>
          <p className="text-[11px] font-bold font-mono text-destructive">{perf.worstPair}</p>
        </div>
        <div className="flex-1 rounded-xl p-2.5 border border-border/10 bg-secondary/20 text-center">
          <p className="text-[8px] font-mono text-muted-foreground uppercase">إجمالي الصفقات</p>
          <p className="text-[11px] font-bold font-mono">{perf.closedTrades}</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSection;
