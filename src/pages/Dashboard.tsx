import { motion } from "framer-motion";
import {
  Gauge, Activity, Shield, TrendingUp, TrendingDown,
  AlertTriangle, Flame, Brain, Sparkles, Award, Bell,
  BarChart3, Target, ChevronLeft, Zap, Droplets, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/useChallenges";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useSmartAlgorithms } from "@/hooks/useSmartAlgorithms";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniChart from "@/components/MiniChart";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const assets = useLivePrices();
  const { latestScore } = useChallenges();
  const { stats } = useGoalPlanner();
  const { traderScore, patterns, alerts, riskScore, volatilityMetric, liquidityBlocks, signalProbabilities } = useSmartAlgorithms();

  const activeSignals = useMemo(() => signals.filter(s => s.confidence >= 70), [signals]);

  const marketPulse = useMemo(() => {
    if (signals.length === 0) return { index: 50, label: "محايد" };
    const bullish = signals.filter(s => s.direction === "صعودي").length;
    const index = Math.round((bullish / signals.length) * 100);
    const label = index >= 70 ? "صعودي قوي" : index >= 55 ? "صعودي" : index >= 45 ? "محايد" : index >= 30 ? "هبوطي" : "هبوطي قوي";
    return { index, label };
  }, [signals]);

  const wealthProgress = stats ? Math.round(stats.progress) : 0;

  // Equity curve from trades
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["dash-equity", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("pnl, closed_at").eq("status", "closed").order("closed_at", { ascending: true }).limit(30);
      return data || [];
    },
    enabled: !!user,
  });

  const equityCurve = useMemo(() => {
    let running = 0;
    return closedTrades.map((t: any) => {
      running += (t.pnl ?? 0);
      return running;
    });
  }, [closedTrades]);

  const topSignals = useMemo(() => signals.slice(0, 4), [signals]);

  const topMovers = useMemo(() => {
    const sorted = [...assets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return sorted.slice(0, 4);
  }, [assets]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-3 pt-2 pb-24 space-y-3 max-w-lg mx-auto"
    >
      {/* ═══ WEALTH INTELLIGENCE STRIP ═══ */}
      <motion.div variants={fadeUp} className="rounded-xl p-3 border border-border/10 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Market Pulse */}
          <div className="flex-1 text-center">
            <div className={cn("text-lg font-mono font-black tabular-nums", marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-warning")}>
              {marketPulse.index}%
            </div>
            <p className="text-[7px] font-mono text-muted-foreground/70 uppercase">نبض السوق</p>
          </div>
          <div className="w-px h-8 bg-border/20" />
          {/* Volatility */}
          <div className="flex-1 text-center">
            <div className={cn("text-lg font-mono font-black tabular-nums", volatilityMetric.color)}>
              {volatilityMetric.stressLevel}%
            </div>
            <p className="text-[7px] font-mono text-muted-foreground/70 uppercase">إجهاد السوق</p>
          </div>
          <div className="w-px h-8 bg-border/20" />
          {/* Active Signals */}
          <div className="flex-1 text-center">
            <div className="text-lg font-mono font-black tabular-nums text-accent">{activeSignals.length}</div>
            <p className="text-[7px] font-mono text-muted-foreground/70 uppercase">إشارة نشطة</p>
          </div>
          <div className="w-px h-8 bg-border/20" />
          {/* Wealth */}
          <div className="flex-1 text-center">
            <div className="text-lg font-mono font-black tabular-nums text-primary">{wealthProgress}%</div>
            <p className="text-[7px] font-mono text-muted-foreground/70 uppercase">تقدم الثروة</p>
          </div>
        </div>
      </motion.div>

      {/* ═══ EQUITY CURVE (mini) ═══ */}
      {equityCurve.length > 2 && (
        <motion.div variants={fadeUp} className="rounded-xl p-3 border border-border/10 bg-card/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-muted-foreground/70 uppercase tracking-wider">منحنى الأداء</span>
            <span className={cn("text-[10px] font-mono font-bold tabular-nums",
              equityCurve[equityCurve.length - 1] >= 0 ? "text-success" : "text-destructive"
            )}>
              {equityCurve[equityCurve.length - 1] >= 0 ? "+" : ""}${equityCurve[equityCurve.length - 1].toFixed(0)}
            </span>
          </div>
          <div className="h-14 flex items-end gap-px">
            {equityCurve.map((val, i) => {
              const max = Math.max(...equityCurve.map(Math.abs), 1);
              const h = Math.max((Math.abs(val) / max) * 100, 3);
              return <div key={i} className={cn("flex-1 rounded-t-[1px]", val >= 0 ? "bg-success/60" : "bg-destructive/40")} style={{ height: `${h}%` }} />;
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ TRADER SCORE + RISK COMPACT ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        {/* Trader Grade */}
        <div className="rounded-xl p-3 border border-border/10 bg-card/60">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-3.5 h-3.5 text-accent" />
            <div className={cn("text-[11px] font-mono font-black px-2 py-0.5 rounded-md",
              traderScore.overall >= 75 ? "bg-success/10 text-success" : traderScore.overall >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            )}>
              {traderScore.grade}
            </div>
          </div>
          <p className={cn("text-2xl font-mono font-black tabular-nums", traderScore.color)}>{traderScore.overall}</p>
          <p className="text-[7px] font-mono text-muted-foreground/60 uppercase">تقييم المتداول</p>
        </div>
        {/* Risk Score */}
        <div className="rounded-xl p-3 border border-border/10 bg-card/60">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className={cn("text-[9px] font-mono font-bold", riskScore.color)}>{riskScore.label}</span>
          </div>
          <p className={cn("text-2xl font-mono font-black tabular-nums", riskScore.color)}>{riskScore.score}</p>
          <p className="text-[7px] font-mono text-muted-foreground/60 uppercase">درجة المخاطر</p>
        </div>
      </motion.div>

      {/* ═══ SMART ALERTS ═══ */}
      {alerts.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <Bell className="w-3 h-3 text-warning" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-muted-foreground">تنبيهات X</span>
          </div>
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={cn(
              "rounded-lg px-3 py-2 border flex items-center gap-2",
              alert.severity === "high" ? "border-destructive/15 bg-destructive/3" :
              alert.severity === "medium" ? "border-warning/15 bg-warning/3" :
              "border-accent/15 bg-accent/3"
            )}>
              <span className="text-sm">{alert.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-mono font-bold text-foreground">{alert.title}</p>
                <p className="text-[8px] font-mono text-muted-foreground/70 truncate">{alert.message}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ═══ X LIQUIDITY BLOCKS ═══ */}
      {liquidityBlocks.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <Droplets className="w-3 h-3 text-accent" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-muted-foreground">كتل السيولة المؤسسية</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {liquidityBlocks.slice(0, 4).map((block, i) => (
              <div key={i} className={cn(
                "rounded-lg p-2.5 border",
                block.type === "institutional_buy" ? "border-success/15 bg-success/3" :
                block.type === "institutional_sell" ? "border-destructive/15 bg-destructive/3" :
                "border-warning/15 bg-warning/3"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold">{block.pair}</span>
                  <span className={cn("text-[8px] font-mono font-bold",
                    block.type === "institutional_buy" ? "text-success" : block.type === "institutional_sell" ? "text-destructive" : "text-warning"
                  )}>{block.strength}%</span>
                </div>
                <p className="text-[7px] font-mono text-muted-foreground/60">
                  {block.type === "institutional_buy" ? "شراء مؤسسي" : block.type === "institutional_sell" ? "بيع مؤسسي" : "فجوة سيولة"}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ HOT SIGNALS (Compact) ═══ */}
      <motion.div variants={fadeUp} className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-accent" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-muted-foreground">توصيات X</span>
          </div>
          <button onClick={() => navigate("/trade-center")} className="text-[8px] font-mono text-accent flex items-center gap-0.5 hover:underline">
            الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          {topSignals.map((signal) => {
            const prob = signalProbabilities.get(signal.pair) ?? 50;
            return (
              <div key={signal.pair} onClick={() => navigate("/trade-center")}
                className="rounded-lg p-2.5 border border-border/10 bg-card/50 flex items-center gap-2.5 cursor-pointer hover:bg-card/70 transition-colors active:scale-[0.99]">
                {signal.icon && <span className="text-base w-7 text-center">{signal.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold">{signal.pair}</span>
                    <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded",
                      signal.direction === "صعودي" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {signal.direction === "صعودي" ? "↑ LONG" : "↓ SHORT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-mono text-muted-foreground/60">دخول {signal.entry}</span>
                    <span className="text-[8px] font-mono text-success/70">TP {signal.target1}</span>
                    <span className="text-[8px] font-mono text-destructive/70">SL {signal.sl}</span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className={cn("text-[11px] font-mono font-black", prob >= 65 ? "text-success" : prob >= 50 ? "text-warning" : "text-muted-foreground")}>{prob}%</p>
                  <p className="text-[6px] font-mono text-muted-foreground/50 uppercase">Win Prob</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ MARKET MOVERS (Compact) ═══ */}
      <motion.div variants={fadeUp} className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-warning" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-muted-foreground">أبرز التحركات</span>
          </div>
          <button onClick={() => navigate("/trade-center")} className="text-[8px] font-mono text-accent flex items-center gap-0.5 hover:underline">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {topMovers.map((asset) => (
            <div key={asset.pair} onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
              className="rounded-lg p-2.5 border border-border/10 bg-card/50 flex items-center gap-2 cursor-pointer hover:bg-card/70 transition-colors">
              <span className="text-sm">{asset.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono font-bold truncate">{asset.pair.replace("/USDT", "")}</p>
                <p className="text-[8px] font-mono text-muted-foreground/60 tabular-nums">{formatPrice(asset.price)}</p>
              </div>
              <div className="text-left shrink-0 flex items-center gap-1">
                <MiniChart data={asset.sparkline} up={asset.up} width={32} height={14} />
                <span className={cn("text-[9px] font-mono font-bold tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                  {asset.up ? "+" : ""}{asset.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ MARKET PATTERNS ═══ */}
      {patterns.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <BarChart3 className="w-3 h-3 text-accent" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-muted-foreground">أنماط مرصودة</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-3 px-3">
            {patterns.map((p, i) => (
              <div key={i} className={cn(
                "rounded-lg p-2.5 border shrink-0 w-40",
                p.direction === "bullish" ? "border-success/15 bg-success/3" : p.direction === "bearish" ? "border-destructive/15 bg-destructive/3" : "border-border/15 bg-secondary/20"
              )}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs">{p.direction === "bullish" ? "📈" : "📉"}</span>
                  <span className="text-[9px] font-mono font-bold">{p.nameAr}</span>
                </div>
                <p className="text-[7px] font-mono text-muted-foreground/60">{p.name} · {p.confidence}%</p>
                <div className="flex gap-1 mt-1">
                  {p.pairs.map(pair => (
                    <span key={pair} className="text-[7px] font-mono bg-secondary/40 px-1 py-0.5 rounded">{pair}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ AI MENTOR QUICK ACCESS ═══ */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate("/learning")}
        className="w-full rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] hover:brightness-110 border border-accent/10 bg-accent/3 backdrop-blur-md"
      >
        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-[10px] font-mono font-bold text-foreground flex items-center gap-1 justify-end">
            المُرشد X <Sparkles className="w-2.5 h-2.5 text-accent" />
          </p>
          <p className="text-[8px] font-mono text-muted-foreground/60">اسأل X عن أي زوج أو استراتيجية</p>
        </div>
        <ChevronLeft className="w-3.5 h-3.5 text-accent/50 shrink-0" />
      </motion.button>

      {/* ═══ DISCLAIMER ═══ */}
      <motion.div variants={fadeUp} className="rounded-lg px-3 py-2 border border-border/5">
        <div className="flex items-start gap-1.5">
          <AlertTriangle className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-0.5" />
          <p className="text-[7px] font-mono text-muted-foreground/40 leading-relaxed">
            جميع البيانات والتوصيات لأغراض تعليمية فقط. التداول ينطوي على مخاطر عالية.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
