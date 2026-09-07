import { motion } from "framer-motion";
import { ChevronLeft, Sun, AlertTriangle } from "lucide-react";
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

      {/* ═══ MARKET OVERVIEW ═══ */}
      <motion.section variants={fade} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="nx-section">نظرة على السوق</h2>
          <button onClick={() => navigate("/markets")} className="nx-btn-text">
            الأسواق <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {overview.map((a) => (
            <button
              key={a!.pair}
              onClick={() => navigate(`/asset/${encodeURIComponent(a!.pair)}`)}
              className="nx-card !p-3 min-w-0 h-[142px] text-center flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <AssetLogo pair={a!.pair} icon={a!.icon} category={a!.category} size={32} className="mx-auto" />
              <p className="font-mono text-[14px] font-bold nx-ltr truncate w-full">{a!.pair.replace("/USDT", "")}</p>
              <p className="font-mono text-[14px] font-semibold tabular-nums nx-ltr text-foreground truncate w-full">
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

      {/* ═══ DAILY INTELLIGENCE (LIVE) ═══ */}
      <motion.section variants={fade} className="nx-card space-y-4">
        <div className="flex items-center gap-2.5">
          <Sun className="w-5 h-5 text-primary" strokeWidth={1.8} />
          <h2 className="nx-card-title">إحاطة NEXUS اليومية</h2>
        </div>
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
            <p className="nx-meta">ميل الكريبتو</p>
            <p className={cn(
              "font-mono text-lg font-bold tabular-nums",
              pulse.crypto >= 55 ? "text-success" : pulse.crypto >= 45 ? "text-warning" : "text-destructive"
            )}>{pulse.crypto}%</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
            <p className="nx-meta">ميل الفوركس</p>
            <p className={cn(
              "font-mono text-lg font-bold tabular-nums",
              pulse.forex >= 55 ? "text-success" : pulse.forex >= 45 ? "text-warning" : "text-destructive"
            )}>{pulse.forex}%</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
            <p className="nx-meta">الأكثر حركة</p>
            <p className="font-mono text-[14px] font-bold nx-ltr truncate">
              {pulse.topMover ? pulse.topMover.pair.replace("/USDT", "") : "—"}
            </p>
            {pulse.topMover && (
              <p className={cn(
                "font-mono text-[13px] font-semibold tabular-nums nx-ltr",
                pulse.topMover.up ? "text-success" : "text-destructive"
              )}>
                {pulse.topMover.up ? "+" : ""}{pulse.topMover.change}%
              </p>
            )}
          </div>
        </div>
        <button onClick={() => navigate("/morning-brief")} className="nx-btn-secondary w-full">
          الاتجاهات ومستويات الدعم والمقاومة
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
