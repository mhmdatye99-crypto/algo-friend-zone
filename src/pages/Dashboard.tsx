import { motion } from "framer-motion";
import {
  Zap, Target, TrendingUp, TrendingDown, Star, ChevronLeft, Gauge,
  Bitcoin, DollarSign, LineChart, Activity, Brain, Briefcase, Shield,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import MiniChart from "@/components/MiniChart";
import { useFavorites } from "@/hooks/useFavorites";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import GaugeChart from "@/components/dashboard/GaugeChart";
import AICoachTip from "@/components/dashboard/AICoachTip";
import MorningBriefCard from "@/components/dashboard/MorningBriefCard";
import MarketMovers from "@/components/dashboard/MarketMovers";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChallenges } from "@/hooks/useChallenges";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type DashTab = "markets" | "trades" | "growth";

const Dashboard = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, isLoggedIn } = useFavorites();
  const { goal, stats } = useGoalPlanner();
  const { signals } = useSignals();
  const { user } = useAuth();
  const { latestScore } = useChallenges();
  const [activeTab, setActiveTab] = useState<DashTab>("markets");

  const activeSignalsCount = signals.filter(s => s.confidence >= 70).length;

  const marketPulse = useMemo(() => {
    if (signals.length === 0) return { index: 50, label: "محايد" };
    const bullish = signals.filter(s => s.direction === "صعودي").length;
    const index = Math.round((bullish / signals.length) * 100);
    const label = index >= 70 ? "صعودي قوي" : index >= 55 ? "صعودي معتدل" : index >= 45 ? "محايد" : index >= 30 ? "هبوطي معتدل" : "هبوطي قوي";
    return { index, label };
  }, [signals]);

  // Active trades
  const { data: activeTrades = [] } = useQuery({
    queryKey: ["active-trades", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  const cryptoAssets = useMemo(() => assets.filter(a => a.category === "كريبتو").slice(0, 8), [assets]);
  const forexAssets = useMemo(() => assets.filter(a => a.category === "فوركس").slice(0, 8), [assets]);
  const favoriteAssets = assets.filter(a => favorites.has(a.pair));

  const tabs: { key: DashTab; label: string; icon: React.ReactNode }[] = [
    { key: "markets", label: "الأسواق", icon: <Activity className="w-3.5 h-3.5" /> },
    { key: "trades", label: "صفقاتي", icon: <Briefcase className="w-3.5 h-3.5" /> },
    { key: "growth", label: "مسار النمو", icon: <Target className="w-3.5 h-3.5" /> },
  ];

  const hotSignals = useMemo(() => signals.slice(0, 3), [signals]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="px-5 pt-4 pb-28 space-y-5 max-w-lg mx-auto"
    >
      {/* ═══ HOT AI SIGNALS — Hero Section ═══ */}
      {hotSignals.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <div className="live-dot" />
              <Flame className="w-3.5 h-3.5 text-destructive" /> توصيات حية
            </p>
            <button onClick={() => navigate("/trade-center")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {hotSignals.map((signal, idx) => (
              <motion.div
                key={signal.pair}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/asset/${encodeURIComponent(signal.pair)}`)}
                className="glass rounded-[12px] p-3 cursor-pointer hover:bg-secondary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                style={{ borderImage: "linear-gradient(135deg, hsla(43,100%,50%,0.15), hsla(190,100%,50%,0.1)) 1" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{signal.icon}</span>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{signal.pair}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{signal.timeFrame} • {signal.risk}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold",
                      signal.direction === "صعودي"
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    )}>
                      {signal.direction === "صعودي" ? "شراء ↑" : "بيع ↓"}
                    </span>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] border",
                      signal.confidence >= 85 ? "bg-success/10 text-success border-success/20" :
                      signal.confidence >= 70 ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-warning/10 text-warning border-warning/20"
                    )}>
                      {signal.confidence}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ ONE-GLANCE: 3 Key Metrics ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2">
        <div
          className="rounded-[12px] p-3 text-center cursor-pointer hover:brightness-110 transition-all"
          style={{ background: "hsla(43, 100%, 50%, 0.06)", border: "1px solid hsla(43, 100%, 50%, 0.12)" }}
          onClick={() => navigate("/markets")}
        >
          <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-mono font-bold text-primary">{marketPulse.index}%</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">نبض السوق</p>
        </div>
        <div
          className="rounded-[12px] p-3 text-center cursor-pointer hover:brightness-110 transition-all"
          style={{ background: "hsla(190, 100%, 50%, 0.06)", border: "1px solid hsla(190, 100%, 50%, 0.12)" }}
          onClick={() => navigate("/goal-planner")}
        >
          <Target className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-lg font-mono font-bold text-accent">{stats ? `${stats.progress.toFixed(0)}%` : "0%"}</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">تقدّم الثروة</p>
        </div>
        <div
          className="rounded-[12px] p-3 text-center cursor-pointer hover:brightness-110 transition-all"
          style={{ background: "hsla(120, 60%, 50%, 0.06)", border: "1px solid hsla(120, 60%, 50%, 0.12)" }}
          onClick={() => navigate("/trade-center")}
        >
          <Activity className="w-4 h-4 text-success mx-auto mb-1" />
          <p className="text-lg font-mono font-bold text-success">{activeSignalsCount}</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">إشارات نشطة</p>
        </div>
      </motion.div>

      {/* ═══ Discipline Score Widget ═══ */}
      <motion.div
        variants={fadeUp}
        onClick={() => navigate("/challenges")}
        className="rounded-[12px] p-3 cursor-pointer hover:brightness-110 transition-all flex items-center gap-3"
        style={{ background: "hsla(190, 100%, 50%, 0.04)", border: "1px solid hsla(190, 100%, 50%, 0.1)" }}
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">درجة الانضباط</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-lg font-mono font-bold",
              (latestScore?.score ?? 50) >= 70 ? "text-success" : (latestScore?.score ?? 50) >= 40 ? "text-warning" : "text-destructive"
            )}>
              {latestScore?.score ?? 50}/100
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">التحديات والخطط →</span>
          </div>
        </div>
        <ChevronLeft className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      </motion.div>

      {/* ═══ Intelligence Center — AI Coach + Morning Brief ═══ */}
      <motion.div variants={fadeUp} className="space-y-2.5">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" /> مركز الذكاء
        </p>
        <MorningBriefCard />
        <AICoachTip />
      </motion.div>

      {/* ═══ Market Movers ═══ */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-warning" /> أكبر التحركات
          </p>
          <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <MarketMovers />
      </motion.div>

      {/* ═══ Tabbed View ═══ */}
      <motion.div variants={fadeUp}>
        <div className="flex gap-1.5 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-mono font-bold transition-all",
                activeTab === t.key
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary/40 text-muted-foreground border border-border/10"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Markets Tab */}
        {activeTab === "markets" && (
          <div className="space-y-4">
            {/* Crypto Market */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Bitcoin className="w-3.5 h-3.5 text-amber-400" /> سوق الكريبتو
                </p>
                <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
                  عرض الكل <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
                <div className="flex gap-2.5 min-w-max">
                  {cryptoAssets.map((asset) => (
                    <div
                      key={asset.pair}
                      onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                      className="glass rounded-[12px] px-3 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors min-w-[140px]"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{asset.icon}</span>
                        <span className="text-[11px] font-mono font-bold truncate">{asset.pair}</span>
                      </div>
                      <MiniChart data={asset.sparkline} up={asset.up} width={110} height={28} />
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                        <span className={cn("text-[10px] font-mono font-bold", asset.up ? "text-success" : "text-destructive")}>
                          {asset.up ? "+" : ""}{asset.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Forex Market */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> سوق الفوركس
                </p>
                <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
                  عرض الكل <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
                <div className="flex gap-2.5 min-w-max">
                  {forexAssets.map((asset) => (
                    <div
                      key={asset.pair}
                      onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                      className="glass rounded-[12px] px-3 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors min-w-[140px]"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{asset.icon}</span>
                        <span className="text-[11px] font-mono font-bold truncate">{asset.pair}</span>
                      </div>
                      <MiniChart data={asset.sparkline} up={asset.up} width={110} height={28} />
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                        <span className={cn("text-[10px] font-mono font-bold", asset.up ? "text-success" : "text-destructive")}>
                          {asset.up ? "+" : ""}{asset.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Favorites */}
            {isLoggedIn && favoriteAssets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" /> المفضلة
                  </p>
                </div>
                <div className="glass rounded-[12px] divide-y divide-border/10">
                  {favoriteAssets.slice(0, 5).map((asset) => (
                    <div
                      key={asset.pair}
                      onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border/20">
                          <span className="text-sm">{asset.icon}</span>
                        </div>
                        <span className="text-[12px] font-mono font-medium">{asset.pair}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MiniChart data={asset.sparkline} up={asset.up} width={40} height={16} />
                        <span className="text-[11px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                        <span className={cn("text-[10px] font-mono font-medium tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                          {asset.up ? "+" : ""}{asset.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Trades Tab */}
        {activeTab === "trades" && (
          <div className="space-y-3">
            {activeTrades.length === 0 ? (
              <div className="glass rounded-[14px] p-8 text-center">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-mono">لا توجد صفقات مفتوحة</p>
                <button
                  onClick={() => navigate("/trade-journal")}
                  className="mt-3 px-4 py-2 rounded-lg bg-primary/15 text-primary text-[11px] font-mono font-bold border border-primary/30"
                >
                  افتح سجل الصفقات
                </button>
              </div>
            ) : (
              <>
                {activeTrades.map((trade: any) => (
                  <div
                    key={trade.id}
                    onClick={() => navigate("/trade-journal")}
                    className="glass rounded-[12px] p-3 cursor-pointer hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center",
                          trade.direction === "long" ? "bg-success/15" : "bg-destructive/15"
                        )}>
                          {trade.direction === "long"
                            ? <TrendingUp className="w-3.5 h-3.5 text-success" />
                            : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                        </div>
                        <div>
                          <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                          <p className="text-[9px] font-mono text-muted-foreground">
                            {new Date(trade.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-warning/15 text-warning">مفتوحة</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-secondary/30 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[8px] font-mono text-muted-foreground">الدخول</p>
                        <p className="text-[11px] font-mono font-bold">{trade.entry_price}</p>
                      </div>
                      {trade.take_profit && (
                        <div className="bg-success/5 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-[8px] font-mono text-muted-foreground">TP</p>
                          <p className="text-[11px] font-mono font-bold text-success">{trade.take_profit}</p>
                        </div>
                      )}
                      {trade.stop_loss && (
                        <div className="bg-destructive/5 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-[8px] font-mono text-muted-foreground">SL</p>
                          <p className="text-[11px] font-mono font-bold text-destructive">{trade.stop_loss}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/trade-journal")}
                  className="w-full py-2.5 rounded-lg bg-secondary/40 text-muted-foreground text-[11px] font-mono font-bold border border-border/10 hover:bg-secondary/60 transition-colors"
                >
                  عرض جميع الصفقات →
                </button>
              </>
            )}
          </div>
        )}

        {/* Growth Path Tab */}
        {activeTab === "growth" && (
          <div className="space-y-3">
            {goal && stats ? (
              <>
                {/* Live P&L Card */}
                <div
                  onClick={() => navigate("/goal-planner")}
                  className="rounded-[14px] p-4 bg-card border border-border/30 cursor-pointer hover:brightness-105 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="live-dot" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">رصيد فعلي من الصفقات</span>
                    </div>
                    <span className={cn(
                      "text-[11px] font-mono font-bold px-2 py-0.5 rounded-md",
                      stats.achieved >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {stats.achieved >= 0 ? "+" : ""}${stats.achieved.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground">الرصيد الحالي</p>
                      <p className="text-2xl font-mono font-bold text-foreground">${(stats as any).effectiveBalance?.toLocaleString()}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-mono text-muted-foreground">الهدف</p>
                      <p className="text-lg font-mono font-bold text-primary">${goal.target_goal.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.5)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[9px] font-mono text-muted-foreground">
                    <span>{stats.progress.toFixed(1)}% مكتمل</span>
                    <span>{stats.daysRemaining} يوم متبقي</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="glass rounded-[12px] p-3 text-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase">المتبقي</p>
                    <p className="text-sm font-mono font-bold">${stats.remaining.toLocaleString()}</p>
                  </div>
                  <div className="glass rounded-[12px] p-3 text-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase">المطلوب يومياً</p>
                    <p className="text-sm font-mono font-bold text-warning">${stats.dailyRequired.toFixed(0)}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/goal-planner")}
                  className="w-full py-2.5 rounded-lg bg-primary/10 text-primary text-[11px] font-mono font-bold border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  عرض مسار النمو الكامل →
                </button>
              </>
            ) : (
              <div className="glass rounded-[14px] p-8 text-center">
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-mono">لم تبدأ مسار النمو بعد</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">ضع هدفاً مالياً وابدأ تتبع أرباحك من الصفقات</p>
                <button
                  onClick={() => navigate("/goal-planner")}
                  className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-mono font-bold"
                >
                  ابدأ الآن
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
