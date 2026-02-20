import { motion } from "framer-motion";
import {
  Activity, TrendingUp, TrendingDown, ChevronLeft, Zap,
  Eye, Brain, Sparkles, Award, Shield, BarChart3,
  Camera, BookOpen, Target, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import { useSmartAlgorithms } from "@/hooks/useSmartAlgorithms";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniChart from "@/components/MiniChart";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const assets = useLivePrices();
  const { stats } = useGoalPlanner();
  const { traderScore, riskScore, signalProbabilities } = useSmartAlgorithms();

  const activeSignals = useMemo(() => signals.filter(s => s.confidence >= 70), [signals]);

  const marketPulse = useMemo(() => {
    if (signals.length === 0) return { index: 50, label: "محايد" };
    const bullish = signals.filter(s => s.direction === "صعودي").length;
    const index = Math.round((bullish / signals.length) * 100);
    const label = index >= 70 ? "صعودي قوي" : index >= 55 ? "صعودي" : index >= 45 ? "محايد" : index >= 30 ? "هبوطي" : "هبوطي قوي";
    return { index, label };
  }, [signals]);

  const wealthProgress = stats ? Math.round(stats.progress) : 0;

  const { data: closedTrades = [] } = useQuery({
    queryKey: ["dash-equity", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("pnl, closed_at").eq("status", "closed").order("closed_at", { ascending: true }).limit(30);
      return data || [];
    },
    enabled: !!user,
  });

  const totalPnl = useMemo(() => closedTrades.reduce((s: number, t: any) => s + (t.pnl ?? 0), 0), [closedTrades]);
  const topSignals = useMemo(() => signals.slice(0, 3), [signals]);
  const trendingAssets = useMemo(() => [...assets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 8), [assets]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-4 pt-3 pb-28 space-y-3 max-w-lg mx-auto"
    >
      {/* ═══ OVERVIEW STATS ═══ */}
      <motion.div variants={fade} className="rounded-xl p-3 border border-border/15 bg-card/50">
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: `${marketPulse.index}%`, label: "نبض السوق", color: marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-warning" },
            { value: traderScore.grade, label: "تقييمك", color: traderScore.color },
            { value: `${activeSignals.length}`, label: "إشارة قوية", color: "text-primary" },
            { value: `${wealthProgress}%`, label: "تقدم الهدف", color: wealthProgress > 50 ? "text-success" : "text-warning" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className={cn("text-[15px] font-mono font-bold tabular-nums", item.color)}>{item.value}</p>
              <p className="text-[7px] font-mono text-muted-foreground/60 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ P&L SUMMARY ═══ */}
      {closedTrades.length > 0 && (
        <motion.div variants={fade} className="rounded-xl p-3 border border-border/15 bg-card/50 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-mono text-muted-foreground/60">الأرباح / الخسائر</p>
            <p className={cn("text-lg font-mono font-bold tabular-nums", totalPnl >= 0 ? "text-success" : "text-destructive")}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}
            </p>
          </div>
          <div className="text-left">
            <p className="text-[8px] font-mono text-muted-foreground/60">المخاطر</p>
            <p className={cn("text-sm font-mono font-bold", riskScore.color)}>{riskScore.label}</p>
          </div>
          <button onClick={() => navigate("/portfolio")} className="text-[9px] font-mono text-primary flex items-center gap-0.5">
            التفاصيل <ChevronLeft className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* ═══ QUICK ACTIONS ═══ */}
      <motion.div variants={fade} className="grid grid-cols-4 gap-2">
        {[
          { icon: Zap, label: "الإشارات", path: "/signals", color: "text-primary bg-primary/8 border-primary/15" },
          { icon: Camera, label: "تحليل شارت", path: "/chart-analysis", color: "text-accent bg-accent/8 border-accent/15" },
          { icon: BookOpen, label: "اليومية", path: "/journal", color: "text-success bg-success/8 border-success/15" },
          { icon: Brain, label: "المُرشد", path: "/learning", color: "text-warning bg-warning/8 border-warning/15" },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover-lift", action.color)}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-[9px] font-mono font-bold">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ═══ TOP SIGNALS ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] font-mono font-semibold text-muted-foreground/70">أبرز الإشارات</span>
          </div>
          <button onClick={() => navigate("/signals")} className="text-[9px] font-mono text-primary/60 flex items-center gap-0.5 hover:text-primary transition-colors">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          {topSignals.map((signal) => {
            const prob = signalProbabilities.get(signal.pair) ?? 50;
            return (
              <div key={signal.pair} onClick={() => navigate("/signals")}
                className="rounded-xl p-3 border border-border/10 bg-card/40 flex items-center gap-2.5 cursor-pointer hover-lift">
                {signal.icon && <span className="text-base w-7 text-center shrink-0">{signal.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-mono font-bold">{signal.pair}</span>
                    <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                      signal.direction === "صعودي" ? "bg-success/8 text-success" : "bg-destructive/8 text-destructive"
                    )}>
                      {signal.direction === "صعودي" ? "↑ شراء" : "↓ بيع"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground/60">دخول {signal.entry}</span>
                    <span className="text-[9px] font-mono text-success/60">TP {signal.target1}</span>
                    <span className="text-[9px] font-mono text-destructive/60">SL {signal.sl}</span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className={cn("text-[12px] font-mono font-bold tabular-nums", prob >= 65 ? "text-success" : "text-warning")}>{prob}%</p>
                  <p className="text-[7px] font-mono text-muted-foreground/40">ثقة</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ TRENDING ASSETS (Horizontal Scroll) ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-warning/60" />
            <span className="text-[9px] font-mono font-semibold text-muted-foreground/70">الأصول الرائجة</span>
          </div>
          <button onClick={() => navigate("/markets")} className="text-[9px] font-mono text-primary/60 flex items-center gap-0.5 hover:text-primary transition-colors">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {trendingAssets.map((asset) => (
            <button
              key={asset.pair}
              onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
              className="shrink-0 w-[130px] rounded-xl p-2.5 border border-border/10 bg-card/40 hover-lift transition-all text-right"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md tabular-nums",
                  asset.up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {asset.up ? "+" : ""}{asset.change}%
                </span>
                <span className="text-lg">{asset.icon}</span>
              </div>
              <p className="text-[11px] font-mono font-bold truncate">{asset.pair.replace("/USDT", "")}</p>
              <p className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">{formatPrice(asset.price)}</p>
              <div className="mt-1.5">
                <MiniChart data={asset.sparkline} up={asset.up} width={105} height={24} />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ QUICK LINKS ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <button onClick={() => navigate("/morning-brief")} className="w-full rounded-xl p-3 flex items-center gap-3 border border-border/10 bg-card/30 hover-lift">
          <Eye className="w-4 h-4 text-warning/60 shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-[11px] font-mono font-semibold text-foreground/80">الإحاطة الصباحية</p>
            <p className="text-[8px] font-mono text-muted-foreground/40">تقرير X اليومي للأسواق</p>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
        </button>

        <button onClick={() => navigate("/tools")} className="w-full rounded-xl p-3 flex items-center gap-3 border border-border/10 bg-card/30 hover-lift">
          <Target className="w-4 h-4 text-primary/60 shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-[11px] font-mono font-semibold text-foreground/80">الأدوات المالية</p>
            <p className="text-[8px] font-mono text-muted-foreground/40">حاسبة المخاطر ومسار النمو</p>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
        </button>
      </motion.div>

      {/* ═══ DISCLAIMER ═══ */}
      <motion.div variants={fade} className="rounded-md px-3 py-1.5">
        <div className="flex items-start gap-1.5">
          <AlertTriangle className="w-2.5 h-2.5 text-muted-foreground/20 shrink-0 mt-0.5" />
          <p className="text-[7px] font-mono text-muted-foreground/30 leading-relaxed">
            جميع البيانات والتوصيات لأغراض تعليمية فقط. التداول ينطوي على مخاطر عالية.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
