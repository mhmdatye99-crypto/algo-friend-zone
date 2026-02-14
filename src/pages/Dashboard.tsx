import { motion } from "framer-motion";
import {
  Zap, Brain, GraduationCap, Target, AlertTriangle,
  TrendingUp, TrendingDown, Star, ChevronLeft, BarChart3, Gauge,
  Bitcoin, DollarSign, LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import MiniChart from "@/components/MiniChart";
import { useFavorites } from "@/hooks/useFavorites";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import GaugeChart from "@/components/dashboard/GaugeChart";
import AICoachTip from "@/components/dashboard/AICoachTip";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const marketPulse = {
  index: 73,
  label: "صعودي معتدل",
  subMetrics: [
    { label: "تدفق المؤسسات", value: 81, color: "text-success" },
    { label: "زخم التقنيات", value: 68, color: "text-primary" },
    { label: "معنويات التجزئة", value: 55, color: "text-warning" },
    { label: "تقلّب المخاطر", value: 42, color: "text-accent" },
  ],
};

const analysisCards = [
  {
    id: "crypto",
    title: "تحليل كريبتو",
    subtitle: "BTC · ETH · SOL",
    icon: Bitcoin,
    path: "/signals",
    glowColor: "43, 100%, 50%",
    borderColor: "hsla(43, 100%, 50%, 0.18)",
    bgGrad: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.1) 0%, hsla(30, 80%, 30%, 0.05) 100%)",
    iconColor: "text-primary",
    badge: "🔥",
  },
  {
    id: "forex",
    title: "تحليل فوركس",
    subtitle: "EUR · GBP · JPY",
    icon: DollarSign,
    path: "/signals",
    glowColor: "190, 100%, 50%",
    borderColor: "hsla(190, 100%, 50%, 0.18)",
    bgGrad: "linear-gradient(135deg, hsla(190, 100%, 50%, 0.1) 0%, hsla(200, 80%, 30%, 0.05) 100%)",
    iconColor: "text-accent",
    badge: "📊",
  },
];

