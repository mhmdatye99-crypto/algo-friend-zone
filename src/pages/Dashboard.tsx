import { motion } from "framer-motion";
import {
  Zap, Target, TrendingUp, TrendingDown, Star, ChevronLeft, Gauge,
  Bitcoin, DollarSign, LineChart, Activity, Brain, Briefcase, Shield,
  Flame, ScanLine, BookOpen, Calculator, Crown, Sun, Eye, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useLivePrices, formatPrice, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP } from "@/hooks/useLivePrices";
import MiniChart from "@/components/MiniChart";
import { useFavorites } from "@/hooks/useFavorites";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import GaugeChart from "@/components/dashboard/GaugeChart";
import AICoachTip from "@/components/dashboard/AICoachTip";
import MorningBriefCard from "@/components/dashboard/MorningBriefCard";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChallenges } from "@/hooks/useChallenges";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const AssetLogo = ({ pair, icon, category }: { pair: string; icon: string; category: string }) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];
  if (category === "كريبتو" && logoUrl) {
    return <img src={logoUrl} alt={pair} className="w-7 h-7 rounded-full" />;
  }
  if (category === "فوركس" && flags) {
    return <span className="text-base leading-none">{flags}</span>;
  }
  return <span className="text-base">{icon}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, isLoggedIn } = useFavorites();
  const { goal, stats } = useGoalPlanner();
  const { signals } = useSignals();
  const { user } = useAuth();
  const { latestScore } = useChallenges();

  const activeSignalsCount = signals.filter(s => s.confidence >= 70).length;

  const marketPulse = useMemo(() => {
    if (signals.length === 0) return { index: 50, label: "محايد" };
    const bullish = signals.filter(s => s.direction === "صعودي").length;
    const index = Math.round((bullish / signals.length) * 100);
    const label = index >= 70 ? "صعودي قوي" : index >= 55 ? "صعودي معتدل" : index >= 45 ? "محايد" : index >= 30 ? "هبوطي معتدل" : "هبوطي قوي";
    return { index, label };
  }, [signals]);

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

  const cryptoAssets = useMemo(() => assets.filter(a => a.category === "كريبتو").slice(0, 6), [assets]);
  const forexAssets = useMemo(() => assets.filter(a => a.category === "فوركس").slice(0, 6), [assets]);
  const favoriteAssets = assets.filter(a => favorites.has(a.pair));
  const hotSignals = useMemo(() => signals.slice(0, 3), [signals]);

  const topGainers = useMemo(() => [...assets].sort((a, b) => b.change - a.change).slice(0, 3), [assets]);
  const topLosers = useMemo(() => [...assets].sort((a, b) => a.change - b.change).slice(0, 3), [assets]);

  const quickTools = [
    { icon: Zap, label: "التوصيات", path: "/trade-center", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/20", iconColor: "text-amber-400" },
    { icon: ScanLine, label: "تحليل الشارت", path: "/chart-vision", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/20", iconColor: "text-blue-400" },
    { icon: BookOpen, label: "سجل الصفقات", path: "/trade-journal", gradient: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
    { icon: Calculator, label: "الحاسبة", path: "/risk-calculator", gradient: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/20", iconColor: "text-violet-400" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-3 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* ═══ WELCOME + MARKET PULSE HERO ═══ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(220, 60%, 20%, 0.4) 50%, hsla(190, 100%, 50%, 0.06) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.1)",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsla(43,100%,50%,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsla(190,100%,50%,0.3) 0%, transparent 40%)"
        }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">مرحباً بك في</p>
              <h1 className="text-lg font-bold bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Nexus Central
              </h1>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/50 border border-border/20">
              <div className="live-dot" />
              <span className="text-[9px] font-mono text-muted-foreground">LIVE</span>
            </div>
          </div>

          {/* 3 Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate("/markets")}
              className="rounded-xl p-2.5 text-center bg-card/40 border border-border/10 hover:bg-card/60 transition-all active:scale-95"
            >
              <Gauge className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className={cn(
                "text-base font-mono font-bold",
                marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-primary"
              )}>
                {marketPulse.index}%
              </p>
              <p className="text-[8px] font-mono text-muted-foreground">نبض السوق</p>
            </button>
            <button
              onClick={() => navigate("/trade-center")}
              className="rounded-xl p-2.5 text-center bg-card/40 border border-border/10 hover:bg-card/60 transition-all active:scale-95"
            >
              <Activity className="w-4 h-4 mx-auto mb-1 text-success" />
              <p className="text-base font-mono font-bold text-success">{activeSignalsCount}</p>
              <p className="text-[8px] font-mono text-muted-foreground">إشارة نشطة</p>
            </button>
            <button
              onClick={() => navigate("/goal-planner")}
              className="rounded-xl p-2.5 text-center bg-card/40 border border-border/10 hover:bg-card/60 transition-all active:scale-95"
            >
              <Target className="w-4 h-4 mx-auto mb-1 text-accent" />
              <p className="text-base font-mono font-bold text-accent">{stats ? `${stats.progress.toFixed(0)}%` : "0%"}</p>
              <p className="text-[8px] font-mono text-muted-foreground">تقدّم الثروة</p>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ QUICK TOOLS ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
        {quickTools.map((t, i) => (
          <motion.button
            key={t.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(t.path)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl border bg-gradient-to-b transition-all hover:brightness-125 active:scale-95",
              t.gradient, t.border
            )}
          >
            <t.icon className={cn("w-5 h-5", t.iconColor)} />
            <span className="text-[9px] font-mono font-bold text-foreground">{t.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ═══ HOT AI SIGNALS ═══ */}
      {hotSignals.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-destructive" />
              <span className="bg-gradient-to-l from-red-400 to-orange-400 bg-clip-text text-transparent font-bold">توصيات ساخنة</span>
            </p>
            <button onClick={() => navigate("/trade-center")} className="text-[10px] font-mono text-primary flex items-center gap-0.5 hover:underline">
              الكل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            {hotSignals.map((signal, idx) => (
              <motion.div
                key={signal.pair}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => navigate(`/asset/${encodeURIComponent(signal.pair)}`)}
                className="rounded-xl p-3 cursor-pointer hover:brightness-110 transition-all active:scale-[0.98]"
                style={{
                  background: signal.direction === "صعودي"
                    ? "linear-gradient(135deg, hsla(120, 60%, 40%, 0.08) 0%, hsla(120, 60%, 40%, 0.02) 100%)"
                    : "linear-gradient(135deg, hsla(0, 60%, 40%, 0.08) 0%, hsla(0, 60%, 40%, 0.02) 100%)",
                  border: `1px solid ${signal.direction === "صعودي" ? "hsla(120, 60%, 40%, 0.15)" : "hsla(0, 60%, 40%, 0.15)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-card/60 border border-border/10 flex items-center justify-center">
                      <span className="text-lg">{signal.icon}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{signal.pair}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{signal.timeFrame} • {signal.risk}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold",
                      signal.direction === "صعودي"
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    )}>
                      {signal.direction === "صعودي" ? "↑ شراء" : "↓ بيع"}
                    </span>
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-[12px] border",
                      signal.confidence >= 85 ? "bg-success/10 text-success border-success/20" :
                      signal.confidence >= 70 ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-warning/10 text-warning border-warning/20"
                    )}>
                      {signal.confidence}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ TOP MOVERS - Gainers & Losers ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-warning" /> أبرز التحركات
          </p>
          <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Gainers */}
          <div className="rounded-xl p-3 space-y-2" style={{ background: "hsla(120, 60%, 40%, 0.04)", border: "1px solid hsla(120, 60%, 40%, 0.1)" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-[9px] font-mono text-success font-bold uppercase tracking-wider">الأكثر ارتفاعاً</span>
            </div>
            {topGainers.map((a) => (
              <button
                key={a.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(a.pair)}`)}
                className="flex items-center gap-2 w-full py-1.5 hover:bg-success/5 rounded-lg transition-colors"
              >
                <AssetLogo pair={a.pair} icon={a.icon} category={a.category} />
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10px] font-mono font-bold truncate">{a.pair.replace("/USDT", "")}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-success tabular-nums">+{a.change}%</span>
              </button>
            ))}
          </div>
          {/* Losers */}
          <div className="rounded-xl p-3 space-y-2" style={{ background: "hsla(0, 60%, 40%, 0.04)", border: "1px solid hsla(0, 60%, 40%, 0.1)" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3 h-3 text-destructive" />
              <span className="text-[9px] font-mono text-destructive font-bold uppercase tracking-wider">الأكثر انخفاضاً</span>
            </div>
            {topLosers.map((a) => (
              <button
                key={a.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(a.pair)}`)}
                className="flex items-center gap-2 w-full py-1.5 hover:bg-destructive/5 rounded-lg transition-colors"
              >
                <AssetLogo pair={a.pair} icon={a.icon} category={a.category} />
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10px] font-mono font-bold truncate">{a.pair.replace("/USDT", "")}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-destructive tabular-nums">{a.change}%</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ CRYPTO MARKET CAROUSEL ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Bitcoin className="w-3.5 h-3.5 text-amber-400" /> سوق الكريبتو
          </p>
          <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {cryptoAssets.map((asset) => (
              <div
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className="rounded-xl px-3 py-2.5 cursor-pointer hover:brightness-110 transition-all active:scale-[0.98] min-w-[130px]"
                style={{ background: "hsla(220, 20%, 12%, 0.6)", border: "1px solid hsla(43, 100%, 50%, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AssetLogo pair={asset.pair} icon={asset.icon} category={asset.category} />
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono font-bold block truncate">{asset.pair.replace("/USDT", "")}</span>
                    <span className="text-[8px] font-mono text-muted-foreground">USDT</span>
                  </div>
                </div>
                <MiniChart data={asset.sparkline} up={asset.up} width={105} height={26} />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                  <span className={cn("text-[10px] font-mono font-bold tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ FOREX MARKET CAROUSEL ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> سوق الفوركس
          </p>
          <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {forexAssets.map((asset) => (
              <div
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className="rounded-xl px-3 py-2.5 cursor-pointer hover:brightness-110 transition-all active:scale-[0.98] min-w-[130px]"
                style={{ background: "hsla(220, 20%, 12%, 0.6)", border: "1px solid hsla(190, 100%, 50%, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AssetLogo pair={asset.pair} icon={asset.icon} category={asset.category} />
                  <span className="text-[11px] font-mono font-bold truncate">{asset.pair}</span>
                </div>
                <MiniChart data={asset.sparkline} up={asset.up} width={105} height={26} />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                  <span className={cn("text-[10px] font-mono font-bold tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ DISCIPLINE + GROWTH PATH ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        {/* Discipline Score */}
        <button
          onClick={() => navigate("/challenges")}
          className="rounded-xl p-3 text-right hover:brightness-110 transition-all active:scale-[0.98]"
          style={{ background: "hsla(190, 100%, 50%, 0.05)", border: "1px solid hsla(190, 100%, 50%, 0.1)" }}
        >
          <Shield className="w-5 h-5 text-primary mb-2" />
          <p className={cn(
            "text-xl font-mono font-bold",
            (latestScore?.score ?? 50) >= 70 ? "text-success" : (latestScore?.score ?? 50) >= 40 ? "text-warning" : "text-destructive"
          )}>
            {latestScore?.score ?? 50}<span className="text-[10px] text-muted-foreground">/100</span>
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">درجة الانضباط</p>
          <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${latestScore?.score ?? 50}%` }} />
          </div>
        </button>

        {/* Growth Path */}
        <button
          onClick={() => navigate("/goal-planner")}
          className="rounded-xl p-3 text-right hover:brightness-110 transition-all active:scale-[0.98]"
          style={{ background: "hsla(43, 100%, 50%, 0.05)", border: "1px solid hsla(43, 100%, 50%, 0.1)" }}
        >
          <Target className="w-5 h-5 text-accent mb-2" />
          {goal && stats ? (
            <>
              <p className="text-xl font-mono font-bold text-accent">
                {stats.progress.toFixed(0)}%
              </p>
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5">مسار النمو</p>
              <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(stats.progress, 100)}%` }} />
              </div>
            </>
          ) : (
            <>
              <p className="text-[11px] font-mono font-bold text-foreground">ابدأ مسارك</p>
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5">مسار النمو المالي</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-accent" />
                <span className="text-[8px] font-mono text-accent">اضغط للبدء</span>
              </div>
            </>
          )}
        </button>
      </motion.div>

      {/* ═══ ACTIVE TRADES ═══ */}
      {activeTrades.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" /> صفقات مفتوحة
              <span className="bg-primary/15 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-md">{activeTrades.length}</span>
            </p>
            <button onClick={() => navigate("/trade-journal")} className="text-[10px] font-mono text-primary flex items-center gap-0.5 hover:underline">
              السجل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            {activeTrades.slice(0, 3).map((trade: any) => (
              <div
                key={trade.id}
                onClick={() => navigate("/trade-journal")}
                className="rounded-xl p-3 cursor-pointer hover:brightness-110 transition-all"
                style={{ background: "hsla(220, 20%, 12%, 0.5)", border: "1px solid hsla(220, 40%, 40%, 0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      trade.direction === "long" ? "bg-success/15" : "bg-destructive/15"
                    )}>
                      {trade.direction === "long"
                        ? <TrendingUp className="w-4 h-4 text-success" />
                        : <TrendingDown className="w-4 h-4 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[8px] font-mono text-muted-foreground">
                        {trade.direction === "long" ? "شراء" : "بيع"} • {formatPrice(trade.entry_price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    {trade.take_profit && (
                      <p className="text-[9px] font-mono text-success">TP: {trade.take_profit}</p>
                    )}
                    {trade.stop_loss && (
                      <p className="text-[9px] font-mono text-destructive">SL: {trade.stop_loss}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ INTELLIGENCE CENTER ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" /> مركز الذكاء
        </p>
        <MorningBriefCard />
        <AICoachTip />
      </motion.div>

      {/* ═══ FAVORITES ═══ */}
      {isLoggedIn && favoriteAssets.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">المفضلة</span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "hsla(220, 20%, 12%, 0.5)", border: "1px solid hsla(43, 100%, 50%, 0.06)" }}>
            {favoriteAssets.slice(0, 5).map((asset, i) => (
              <div
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 hover:bg-secondary/20 cursor-pointer transition-colors",
                  i < favoriteAssets.length - 1 && "border-b border-border/5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <AssetLogo pair={asset.pair} icon={asset.icon} category={asset.category} />
                  <span className="text-[11px] font-mono font-bold">{asset.pair}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MiniChart data={asset.sparkline} up={asset.up} width={40} height={16} />
                  <span className="text-[10px] font-mono tabular-nums">{formatPrice(asset.price)}</span>
                  <span className={cn("text-[10px] font-mono font-bold tabular-nums min-w-[42px] text-left", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ MORE TOOLS ROW ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
        {[
          { icon: Crown, label: "التحديات", path: "/challenges", color: "text-warning", bg: "bg-warning/8", border: "border-warning/15" },
          { icon: Brain, label: "الذكاء", path: "/nexus-brain", color: "text-primary", bg: "bg-primary/8", border: "border-primary/15" },
          { icon: Sun, label: "الملخص", path: "/morning-brief", color: "text-amber-400", bg: "bg-amber-400/8", border: "border-amber-400/15" },
          { icon: Eye, label: "الأكاديمية", path: "/academy", color: "text-accent", bg: "bg-accent/8", border: "border-accent/15" },
        ].map((t) => (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all hover:brightness-125 active:scale-95",
              t.bg, t.border
            )}
          >
            <t.icon className={cn("w-4.5 h-4.5", t.color)} />
            <span className="text-[9px] font-mono font-bold text-foreground">{t.label}</span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
