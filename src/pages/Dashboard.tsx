import { motion } from "framer-motion";
import {
  ChevronLeft, Zap, Camera, BookOpen, Brain,
  TrendingUp, TrendingDown, AlertTriangle, Target, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartAlgorithms } from "@/hooks/useSmartAlgorithms";
import { usePortfolioSync } from "@/hooks/usePortfolioSync";
import { Progress } from "@/components/ui/progress";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.12 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const { signalProbabilities } = useSmartAlgorithms();
  const {
    totalEquity, realizedPnl, unrealizedPnl,
    goalProgress, targetGoal, openTradesCount
  } = usePortfolioSync();

  const topSignals = useMemo(() => signals.filter(s => s.confidence >= 65).slice(0, 3), [signals]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      className="px-4 pt-5 pb-28 space-y-5 max-w-lg mx-auto"
    >
      {/* ═══ PORTFOLIO EQUITY ═══ */}
      <motion.div variants={fade} className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.15em]">Portfolio Equity</p>
          {openTradesCount > 0 && (
            <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 bg-warning/10 text-warning tabular-nums" style={{ borderRadius: '2px' }}>
              {openTradesCount} OPEN
            </span>
          )}
        </div>
        <p className="text-3xl font-mono font-bold tabular-nums tracking-tight">
          ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-[11px] font-mono font-semibold tabular-nums",
              realizedPnl >= 0 ? "text-success" : "text-destructive"
            )}>
              {realizedPnl >= 0 ? "+" : ""}${realizedPnl.toFixed(2)}
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/30">REALIZED</span>
          </div>
          {unrealizedPnl !== 0 && (
            <>
              <div className="h-3 w-px bg-border/10" />
              <div className="flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-warning animate-pulse" />
                <span className={cn(
                  "text-[11px] font-mono font-semibold tabular-nums",
                  unrealizedPnl >= 0 ? "text-success" : "text-destructive"
                )}>
                  {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
                </span>
                <span className="text-[7px] font-mono text-muted-foreground/30">UNREALIZED</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* ═══ MONTHLY GOAL ═══ */}
      <motion.div variants={fade} className="space-y-2.5 p-4 border border-border/20 bg-card" style={{ borderRadius: '4px' }}>
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.15em]">Monthly Goal</p>
          <p className="text-[11px] font-mono font-semibold text-primary tabular-nums">{Math.round(goalProgress)}%</p>
        </div>
        <Progress value={goalProgress} className="h-1.5 bg-secondary" />
        <div className="flex justify-between">
          <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">${totalEquity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">${targetGoal.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* ═══ ACTION GRID ═══ */}
      <motion.div variants={fade} className="grid grid-cols-4 gap-2">
        {[
          { icon: Zap, label: "Signals", path: "/signals" },
          { icon: Camera, label: "Chart AI", path: "/chart-analysis" },
          { icon: BookOpen, label: "Journal", path: "/journal" },
          { icon: Target, label: "Tools", path: "/tools" },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 py-3 border border-border/15 bg-card/50 transition-all hover:border-primary/20 hover:bg-primary/[0.02] active:scale-[0.98]"
            style={{ borderRadius: '4px' }}
          >
            <action.icon className="w-4 h-4 text-foreground/50" strokeWidth={1.5} />
            <span className="text-[8px] font-mono font-medium text-muted-foreground/60 uppercase tracking-wider">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ═══ CONTEXTUAL INTELLIGENCE FEED ═══ */}
      {topSignals.length > 0 && (
        <motion.div variants={fade} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-primary gold-glow" />
              <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.15em]">X Intelligence</span>
            </div>
            <button onClick={() => navigate("/signals")} className="text-[9px] font-mono text-primary/50 flex items-center gap-0.5 hover:text-primary transition-colors">
              View All <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-px">
            {topSignals.map((signal) => {
              const prob = signalProbabilities.get(signal.pair) ?? 50;
              return (
                <div key={signal.pair} onClick={() => navigate("/signals")}
                  className="flex items-center gap-3 p-3 border border-border/10 bg-card/30 cursor-pointer hover:border-primary/10 transition-all"
                  style={{ borderRadius: '4px' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono font-semibold">{signal.pair}</span>
                      <span className={cn("text-[9px] font-mono font-semibold px-1.5 py-0.5",
                        signal.direction === "صعودي" ? "text-success" : "text-destructive"
                      )} style={{ borderRadius: '2px', background: signal.direction === "صعودي" ? 'hsla(145, 63%, 42%, 0.08)' : 'hsla(0, 62%, 50%, 0.08)' }}>
                        {signal.direction === "صعودي" ? "LONG" : "SHORT"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-mono text-muted-foreground/40">E {signal.entry}</span>
                      <span className="text-[9px] font-mono text-success/50">T {signal.target1}</span>
                      <span className="text-[9px] font-mono text-destructive/50">S {signal.sl}</span>
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <p className={cn("text-[13px] font-mono font-bold tabular-nums", prob >= 65 ? "text-primary" : "text-muted-foreground")}>{prob}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ QUICK LINKS ═══ */}
      <motion.div variants={fade} className="space-y-1">
        {[
          { icon: Brain, label: "Morning Briefing", sub: "X daily market analysis", path: "/morning-brief" },
          { icon: TrendingUp, label: "Growth Path", sub: "Goal planner & risk tools", path: "/tools" },
        ].map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="w-full flex items-center gap-3 p-3 border border-border/8 hover:border-border/20 transition-all"
            style={{ borderRadius: '4px' }}
          >
            <link.icon className="w-4 h-4 text-muted-foreground/30 shrink-0" strokeWidth={1.5} />
            <div className="flex-1 text-right">
              <p className="text-[10px] font-mono font-medium text-foreground/60">{link.label}</p>
              <p className="text-[8px] font-mono text-muted-foreground/30">{link.sub}</p>
            </div>
            <ChevronLeft className="w-3 h-3 text-muted-foreground/20 shrink-0" />
          </button>
        ))}
      </motion.div>

      {/* ═══ DISCLAIMER ═══ */}
      <motion.div variants={fade} className="px-1 py-2">
        <div className="flex items-start gap-1.5">
          <AlertTriangle className="w-2.5 h-2.5 text-muted-foreground/15 shrink-0 mt-0.5" />
          <p className="text-[7px] font-mono text-muted-foreground/20 leading-relaxed">
            All data and recommendations are for educational purposes only. Trading involves high risk.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
