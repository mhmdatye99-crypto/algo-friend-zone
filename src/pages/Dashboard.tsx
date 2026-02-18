import { motion } from "framer-motion";
import {
  Activity, Shield, TrendingUp, TrendingDown,
  AlertTriangle, Flame, Brain, Sparkles, Award,
  BarChart3, ChevronLeft, Zap, Droplets,
  Crosshair, Eye
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
import WealthProgressCircle from "@/components/dashboard/WealthProgressCircle";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

const alertSeverityStyle: Record<string, string> = {
  critical: "border-destructive/15 bg-destructive/3",
  high: "border-warning/12 bg-warning/2",
  medium: "border-primary/12 bg-primary/2",
  low: "border-border/15 bg-muted/20",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const assets = useLivePrices();
  const { stats } = useGoalPlanner();
  const { traderScore, patterns, alerts, riskScore, volatilityMetric, liquidityBlocks, signalProbabilities, disciplineStreak } = useSmartAlgorithms();

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

  const equityCurve = useMemo(() => {
    let running = 0;
    return closedTrades.map((t: any) => { running += (t.pnl ?? 0); return running; });
  }, [closedTrades]);

  const topSignals = useMemo(() => signals.slice(0, 4), [signals]);
  const topMovers = useMemo(() => [...assets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4), [assets]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-4 pt-3 pb-24 space-y-3 max-w-lg mx-auto"
    >
      {/* ═══ DAILY INTELLIGENCE SUMMARY ═══ */}
      <motion.div variants={fade} className="rounded-lg p-3 border border-border/15 bg-card/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[9px] font-mono font-semibold text-foreground/80">ملخص X اليومي</span>
          </div>
          <span className="text-[7px] font-mono text-muted-foreground/40">{new Date().toLocaleDateString("ar-EG", { weekday: "short", month: "short", day: "numeric" })}</span>
        </div>
        <div className="space-y-1.5">
          {(() => {
            const bullishCount = signals.filter(s => s.direction === "صعودي").length;
            const bearishCount = signals.filter(s => s.direction === "هبوطي").length;
            const avgConf = signals.length > 0 ? Math.round(signals.reduce((s, sig) => s + sig.confidence, 0) / signals.length) : 0;
            const highVol = volatilityMetric.stressLevel >= 60;
            const summaryItems = [
              { icon: "📊", text: `هيكل السوق: ${bullishCount > bearishCount ? "ميل صعودي" : bearishCount > bullishCount ? "ميل هبوطي" : "محايد"} — ${bullishCount} إشارات شراء مقابل ${bearishCount} بيع`, tag: "STRUCTURE" },
              { icon: "💧", text: `السيولة: ${liquidityBlocks.filter(b => b.type === "institutional_buy").length} كتل شراء مؤسسي مرصودة${highVol ? " · تقلب مرتفع يستدعي الحذر" : " · تقلب معتدل"}`, tag: "LIQUIDITY" },
              { icon: "⚡", text: `الزخم: متوسط ثقة الإشارات ${avgConf}%${activeSignals.length > 0 ? ` · ${activeSignals.length} فرص عالية الجودة (≥70%)` : " · لا توجد فرص قوية حالياً"}`, tag: "MOMENTUM" },
            ];
            return summaryItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-muted/15 border border-border/5">
                <span className="text-xs shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[7px] font-mono font-bold text-primary/50 bg-primary/5 px-1 py-0.5 rounded-sm mr-1">{item.tag}</span>
                  <p className="text-[9px] font-mono text-foreground/70 leading-relaxed mt-0.5">{item.text}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </motion.div>

      {/* ═══ SMART QUICK PANEL ═══ */}
      <motion.div variants={fade} className="rounded-lg p-3 border border-border/15 bg-card/50">
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: `${marketPulse.index}%`, label: "نبض السوق", color: marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-warning" },
            { value: `${volatilityMetric.stressLevel}%`, label: "إجهاد السوق", color: volatilityMetric.color },
            { value: activeSignals.length.toString(), label: "إشارة نشطة", color: "text-primary" },
            { value: `${wealthProgress}%`, label: "تقدم الثروة", color: "text-success" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className={cn("text-[15px] font-mono font-bold tabular-nums", item.color)}>{item.value}</p>
              <p className="text-[7px] font-mono text-muted-foreground/60 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ DISCIPLINE STREAK ═══ */}
      {disciplineStreak.currentStreak > 0 && (
        <motion.div variants={fade} className="rounded-lg p-2.5 border border-primary/10 bg-primary/3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary/70" />
            <div>
              <p className="text-[10px] font-mono font-semibold text-primary/80">سلسلة الانضباط</p>
              <p className="text-[8px] font-mono text-muted-foreground">{disciplineStreak.levelAr} · {disciplineStreak.unlockedRewards.length} مكافآت</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-primary">{disciplineStreak.currentStreak}</p>
            <p className="text-[7px] font-mono text-muted-foreground/50">يوم</p>
          </div>
        </motion.div>
      )}

      {/* ═══ SCORES ROW ═══ */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-3 border border-border/15 bg-card/50">
          <div className="flex items-center justify-between mb-1.5">
            <Award className="w-3.5 h-3.5 text-primary/60" />
            <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm",
              traderScore.overall >= 75 ? "bg-success/8 text-success" : traderScore.overall >= 50 ? "bg-warning/8 text-warning" : "bg-destructive/8 text-destructive"
            )}>{traderScore.grade}</span>
          </div>
          <p className={cn("text-xl font-mono font-bold tabular-nums", traderScore.color)}>{traderScore.overall}</p>
          <p className="text-[7px] font-mono text-muted-foreground/50 mt-0.5">تقييم المتداول</p>
        </div>
        <div className="rounded-lg p-3 border border-border/15 bg-card/50">
          <div className="flex items-center justify-between mb-1.5">
            <Shield className="w-3.5 h-3.5 text-primary/60" />
            <span className={cn("text-[9px] font-mono font-semibold", riskScore.color)}>{riskScore.label}</span>
          </div>
          <p className={cn("text-xl font-mono font-bold tabular-nums", riskScore.color)}>{riskScore.score}</p>
          <p className="text-[7px] font-mono text-muted-foreground/50 mt-0.5">درجة المخاطر</p>
        </div>
      </motion.div>

      {/* ═══ EQUITY CURVE ═══ */}
      {equityCurve.length > 2 && (
        <motion.div variants={fade} className="rounded-lg p-3 border border-border/15 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-muted-foreground/60">منحنى الأداء</span>
            <span className={cn("text-[10px] font-mono font-semibold tabular-nums",
              equityCurve[equityCurve.length - 1] >= 0 ? "text-success" : "text-destructive"
            )}>
              {equityCurve[equityCurve.length - 1] >= 0 ? "+" : ""}${equityCurve[equityCurve.length - 1].toFixed(0)}
            </span>
          </div>
          <div className="h-12 flex items-end gap-[1px]">
            {equityCurve.map((val, i) => {
              const max = Math.max(...equityCurve.map(Math.abs), 1);
              const h = Math.max((Math.abs(val) / max) * 100, 3);
              return <div key={i} className={cn("flex-1 rounded-t-[1px]", val >= 0 ? "bg-success/50" : "bg-destructive/30")} style={{ height: `${h}%` }} />;
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ WEALTH PROGRESS CIRCLE ═══ */}
      <motion.div variants={fade}>
        <WealthProgressCircle />
      </motion.div>

      {/* ═══ INSTITUTIONAL ALERTS ═══ */}
      {alerts.length > 0 && (
        <motion.div variants={fade} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <Crosshair className="w-3 h-3 text-primary/60" />
            <span className="text-[8px] font-mono font-semibold text-muted-foreground/70">تنبيهات مؤسسية</span>
          </div>
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={cn("rounded-lg px-3 py-2 border flex items-start gap-2",
              alertSeverityStyle[alert.severity] || alertSeverityStyle.low
            )}>
              <span className="text-xs mt-0.5 shrink-0">{alert.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[7px] font-mono font-bold text-muted-foreground bg-muted/50 px-1 py-0.5 rounded-sm">{alert.tag}</span>
                  <p className="text-[9px] font-mono font-semibold text-foreground/90">{alert.title}</p>
                </div>
                <p className="text-[8px] font-mono text-muted-foreground/70 leading-relaxed">{alert.message}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ═══ LIQUIDITY BLOCKS ═══ */}
      {liquidityBlocks.length > 0 && (
        <motion.div variants={fade} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <Droplets className="w-3 h-3 text-primary/60" />
            <span className="text-[8px] font-mono font-semibold text-muted-foreground/70">كتل السيولة</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {liquidityBlocks.slice(0, 4).map((block, i) => (
              <div key={i} className={cn("rounded-lg p-2 border",
                block.type === "institutional_buy" ? "border-success/10 bg-success/2" :
                block.type === "institutional_sell" ? "border-destructive/10 bg-destructive/2" :
                "border-warning/10 bg-warning/2"
              )}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-mono font-semibold">{block.pair}</span>
                  <span className={cn("text-[8px] font-mono font-semibold",
                    block.type === "institutional_buy" ? "text-success" : block.type === "institutional_sell" ? "text-destructive" : "text-warning"
                  )}>{block.strength}%</span>
                </div>
                <p className="text-[7px] font-mono text-muted-foreground/50">
                  {block.type === "institutional_buy" ? "شراء مؤسسي" : block.type === "institutional_sell" ? "بيع مؤسسي" : "فجوة سيولة"}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ SIGNALS — DATA STRIPS ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary/60" />
            <span className="text-[8px] font-mono font-semibold text-muted-foreground/70">توصيات X</span>
          </div>
          <button onClick={() => navigate("/trade-center")} className="text-[8px] font-mono text-primary/60 flex items-center gap-0.5 hover:text-primary transition-colors">
            الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          {topSignals.map((signal) => {
            const prob = signalProbabilities.get(signal.pair) ?? 50;
            return (
              <div key={signal.pair} onClick={() => navigate("/trade-center")}
                className="rounded-lg p-2.5 border border-border/10 bg-card/40 flex items-center gap-2 cursor-pointer hover-lift">
                {signal.icon && <span className="text-sm w-6 text-center shrink-0">{signal.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-semibold">{signal.pair}</span>
                    <span className={cn("text-[8px] font-mono font-semibold px-1 py-0.5 rounded-sm",
                      signal.direction === "صعودي" ? "bg-success/6 text-success" : "bg-destructive/6 text-destructive"
                    )}>
                      {signal.direction === "صعودي" ? "↑ LONG" : "↓ SHORT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-mono text-muted-foreground/50">دخول {signal.entry}</span>
                    <span className="text-[8px] font-mono text-success/60">TP {signal.target1}</span>
                    <span className="text-[8px] font-mono text-destructive/60">SL {signal.sl}</span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className={cn("text-[11px] font-mono font-bold tabular-nums", prob >= 65 ? "text-success" : prob >= 50 ? "text-warning" : "text-muted-foreground")}>{prob}%</p>
                  <p className="text-[6px] font-mono text-muted-foreground/40">WIN</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ MARKET MOVERS — Compact List ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-warning/60" />
            <span className="text-[8px] font-mono font-semibold text-muted-foreground/70">أبرز التحركات</span>
          </div>
          <button onClick={() => navigate("/trade-center")} className="text-[8px] font-mono text-primary/60 flex items-center gap-0.5 hover:text-primary transition-colors">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        {/* Compact list view: Name | Sparkline | Price/Change */}
        <div className="space-y-0.5">
          {topMovers.map((asset) => (
            <div key={asset.pair} onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
              className="rounded-lg px-3 py-2 border border-border/8 bg-card/30 flex items-center gap-3 cursor-pointer hover-lift">
              <span className="text-sm shrink-0">{asset.icon}</span>
              <span className="text-[10px] font-mono font-semibold w-16 truncate">{asset.pair.replace("/USDT", "")}</span>
              <div className="flex-1">
                <MiniChart data={asset.sparkline} up={asset.up} width={60} height={16} />
              </div>
              <div className="text-left shrink-0">
                <p className="text-[10px] font-mono font-semibold tabular-nums">{formatPrice(asset.price)}</p>
                <p className={cn("text-[9px] font-mono tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                  {asset.up ? "+" : ""}{asset.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ PATTERNS ═══ */}
      {patterns.length > 0 && (
        <motion.div variants={fade} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <BarChart3 className="w-3 h-3 text-primary/60" />
            <span className="text-[8px] font-mono font-semibold text-muted-foreground/70">أنماط مرصودة</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {patterns.map((p, i) => (
              <div key={i} className={cn(
                "rounded-lg p-2.5 border shrink-0 w-36",
                p.direction === "bullish" ? "border-success/10 bg-success/2" : p.direction === "bearish" ? "border-destructive/10 bg-destructive/2" : "border-border/10 bg-muted/10"
              )}>
                <p className="text-[9px] font-mono font-semibold mb-0.5">{p.nameAr}</p>
                <p className="text-[7px] font-mono text-muted-foreground/50">{p.name} · {p.confidence}%</p>
                <div className="flex gap-1 mt-1">
                  {p.pairs.map(pair => (
                    <span key={pair} className="text-[7px] font-mono text-muted-foreground/60 bg-muted/30 px-1 py-0.5 rounded-sm">{pair}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ QUICK LINKS ═══ */}
      <motion.div variants={fade} className="space-y-1.5">
        <button onClick={() => navigate("/morning-brief")} className="w-full rounded-lg p-2.5 flex items-center gap-3 border border-border/10 bg-card/30 hover-lift">
          <Eye className="w-4 h-4 text-warning/60 shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-[10px] font-mono font-semibold text-foreground/80">الإحاطة الصباحية</p>
            <p className="text-[8px] font-mono text-muted-foreground/40">تقرير مكتب التداول اليومي</p>
          </div>
          <ChevronLeft className="w-3 h-3 text-muted-foreground/30 shrink-0" />
        </button>

        <button onClick={() => navigate("/learning")} className="w-full rounded-lg p-2.5 flex items-center gap-3 border border-border/10 bg-card/30 hover-lift">
          <Brain className="w-4 h-4 text-primary/60 shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-[10px] font-mono font-semibold text-foreground/80 flex items-center gap-1 justify-end">
              المُرشد X <Sparkles className="w-2.5 h-2.5 text-primary/50" />
            </p>
            <p className="text-[8px] font-mono text-muted-foreground/40">اسأل X عن أي زوج أو استراتيجية</p>
          </div>
          <ChevronLeft className="w-3 h-3 text-muted-foreground/30 shrink-0" />
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