const hubCards = [
  {
    id: "intelligence",
    title: "نبض السوق",
    subtitle: "تحليلات وبيانات مباشرة",
    icon: BarChart3,
    path: "/markets",
    glowColor: "190, 100%, 50%",
    borderColor: "hsla(190, 100%, 50%, 0.15)",
    bgGrad: "linear-gradient(135deg, hsla(190, 100%, 50%, 0.08) 0%, hsla(190, 80%, 30%, 0.04) 100%)",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
  },
  {
    id: "academy",
    title: "الأكاديمية الكمّية",
    subtitle: "وحدات تعلم متقدمة",
    icon: GraduationCap,
    path: "/academy",
    glowColor: "300, 80%, 50%",
    borderColor: "hsla(300, 80%, 50%, 0.15)",
    bgGrad: "linear-gradient(135deg, hsla(300, 80%, 50%, 0.08) 0%, hsla(300, 60%, 30%, 0.04) 100%)",
    iconBg: "bg-fuchsia-500/15",
    iconColor: "text-fuchsia-400",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, isLoggedIn } = useFavorites();
  const { goal, stats } = useGoalPlanner();

  const favoriteAssets = assets.filter(a => favorites.has(a.pair));
  const trendingUp = useMemo(() => [...assets].sort((a, b) => b.change - a.change).slice(0, 6), [assets]);
  const trendingDown = useMemo(() => [...assets].sort((a, b) => a.change - b.change).slice(0, 6), [assets]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="px-5 pt-4 pb-28 space-y-6 max-w-lg mx-auto"
    >
      {/* ═══ Wealth Path (if active) ═══ */}
      {goal && stats && (
        <motion.div variants={fadeUp}>
          <div
            onClick={() => navigate("/goal-planner")}
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer transition-all hover:brightness-110"
            style={{ background: "hsla(240, 15%, 3.5%, 0.5)", border: "1px solid hsla(43, 100%, 50%, 0.1)" }}
          >
            <Target className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">مسار الثروة</span>
                <span className="text-[11px] font-mono font-bold text-primary">{stats.progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))", boxShadow: "0 0 8px hsl(43 100% 50% / 0.4)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1.5 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-mono text-muted-foreground">
                <span>${goal.current_balance.toLocaleString()}</span>
                <span>${goal.target_goal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {!stats.todayLogged && (
            <motion.div
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-[10px] bg-warning/10 border border-warning/20"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
              <span className="text-[10px] font-mono text-warning font-bold">
                {stats.missedDays > 0 ? `⚠ فاتتك ${stats.missedDays} أيام — سجّل أرباحك` : "لم تسجّل أرباح اليوم"}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ═══ Analysis Cards — 2 Columns ═══ */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
          <LineChart className="w-3.5 h-3.5 text-primary" /> ابدأ التحليل
        </p>
        <div className="grid grid-cols-2 gap-3">
          {analysisCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                onClick={() => navigate(card.path)}
                className="relative rounded-[14px] p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                style={{
                  background: card.bgGrad,
                  border: `1px solid ${card.borderColor}`,
                  boxShadow: `0 4px 20px hsla(${card.glowColor}, 0.1)`,
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.1, duration: 0.35 }}
              >
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-25 blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, hsla(${card.glowColor}, 0.5), transparent 70%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center bg-secondary/60 border border-border/20")}
                      style={{ boxShadow: `0 0 12px hsla(${card.glowColor}, 0.15)` }}
                    >
                      <Icon className={cn("w-5 h-5", card.iconColor)} />
                    </div>
                    <span className="text-lg">{card.badge}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-foreground">{card.title}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{card.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ Hub Cards ═══ */}
      <motion.div variants={fadeUp} className="space-y-3">
        {hubCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="relative rounded-[14px] p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
              style={{
                background: card.bgGrad,
                border: `1px solid ${card.borderColor}`,
                boxShadow: `0 4px 24px hsla(${card.glowColor}, 0.08), inset 0 1px 0 hsla(${card.glowColor}, 0.06)`,
              }}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + idx * 0.1, duration: 0.4 }}
            >
              <div
                className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle, hsla(${card.glowColor}, 0.4), transparent 70%)` }}
              />
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn("w-12 h-12 rounded-[12px] flex items-center justify-center", card.iconBg)}
                  style={{ boxShadow: `0 0 16px hsla(${card.glowColor}, 0.15)` }}
                >
                  <Icon className={cn("w-6 h-6", card.iconColor)} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-bold text-foreground">{card.title}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{card.subtitle}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground/40" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ═══ AI Coach Tip ═══ */}
      <motion.div variants={fadeUp}>
        <AICoachTip />
      </motion.div>

      {/* ═══ Trending Pairs — Horizontal Scroll ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-success" /> الأكثر صعوداً
          </p>
          <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
          <div className="flex gap-2.5 min-w-max">
            {trendingUp.map((asset) => (
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
                  <span className="text-[10px] font-mono font-bold text-success">+{asset.change}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ Trending Down — Horizontal Scroll ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-destructive" /> الأكثر هبوطاً
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
          <div className="flex gap-2.5 min-w-max">
            {trendingDown.map((asset) => (
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
                  <span className="text-[10px] font-mono font-bold text-destructive">{asset.change}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ Market Pulse ═══ */}
      <motion.div variants={fadeUp} className="glass rounded-[14px] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">نبض الذكاء السوقي</p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            مباشر
          </span>
        </div>
        <GaugeChart value={marketPulse.index} label={marketPulse.label} />
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {marketPulse.subMetrics.map((m, i) => (
            <div key={i} className="bg-secondary/40 rounded-[10px] px-2 py-1.5 text-center border border-border/10">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider leading-tight mb-0.5">{m.label}</p>
              <p className={cn("text-sm font-bold font-mono", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ Favorites ═══ */}
      {isLoggedIn && favoriteAssets.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" /> المفضلة
            </p>
            <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </button>
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
                  <span className={cn("text-[10px] font-mono font-medium tabular-nums price-flash", asset.up ? "text-success" : "text-destructive")}>
                    {asset.up ? "+" : ""}{asset.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
