import { motion } from "framer-motion";
import {
  Zap, ChevronLeft, Gauge, Activity, Shield, TrendingUp,
  Crown, AlertTriangle, Calculator, BookOpen, ScanLine, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/useChallenges";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import MarketMovers from "@/components/dashboard/MarketMovers";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const { latestScore } = useChallenges();
  const { stats } = useGoalPlanner();

  const activeSignals = useMemo(() => signals.filter(s => s.confidence >= 70), [signals]);

  const marketPulse = useMemo(() => {
    if (signals.length === 0) return { index: 50, label: "محايد" };
    const bullish = signals.filter(s => s.direction === "صعودي").length;
    const index = Math.round((bullish / signals.length) * 100);
    const label = index >= 70 ? "صعودي قوي" : index >= 55 ? "صعودي" : index >= 45 ? "محايد" : index >= 30 ? "هبوطي" : "هبوطي قوي";
    return { index, label };
  }, [signals]);

  const wealthProgress = stats ? Math.round(stats.progress) : 36;

  const topSignals = useMemo(() => signals.slice(0, 3), [signals]);

  const quickAccess = [
    { icon: Calculator, label: "الحاسبة", path: "/risk-calculator", bg: "bg-primary/10", border: "border-primary/20", color: "text-primary" },
    { icon: BookOpen, label: "سجل الصفقات", path: "/trade-journal", bg: "bg-accent/10", border: "border-accent/20", color: "text-accent" },
    { icon: ScanLine, label: "تحليل الشارت", path: "/chart-vision", bg: "bg-primary/10", border: "border-primary/20", color: "text-primary" },
    { icon: Zap, label: "التوصيات", path: "/trade-center", bg: "bg-accent/10", border: "border-accent/20", color: "text-accent" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="px-4 pt-3 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* ═══ NEXUS CENTRAL CARD ═══ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-4 border border-border/20 bg-card/70 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">LIVE</span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">نظرة عامة</span>
        </div>
        <h2 className="text-xl font-bold text-center mb-4">
          <span className="text-gradient-gold">Nexus</span> Central
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: Gauge, label: "نبض السوق",
              value: `${marketPulse.index}%`,
              color: marketPulse.index >= 55 ? "text-primary" : marketPulse.index <= 45 ? "text-destructive" : "text-warning",
            },
            {
              icon: Activity, label: "إشارة نشطة",
              value: `${activeSignals.length}`,
              color: "text-primary",
            },
            {
              icon: TrendingUp, label: "تقدم الثروة",
              value: `${wealthProgress}%`,
              color: "text-accent",
            },
            {
              icon: Shield, label: "الانضباط",
              value: `${latestScore?.score ?? 50}`,
              color: (latestScore?.score ?? 50) >= 70 ? "text-primary" : (latestScore?.score ?? 50) >= 40 ? "text-warning" : "text-destructive",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-2.5 text-center border border-border/10 bg-secondary/30"
            >
              <p className={cn("text-lg font-mono font-bold flex items-center justify-center gap-1", item.color)}>
                {item.value}
                <item.icon className={cn("w-3.5 h-3.5", item.color)} />
              </p>
              <p className="text-[8px] font-mono text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ QUICK ACCESS GRID (4 buttons) ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2">
        {quickAccess.map((s, i) => (
          <motion.button
            key={s.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(s.path)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3.5 rounded-xl border transition-all hover:brightness-125 active:scale-95",
              s.bg, s.border
            )}
          >
            <s.icon className={cn("w-5 h-5", s.color)} />
            <span className="text-[10px] font-mono font-bold text-foreground leading-tight">{s.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ═══ UPGRADE BANNER ═══ */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate("/subscription")}
        className="w-full rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] hover:brightness-110"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(280, 80%, 60%, 0.06) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.12)",
        }}
      >
        <Crown className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="flex-1 text-right">
          <p className="text-[11px] font-mono font-bold">ترقية إلى Pro — تحليلات وتوصيات بلا حدود</p>
          <p className="text-[8px] font-mono text-muted-foreground">وصول كامل لجميع الميزات المتقدمة</p>
        </div>
        <ChevronLeft className="w-4 h-4 text-amber-400 shrink-0" />
      </motion.button>

      {/* ═══ HOT SIGNALS ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-destructive" />
            <span className="font-bold text-foreground">توصيات ساخنة</span>
          </p>
          <button onClick={() => navigate("/trade-center")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {topSignals.map((signal) => (
            <SignalCardCollapsible key={signal.pair} signal={signal} />
          ))}
        </div>
      </motion.div>

      {/* ═══ MARKET MOVERS ═══ */}
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-accent" />
            <span className="font-bold text-foreground">أبرز التحركات</span>
          </p>
          <button onClick={() => navigate("/trade-center")} className="text-[9px] font-mono text-primary flex items-center gap-0.5 hover:underline">
            الأسواق <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <MarketMovers />
      </motion.div>

      {/* ═══ RISK DISCLAIMER ═══ */}
      <motion.div variants={fadeUp} className="rounded-xl p-3 border border-warning/10">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <p className="text-[8px] font-mono text-muted-foreground/70 leading-relaxed">
            جميع البيانات والتوصيات لأغراض تعليمية فقط. التداول ينطوي على مخاطر عالية. لا تتداول بأموال لا يمكنك تحمّل خسارتها.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
