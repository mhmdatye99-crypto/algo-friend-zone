import { motion } from "framer-motion";
import { ChevronLeft, ScanLine, Sun, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import SignalCard from "@/components/signals/SignalCard";
import AssetLogo from "@/components/shared/AssetLogo";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const OVERVIEW_PAIRS = ["BTC/USDT", "ETH/USDT", "BNB/USDT"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { signals } = useSignals();
  const assets = useLivePrices();

  const topSignals = useMemo(
    () => [...signals].sort((a, b) => b.confidence - a.confidence).slice(0, 3),
    [signals]
  );

  const overview = useMemo(
    () => OVERVIEW_PAIRS.map((p) => assets.find((a) => a.pair === p)).filter(Boolean),
    [assets]
  );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="nx-page"
    >
      {/* ═══ HERO — AI CHART ANALYSIS ═══ */}
      <motion.section variants={fade} className="nx-card-premium space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
            <ScanLine className="w-6 h-6 text-primary" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="nx-section">تحليل الشارت بالذكاء الاصطناعي</h1>
            <p className="nx-body text-[15px] text-muted-foreground mt-1">
              ارفع صورة الشارت واحصل على تحليل منظم للسوق.
            </p>
          </div>
        </div>
        <button onClick={() => navigate("/chart-analysis")} className="nx-btn-primary w-full">
          تحليل شارت جديد
        </button>
      </motion.section>

      {/* ═══ MARKET OVERVIEW ═══ */}
      <motion.section variants={fade} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="nx-section">نظرة على السوق</h2>
          <button onClick={() => navigate("/markets")} className="nx-btn-text">
            الأسواق <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {overview.map((a) => (
            <button
              key={a!.pair}
              onClick={() => navigate(`/asset/${encodeURIComponent(a!.pair)}`)}
              className="nx-card !p-3 text-center space-y-2 active:scale-[0.98] transition-transform"
            >
              <AssetLogo pair={a!.pair} icon={a!.icon} category={a!.category} size={32} className="mx-auto" />
              <p className="font-mono text-[14px] font-bold nx-ltr">{a!.pair.replace("/USDT", "")}</p>
              <p className="font-mono text-[14px] font-semibold tabular-nums nx-ltr text-foreground">
                {formatPrice(a!.price)}
              </p>
              <p
                className={cn(
                  "font-mono text-[13px] font-semibold tabular-nums nx-ltr",
                  a!.up ? "text-success" : "text-destructive"
                )}
              >
                {a!.up ? "+" : ""}
                {a!.change}%
              </p>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ═══ NEXUS SIGNALS ═══ */}
      {topSignals.length > 0 && (
        <motion.section variants={fade} className="space-y-3">
          <h2 className="nx-section">أقوى الإشارات</h2>
          <div className="space-y-3">
            {topSignals.map((s) => (
              <SignalCard key={s.pair} signal={s} variant="compact" onOpen={() => navigate("/signals")} />
            ))}
          </div>
          <button onClick={() => navigate("/signals")} className="nx-btn-secondary w-full">
            عرض جميع الإشارات
          </button>
        </motion.section>
      )}

      {/* ═══ DAILY INTELLIGENCE ═══ */}
      <motion.section variants={fade} className="nx-card space-y-4">
        <div className="flex items-center gap-2.5">
          <Sun className="w-5 h-5 text-primary" strokeWidth={1.8} />
          <h2 className="nx-card-title">إحاطة NEXUS اليومية</h2>
        </div>
        <p className="nx-body text-muted-foreground">
          ملخص يومي للسيولة والاتجاه العام ومستويات التقلب عبر أهم الأسواق.
        </p>
        <button onClick={() => navigate("/morning-brief")} className="nx-btn-secondary w-full">
          قراءة الإحاطة
        </button>
      </motion.section>

      {/* ═══ DISCLAIMER ═══ */}
      <motion.div variants={fade} className="flex items-start gap-2 px-1">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="nx-meta leading-relaxed">
          جميع البيانات والتوصيات لأغراض تعليمية فقط. التداول ينطوي على مخاطر عالية.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
