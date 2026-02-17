import { motion } from "framer-motion";
import {
  Zap, Target, TrendingUp, TrendingDown, Star, ChevronLeft, Gauge,
  Bitcoin, DollarSign, Activity, Brain, Briefcase, Shield,
  Flame, ScanLine, BookOpen, Calculator, Crown, Sun, Eye, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useLivePrices, formatPrice, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP } from "@/hooks/useLivePrices";
import MiniChart from "@/components/MiniChart";
import { useFavorites } from "@/hooks/useFavorites";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import AICoachTip from "@/components/dashboard/AICoachTip";
import MorningBriefCard from "@/components/dashboard/MorningBriefCard";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChallenges } from "@/hooks/useChallenges";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const AssetLogo = ({ pair, icon, category }: { pair: string; icon: string; category: string }) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];
  if (category === "كريبتو" && logoUrl) {
    return <img src={logoUrl} alt={pair} className="w-6 h-6 rounded-full" />;
  }
  if (category === "فوركس" && flags) {
    return <span className="text-sm leading-none">{flags}</span>;
  }
  return <span className="text-sm">{icon}</span>;
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
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="px-4 pt-3 pb-28 space-y-3 max-w-lg mx-auto"
    >
      {/* ═══ PERFORMANCE OVERVIEW ═══ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-3.5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.06) 0%, hsla(220, 60%, 20%, 0.35) 50%, hsla(190, 100%, 50%, 0.04) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.08)",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsla(43,100%,50%,0.4) 0%, transparent 50%)"
        }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">نظرة عامة</p>
              <h1 className="text-base font-bold bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Nexus Central
              </h1>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card/40 border border-border/15">
              <div className="live-dot" />
              <span className="text-[8px] font-mono text-muted-foreground">LIVE</span>
            </div>
          </div>

          {/* Unified Performance Row */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/markets")}
              className="flex-1 rounded-lg p-2 text-center bg-card/30 border border-border/8 hover:bg-card/50 transition-all active:scale-95"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Gauge className="w-3 h-3 text-primary" />
                <p className={cn(
                  "text-sm font-mono font-bold",
                  marketPulse.index >= 55 ? "text-success" : marketPulse.index <= 45 ? "text-destructive" : "text-primary"
                )}>
                  {marketPulse.index}%
                </p>
              </div>
              <p className="text-[7px] font-mono text-muted-foreground">نبض السوق</p>
            </button>
            <button
              onClick={() => navigate("/trade-center")}
              className="flex-1 rounded-lg p-2 text-center bg-card/30 border border-border/8 hover:bg-card/50 transition-all active:scale-95"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Activity className="w-3 h-3 text-success" />
                <p className="text-sm font-mono font-bold text-success">{activeSignalsCount}</p>
              </div>
              <p className="text-[7px] font-mono text-muted-foreground">إشارة نشطة</p>
            </button>
            <button
              onClick={() => navigate("/goal-planner")}
              className="flex-1 rounded-lg p-2 text-center bg-card/30 border border-border/8 hover:bg-card/50 transition-all active:scale-95"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Target className="w-3 h-3 text-accent" />
                <p className="text-sm font-mono font-bold text-accent">{stats ? `${stats.progress.toFixed(0)}%` : "0%"}</p>
              </div>
              <p className="text-[7px] font-mono text-muted-foreground">تقدّم الثروة</p>
            </button>
            <button
              onClick={() => navigate("/challenges")}
              className="flex-1 rounded-lg p-2 text-center bg-card/30 border border-border/8 hover:bg-card/50 transition-all active:scale-95"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Shield className="w-3 h-3 text-warning" />
                <p className={cn(
                  "text-sm font-mono font-bold",
                  (latestScore?.score ?? 50) >= 70 ? "text-success" : (latestScore?.score ?? 50) >= 40 ? "text-warning" : "text-destructive"
                )}>
                  {latestScore?.score ?? 50}
                </p>
              </div>
              <p className="text-[7px] font-mono text-muted-foreground">الانضباط</p>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ QUICK TOOLS ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-1.5">
        {quickTools.map((t, i) => (
          <motion.button
            key={t.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(t.path)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 rounded-xl border bg-gradient-to-b transition-all hover:brightness-125 active:scale-95",
              t.gradient, t.border
            )}
          >
            <t.icon className={cn("w-4.5 h-4.5", t.iconColor)} />
            <span className="text-[8px] font-mono font-bold text-foreground">{t.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ═══ UPGRADE BANNER ═══ */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate("/subscription")}
        className="w-full rounded-xl p-2.5 flex items-center gap-3 transition-all active:scale-[0.98] hover:brightness-110"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.1) 0%, hsla(280, 80%, 60%, 0.08) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.15)",
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/20 flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-[11px] font-mono font-bold text-foreground">ترقية إلى Pro — تحليلات وتوصيات بلا حدود</p>
          <p className="text-[9px] font-mono text-muted-foreground">وصول كامل لجميع الميزات المتقدمة</p>
        </div>
        <ChevronLeft className="w-4 h-4 text-amber-400 shrink-0" />
      </motion.button>

      {/* ═══ HOT AI SIGNALS ═══ */}
      {hotSignals.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-destructive" />
              <span className="bg-gradient-to-l from-red-400 to-orange-400 bg-clip-text text-transparent font-bold">توصيات ساخنة</span>
            </p>
            <button onClick={() => navigate("/trade-center")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
              الكل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {hotSignals.map((signal, idx) => (
              <motion.div
                key={signal.pair}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => navigate(`/asset/${encodeURIComponent(signal.pair)}`)}
                className="rounded-lg px-3 py-2 cursor-pointer hover:brightness-110 transition-all active:scale-[0.98]"
                style={{
                  background: signal.direction === "صعودي"
                    ? "linear-gradient(135deg, hsla(120, 60%, 40%, 0.06) 0%, hsla(120, 60%, 40%, 0.01) 100%)"
                    : "linear-gradient(135deg, hsla(0, 60%, 40%, 0.06) 0%, hsla(0, 60%, 40%, 0.01) 100%)",
                  border: `1px solid ${signal.direction === "صعودي" ? "hsla(120, 60%, 40%, 0.12)" : "hsla(0, 60%, 40%, 0.12)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-card/50 border border-border/10 flex items-center justify-center text-base">{signal.icon}</span>
                    <div>
                      <p className="text-[11px] font-mono font-bold">{signal.pair}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-muted-foreground">{signal.timeFrame}</span>
                        {signal.reasons.slice(0, 2).map((r, i) => (
                          <span key={i} className="text-[7px] font-mono bg-secondary/60 px-1 py-0.5 rounded text-muted-foreground">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-mono font-bold",
                      signal.direction === "صعودي"
                        ? "bg-success/12 text-success"
                        : "bg-destructive/12 text-destructive"
                    )}>
                      {signal.direction === "صعودي" ? "↑ شراء" : "↓ بيع"}
                    </span>
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] border",
                      signal.confidence >= 85 ? "bg-success/8 text-success border-success/15" :
                      signal.confidence >= 70 ? "bg-primary/8 text-primary border-primary/15" :
                      "bg-warning/8 text-warning border-warning/15"
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
      <motion.div variants={fadeUp} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-warning" /> أبرز التحركات
          </p>
          <button onClick={() => navigate("/markets")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg p-2.5 space-y-1" style={{ background: "hsla(120, 60%, 40%, 0.03)", border: "1px solid hsla(120, 60%, 40%, 0.08)" }}>
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-[8px] font-mono text-success font-bold uppercase tracking-wider">الأكثر ارتفاعاً</span>
            </div>
            {topGainers.map((a) => (
              <button
                key={a.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(a.pair)}`)}
                className="flex items-center gap-1.5 w-full py-1 hover:bg-success/5 rounded transition-colors"
              >
                <AssetLogo pair={a.pair} icon={a.icon} category={a.category} />
                <span className="text-[9px] font-mono font-bold flex-1 text-right truncate">{a.pair.replace("/USDT", "")}</span>
                <span className="text-[9px] font-mono font-bold text-success tabular-nums">+{a.change}%</span>
              </button>
            ))}
          </div>
          <div className="rounded-lg p-2.5 space-y-1" style={{ background: "hsla(0, 60%, 40%, 0.03)", border: "1px solid hsla(0, 60%, 40%, 0.08)" }}>
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingDown className="w-3 h-3 text-destructive" />
              <span className="text-[8px] font-mono text-destructive font-bold uppercase tracking-wider">الأكثر انخفاضاً</span>
            </div>
            {topLosers.map((a) => (
              <button
                key={a.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(a.pair)}`)}
                className="flex items-center gap-1.5 w-full py-1 hover:bg-destructive/5 rounded transition-colors"
              >
                <AssetLogo pair={a.pair} icon={a.icon} category={a.category} />
                <span className="text-[9px] font-mono font-bold flex-1 text-right truncate">{a.pair.replace("/USDT", "")}</span>
                <span className="text-[9px] font-mono font-bold text-destructive tabular-nums">{a.change}%</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ CRYPTO MARKET CAROUSEL ═══ */}
      <motion.div variants={fadeUp} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Bitcoin className="w-3 h-3 text-amber-400" /> سوق الكريبتو
          </p>
          <button onClick={() => navigate("/markets")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-1.5 min-w-max">
            {cryptoAssets.map((asset) => (
              <div
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className="rounded-lg px-2.5 py-2 cursor-pointer hover:brightness-110 transition-all active:scale-[0.98] min-w-[120px]"
                style={{ background: "hsla(220, 20%, 12%, 0.5)", border: "1px solid hsla(43, 100%, 50%, 0.06)" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AssetLogo pair={asset.pair} icon={asset.icon} category={asset.category} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold block truncate">{asset.pair.replace("/USDT", "")}</span>
                    <span className="text-[7px] font-mono text-muted-foreground">USDT</span>
                  </div>
                </div>
                <MiniChart data={asset.sparkline} up={asset.up} width={95} height={22} />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                  <span className={cn("text-[9px] font-mono font-bold tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ FOREX MARKET CAROUSEL ═══ */}
      <motion.div variants={fadeUp} className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-emerald-400" /> سوق الفوركس
          </p>
          <button onClick={() => navigate("/markets")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-1.5 min-w-max">
            {forexAssets.map((asset) => (
              <div
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className="rounded-lg px-2.5 py-2 cursor-pointer hover:brightness-110 transition-all active:scale-[0.98] min-w-[120px]"
                style={{ background: "hsla(220, 20%, 12%, 0.5)", border: "1px solid hsla(190, 100%, 50%, 0.06)" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AssetLogo pair={asset.pair} icon={asset.icon} category={asset.category} />
                  <span className="text-[10px] font-mono font-bold truncate">{asset.pair}</span>
                </div>
                <MiniChart data={asset.sparkline} up={asset.up} width={95} height={22} />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                  <span className={cn("text-[9px] font-mono font-bold tabular-nums", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ ACTIVE TRADES ═══ */}
      {activeTrades.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-primary" /> صفقات مفتوحة
              <span className="bg-primary/12 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-md">{activeTrades.length}</span>
            </p>
            <button onClick={() => navigate("/trade-journal")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
              السجل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {activeTrades.slice(0, 3).map((trade: any) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate("/trade-journal")}
                className="rounded-lg px-3 py-2 cursor-pointer hover:brightness-110 transition-all"
                style={{ background: "hsla(220, 20%, 12%, 0.4)", border: "1px solid hsla(220, 40%, 40%, 0.08)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      trade.direction === "long" ? "bg-success/12" : "bg-destructive/12"
                    )}>
                      {trade.direction === "long"
                        ? <TrendingUp className="w-3 h-3 text-success" />
                        : <TrendingDown className="w-3 h-3 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[7px] font-mono text-muted-foreground">
                        {trade.direction === "long" ? "شراء" : "بيع"} • {formatPrice(trade.entry_price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left flex gap-2">
                    {trade.take_profit && <span className="text-[8px] font-mono text-success">TP {trade.take_profit}</span>}
                    {trade.stop_loss && <span className="text-[8px] font-mono text-destructive">SL {trade.stop_loss}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ INTELLIGENCE CENTER ═══ */}
      <motion.div variants={fadeUp} className="space-y-1.5">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-0.5 flex items-center gap-1.5">
          <Brain className="w-3 h-3 text-primary" /> مركز الذكاء
        </p>
        <MorningBriefCard />
        <AICoachTip />
      </motion.div>

      {/* ═══ GROWTH PATH ═══ */}
      {goal && stats && (
        <motion.button
          variants={fadeUp}
          onClick={() => navigate("/goal-planner")}
          className="w-full rounded-xl p-3 text-right hover:brightness-110 transition-all active:scale-[0.98]"
          style={{ background: "hsla(43, 100%, 50%, 0.04)", border: "1px solid hsla(43, 100%, 50%, 0.08)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-muted-foreground">مسار النمو</span>
            </div>
            <span className="text-sm font-mono font-bold text-accent">{stats.progress.toFixed(0)}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.progress, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.button>
      )}

      {/* ═══ FAVORITES ═══ */}
      {isLoggedIn && favoriteAssets.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">المفضلة</span>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background: "hsla(220, 20%, 12%, 0.4)", border: "1px solid hsla(43, 100%, 50%, 0.05)" }}>
            {favoriteAssets.slice(0, 5).map((asset, i) => (
              <div
                key={asset.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 hover:bg-secondary/15 cursor-pointer transition-colors",
                  i < favoriteAssets.length - 1 && "border-b border-border/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <AssetLogo pair={asset.pair} icon={asset.icon} category={asset.category} />
                  <span className="text-[10px] font-mono font-bold">{asset.pair}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MiniChart data={asset.sparkline} up={asset.up} width={36} height={14} />
                  <span className="text-[9px] font-mono tabular-nums">{formatPrice(asset.price)}</span>
                  <span className={cn("text-[9px] font-mono font-bold tabular-nums min-w-[36px] text-left", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ MORE TOOLS ROW ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-1.5">
        {[
          { icon: Crown, label: "التحديات", path: "/challenges", color: "text-warning", bg: "bg-warning/6", border: "border-warning/12" },
          { icon: Brain, label: "الذكاء", path: "/nexus-brain", color: "text-primary", bg: "bg-primary/6", border: "border-primary/12" },
          { icon: Sun, label: "الملخص", path: "/morning-brief", color: "text-amber-400", bg: "bg-amber-400/6", border: "border-amber-400/12" },
          { icon: Eye, label: "الأكاديمية", path: "/academy", color: "text-accent", bg: "bg-accent/6", border: "border-accent/12" },
        ].map((t) => (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all hover:brightness-125 active:scale-95",
              t.bg, t.border
            )}
          >
            <t.icon className={cn("w-4 h-4", t.color)} />
            <span className="text-[8px] font-mono font-bold text-foreground">{t.label}</span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
