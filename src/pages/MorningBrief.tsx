import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Lightbulb, Loader2, BarChart3, Activity, ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AssetLogo from "@/components/shared/AssetLogo";

interface MarketRow {
  pair: string;
  category: "كريبتو" | "فوركس";
  price: number;
  change: number;
  trend: "صعودي" | "هبوطي" | "عرضي";
  strength: number;
  rsi: number;
  support: number;
  resistance: number;
  distanceToSupport: number;
  distanceToResistance: number;
  source: string;
  note?: string | null;
}

interface BriefData {
  generatedAt?: string;
  date?: string;
  markets?: MarketRow[];
  sentiment?: {
    crypto?: { score: number; label: string } | null;
    forex?: { score: number; label: string } | null;
  };
  marketOverview?: string | null;
  riskAlerts?: { alert: string; severity: string }[];
  dailyTip?: string | null;
  focusAssets?: string[];
  error?: string;
}

const trendMeta = (t: MarketRow["trend"]) =>
  t === "صعودي"
    ? { icon: TrendingUp, cls: "text-success" }
    : t === "هبوطي"
    ? { icon: TrendingDown, cls: "text-destructive" }
    : { icon: Minus, cls: "text-muted-foreground" };

const MorningBrief = () => {
  const navigate = useNavigate();
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrief = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("morning-brief");
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setBrief(data);
    } catch {
      toast.error("تعذر تحميل بيانات السوق. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrief(); }, [fetchBrief]);

  const sentimentColor = (score: number) =>
    score >= 65 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

  const crypto = brief?.markets?.filter((m) => m.category === "كريبتو") ?? [];
  const forex = brief?.markets?.filter((m) => m.category === "فوركس") ?? [];

  const renderGroup = (title: string, rows: MarketRow[]) =>
    rows.length > 0 && (
      <section className="space-y-3">
        <h2 className="nx-section">{title}</h2>
        <div className="space-y-2.5">
          {rows.map((m) => {
            const T = trendMeta(m.trend);
            return (
              <button
                key={m.pair}
                onClick={() => navigate(`/asset/${encodeURIComponent(m.pair)}`)}
                className="nx-card w-full text-right space-y-3 active:scale-[0.995] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <AssetLogo pair={m.pair} icon="" category={m.category} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-[15px] nx-ltr">{m.pair.replace("/USDT", "")}</p>
                    <p className="nx-meta">{m.source}</p>
                  </div>
                  <div className="text-left" dir="ltr">
                    <p className="font-mono font-semibold text-[15px] tabular-nums">{m.price}</p>
                    <p className={cn(
                      "font-mono text-[13px] font-semibold tabular-nums",
                      m.change >= 0 ? "text-success" : "text-destructive",
                    )}>
                      {m.change >= 0 ? "+" : ""}{m.change}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="nx-meta mb-0.5">الاتجاه</p>
                    <p className={cn("text-[13px] font-semibold flex items-center justify-center gap-1", T.cls)}>
                      <T.icon className="w-3.5 h-3.5" />{m.trend}
                    </p>
                  </div>
                  <div>
                    <p className="nx-meta mb-0.5">RSI</p>
                    <p className={cn(
                      "font-mono text-[13px] font-semibold tabular-nums",
                      m.rsi >= 70 ? "text-destructive" : m.rsi <= 30 ? "text-success" : "text-foreground",
                    )}>{m.rsi}</p>
                  </div>
                  <div>
                    <p className="nx-meta mb-0.5">دعم</p>
                    <p className="font-mono text-[13px] font-semibold tabular-nums nx-ltr text-success">{m.support}</p>
                  </div>
                  <div>
                    <p className="nx-meta mb-0.5">مقاومة</p>
                    <p className="font-mono text-[13px] font-semibold tabular-nums nx-ltr text-destructive">{m.resistance}</p>
                  </div>
                </div>

                <p className="nx-meta">
                  يبعد عن الدعم {m.distanceToSupport}% · عن المقاومة {m.distanceToResistance}%
                </p>

                {m.note && <p className="nx-body text-muted-foreground leading-relaxed">{m.note}</p>}

                <span className="nx-btn-text">فتح التحليل الكامل <ChevronLeft className="w-4 h-4" /></span>
              </button>
            );
          })}
        </div>
      </section>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nx-page">
      <header className="space-y-1">
        <h1 className="nx-section">الإحاطة اليومية الحية</h1>
        <p className="nx-meta">
          {brief?.generatedAt
            ? `آخر تحديث ${new Date(brief.generatedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })} — بيانات حقيقية من الكريبتو والفوركس`
            : "اتجاهات السوق ومستويات الدعم والمقاومة من بيانات حية"}
        </p>
      </header>

      {loading && (
        <div className="nx-card py-10 text-center space-y-2">
          <Loader2 className="w-7 h-7 mx-auto text-primary animate-spin" />
          <p className="nx-body text-muted-foreground">جارٍ قراءة السوق وحساب المستويات...</p>
        </div>
      )}

      {!loading && brief && (
        <>
          {brief.marketOverview && (
            <section className="nx-card space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="nx-card-title">حالة السوق الآن</h2>
              </div>
              <p className="nx-body text-muted-foreground leading-relaxed">{brief.marketOverview}</p>
            </section>
          )}

          {(brief.sentiment?.crypto || brief.sentiment?.forex) && (
            <section className="nx-card space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="nx-card-title">ميل السوق</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "كريبتو", data: brief.sentiment?.crypto },
                  { label: "فوركس", data: brief.sentiment?.forex },
                ].map((s) => s.data && (
                  <div key={s.label} className="rounded-xl border border-border/70 bg-secondary/30 p-3 text-center">
                    <p className="nx-meta">{s.label}</p>
                    <p className={cn("font-mono text-xl font-bold tabular-nums", sentimentColor(s.data.score))}>
                      {s.data.score}%
                    </p>
                    <p className="nx-meta">{s.data.label}</p>
                  </div>
                ))}
              </div>
              <p className="nx-meta">نسبة الأصول ذات الاتجاه الصاعد ضمن العينة المحسوبة.</p>
            </section>
          )}

          {renderGroup("الكريبتو", crypto)}
          {renderGroup("الفوركس", forex)}

          {brief.riskAlerts && brief.riskAlerts.length > 0 && (
            <section className="nx-card space-y-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="nx-card-title">تنبيهات المخاطر</h2>
              </div>
              {brief.riskAlerts.map((r, i) => (
                <p key={i} className={cn(
                  "nx-body leading-relaxed",
                  r.severity === "high" ? "text-destructive" : "text-muted-foreground",
                )}>• {r.alert}</p>
              ))}
            </section>
          )}

          {brief.dailyTip && (
            <section className="nx-card space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h2 className="nx-card-title">انضباط اليوم</h2>
              </div>
              <p className="nx-body text-muted-foreground leading-relaxed">{brief.dailyTip}</p>
            </section>
          )}

          <button onClick={fetchBrief} className="nx-btn-secondary w-full flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> تحديث البيانات
          </button>

          <div className="flex items-start gap-2 px-1">
            <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="nx-meta leading-relaxed">
              المستويات محسوبة من بيانات الأسعار الحقيقية لأغراض تعليمية فقط، وليست توصية استثمارية.
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MorningBrief;
