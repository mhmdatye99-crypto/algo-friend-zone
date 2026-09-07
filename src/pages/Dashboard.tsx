import { motion } from "framer-motion";
import {
  ChevronLeft, Camera, Zap, LineChart, Calculator,
  AlertTriangle, Activity, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartAlgorithms } from "@/hooks/useSmartAlgorithms";
import { usePortfolioSync } from "@/hooks/usePortfolioSync";
import { Progress } from "@/components/ui/progress";
import MarketMovers from "@/components/dashboard/MarketMovers";
import MorningBriefCard from "@/components/dashboard/MorningBriefCard";
import AICoachTip from "@/components/dashboard/AICoachTip";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const quickActions = [
  { icon: Camera, label: "تحليل الشارت", path: "/chart-analysis" },
  { icon: Zap, label: "الإشارات", path: "/signals" },
  { icon: LineChart, label: "الأسواق", path: "/markets" },
  { icon: Calculator, label: "حاسبة المخاطر", path: "/tools" },
];

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
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="nx-page"
    >
      {/* ═══ PORTFOLIO / ACCOUNT SUMMARY ═══ */}
      <motion.div variants={fade} className="nx-card-premium space-y-4">
        <div className="flex items-center justify-between">
          <p className="nx-label">الرصيد الإجمالي</p>
          {openTradesCount > 0 && (
            <span className="nx-badge-warn">
              <Activity className="w-3 h-3" />
              {openTradesCount} صفقة مفتوحة
            </span>
          )}
        </div>

        <p className="nx-num-lg nx-ltr">
          ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="nx-meta">محقق:</span>
            <span className={cn("nx-num nx-ltr text-[15px]", realizedPnl >= 0 ? "text-success" : "text-destructive")}>
              {realizedPnl >= 0 ? "+" : ""}${realizedPnl.toFixed(2)}
            </span>
          </div>
          {unrealizedPnl !== 0 && (
            <div className="flex items-center gap-1.5">
              <span className="nx-meta">غير محقق:</span>
              <span className={cn("nx-num nx-ltr text-[15px]", unrealizedPnl >= 0 ? "text-success" : "text-destructive")}>
                {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="nx-label">الهدف الشهري</p>
            <p className="nx-num text-[15px] text-primary">{Math.round(goalProgress)}%</p>
          </div>
          <Progress value={goalProgress} className="h-2 bg-secondary" />
          <div className="flex justify-between">
            <span className="nx-meta nx-ltr">${totalEquity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            <span className="nx-meta nx-ltr">${targetGoal.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* ═══ ملخص السوق ═══ */}
      <motion.div variants={fade} className="space-y-3">
        <h2 className="nx-section">ملخص السوق</h2>
        <MarketMovers />
      </motion.div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <motion.div variants={fade} className="grid grid-cols-4 gap-2.5">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="nx-tap flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97]"
          >
            <action.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-foreground text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={fade}>
        <AICoachTip />
      </motion.div>

      {/* ═══ فرص مختارة بواسطة NEXUS ═══ */}
      {topSignals.length > 0 && (
        <motion.div variants={fade} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="nx-section">فرص مختارة بواسطة NEXUS</h2>
            </div>
            <button onClick={() => navigate("/signals")} className="nx-tap flex items-center gap-0.5 text-[13px] font-medium text-primary">
              الكل <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topSignals.map((signal) => {
              const prob = signalProbabilities.get(signal.pair) ?? 50;
              const isLong = signal.direction === "صعودي";
              return (
                <button
                  key={signal.pair}
                  onClick={() => navigate("/signals")}
                  className="nx-card w-full text-right space-y-2.5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="nx-card-title">{signal.pair}</span>
                      <span className={isLong ? "nx-badge-long" : "nx-badge-short"}>
                        {isLong ? "LONG" : "SHORT"}
                      </span>
                    </div>
                    <span className={cn("nx-num nx-ltr text-[17px]", prob >= 65 ? "text-primary" : "text-muted-foreground")}>
                      {prob}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-secondary/60 py-1.5 text-center">
                      <p className="nx-meta text-[11px]">دخول</p>
                      <p className="nx-num nx-ltr text-[13px]">{signal.entry}</p>
                    </div>
                    <div className="rounded-lg bg-success/10 py-1.5 text-center">
                      <p className="text-[11px] font-normal text-success/80">هدف</p>
                      <p className="nx-num nx-ltr text-[13px] text-success">{signal.target1}</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 py-1.5 text-center">
                      <p className="text-[11px] font-normal text-destructive/80">وقف</p>
                      <p className="nx-num nx-ltr text-[13px] text-destructive">{signal.sl}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ الملخص الصباحي ═══ */}
      <motion.div variants={fade}>
        <MorningBriefCard />
      </motion.div>

      {/* ═══ DISCLAIMER ═══ */}
      <motion.div variants={fade} className="flex items-start gap-2 px-1">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="nx-meta leading-relaxed">
          جميع البيانات والتوصيات لأغراض تعليمية فقط. التداول ينطوي على مخاطر عالية.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
