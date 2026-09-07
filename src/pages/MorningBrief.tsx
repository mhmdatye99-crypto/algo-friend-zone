import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Clock, Lightbulb, Loader2, BarChart3,
  Shield, ArrowUpRight, ArrowDownRight, Crosshair, Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BriefData {
  date?: string;
  greeting?: string;
  marketOverview?: string;
  keyEvents?: { time: string; event: string; impact: string; assets: string[] }[];
  topOpportunities?: { pair: string; direction: string; reason: string; confidence: number }[];
  riskAlerts?: { alert: string; severity: string }[];
  sentiment?: {
    crypto?: { score: number; label: string };
    forex?: { score: number; label: string };
    commodities?: { score: number; label: string };
  };
  dailyTip?: string;
  focusAssets?: string[];
  error?: string;
}

const MorningBrief = () => {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("morning-brief");
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setLoading(false); return; }
      setBrief(data);
    } catch {
      toast.error("فشل تحميل الإحاطة. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const impactColor = (impact: string) =>
    impact === "high" ? "text-destructive bg-destructive/10 border-destructive/20" :
    impact === "medium" ? "text-warning bg-warning/10 border-warning/20" :
    "text-muted-foreground bg-secondary border-border/20";

  const sentimentColor = (score: number) =>
    score >= 65 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

  return (
    <motion.div
      className="px-4 pt-6 pb-28 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header — Private Desk Briefing */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center">
            <span className="text-[13px] font-black text-accent">X</span>
          </div>
          <div>
            <p className="text-[13px] uppercase tracking-[0.2em] text-accent font-mono font-bold">Private Desk Briefing</p>
            <h1 className="text-base font-bold">الإحاطة اليومية الخاصة</h1>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground font-mono leading-relaxed">
          تقرير مكتب التداول — تحليل مؤسسي للأسواق العالمية وفرص التمركز الاستراتيجي
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!brief && !loading && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-xl p-8 text-center border border-accent/10 bg-accent/3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-black text-accent">X</span>
              </div>
              <h3 className="text-sm font-bold font-mono mb-1">إحاطة مكتب التداول</h3>
              <p className="text-[13px] text-muted-foreground font-mono mb-4">
                تحليل شامل للبيئة السوقية · فرص التمركز · مخاطر الجلسة
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={fetchBrief}
                className="bg-accent text-accent-foreground px-6 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 mx-auto hover:bg-accent/90 transition-colors"
              >
                <Eye className="w-4 h-4" />
                توليد الإحاطة
              </motion.button>
            </div>

            <h3 className="text-[13px] font-bold uppercase tracking-wider mb-2 font-mono text-muted-foreground">محتويات الإحاطة</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: BarChart3, label: "البيئة السوقية" },
                { icon: Clock, label: "أحداث اقتصادية مؤثرة" },
                { icon: Crosshair, label: "فرص التمركز" },
                { icon: AlertTriangle, label: "تحذيرات المخاطر" },
                { icon: Activity, label: "معنويات مؤسسية" },
                { icon: Lightbulb, label: "توصية الجلسة" },
              ].map((item, i) => (
                <div key={i} className="rounded-lg p-3 flex items-center gap-2 border border-border/10 bg-card/50">
                  <item.icon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-[13px] font-mono text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-xl p-10 text-center border border-accent/10 bg-accent/3">
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-accent animate-spin" />
              <h3 className="text-sm font-bold font-mono mb-1">جارٍ إعداد الإحاطة...</h3>
              <p className="text-[13px] text-muted-foreground font-mono">
                تحليل مؤسسي للأسواق العالمية والتدفقات المالية
              </p>
            </div>
          </motion.div>
        )}

        {brief && !loading && (
          <motion.div
            key="brief"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Date + Greeting */}
            <div className="rounded-xl p-3 border border-accent/10 bg-accent/3">
              <p className="text-[13px] font-mono text-muted-foreground mb-0.5">{brief.date}</p>
              <p className="text-[13px] font-mono font-bold">{brief.greeting}</p>
            </div>

            {/* Market Overview */}
            <div className="rounded-xl p-3 border border-border/10 bg-card/60">
              <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-accent">
                <BarChart3 className="w-3 h-3" />
                البيئة السوقية
              </h3>
              <p className="text-[13px] text-muted-foreground font-mono leading-relaxed">{brief.marketOverview}</p>
            </div>

            {/* Institutional Sentiment */}
            {brief.sentiment && (
              <div className="rounded-xl p-3 border border-border/10 bg-card/60">
                <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 text-accent">
                  <Activity className="w-3 h-3" />
                  المعنويات المؤسسية
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "crypto", label: "أصول رقمية", data: brief.sentiment.crypto },
                    { key: "forex", label: "عملات", data: brief.sentiment.forex },
                    { key: "commodities", label: "سلع", data: brief.sentiment.commodities },
                  ].map((s) => s.data && (
                    <div key={s.key} className="bg-secondary/40 rounded-lg p-2 text-center border border-border/10">
                      <p className="text-[13px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className={cn("text-base font-bold font-mono", sentimentColor(s.data.score))}>{s.data.score}</p>
                      <p className="text-[13px] font-mono text-muted-foreground">{s.data.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Events */}
            {brief.keyEvents && brief.keyEvents.length > 0 && (
              <div className="rounded-xl p-3 border border-border/10 bg-card/60">
                <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 text-accent">
                  <Clock className="w-3 h-3" />
                  أحداث اقتصادية مؤثرة
                </h3>
                <div className="space-y-1.5">
                  {brief.keyEvents.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 bg-secondary/30 rounded-lg px-2.5 py-2 border border-border/5">
                      <span className={cn("text-[13px] font-mono font-bold px-1.5 py-0.5 rounded-lg border shrink-0 mt-0.5", impactColor(ev.impact))}>
                        {ev.impact === "high" ? "عالي" : ev.impact === "medium" ? "متوسط" : "منخفض"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-mono font-medium">{ev.event}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[13px] font-mono text-muted-foreground">{ev.time}</span>
                          <div className="flex gap-1">
                            {ev.assets?.map((a, ai) => (
                              <span key={ai} className="text-[13px] font-mono bg-secondary px-1 py-0.5 rounded-lg border border-border/10">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positioning Opportunities */}
            {brief.topOpportunities && brief.topOpportunities.length > 0 && (
              <div className="rounded-xl p-3 border border-border/10 bg-card/60">
                <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 text-accent">
                  <Crosshair className="w-3 h-3" />
                  فرص التمركز
                </h3>
                <div className="space-y-1.5">
                  {brief.topOpportunities.map((opp, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-lg px-2.5 py-2 border border-border/5">
                      <div className="flex items-center gap-2">
                        {opp.direction === "شراء" ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-success shrink-0" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-destructive shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-mono font-bold">{opp.pair}</span>
                            <span className={cn(
                              "text-[13px] font-mono font-bold px-1.5 py-0.5 rounded-lg border",
                              opp.direction === "شراء" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                              {opp.direction}
                            </span>
                          </div>
                          <p className="text-[13px] font-mono text-muted-foreground">{opp.reason}</p>
                        </div>
                      </div>
                      <span className="text-[13px] font-mono font-bold text-accent">{opp.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Alerts */}
            {brief.riskAlerts && brief.riskAlerts.length > 0 && (
              <div className="rounded-xl p-3 border border-destructive/10 bg-destructive/3">
                <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 text-destructive">
                  <Shield className="w-3 h-3" />
                  تحذيرات المخاطر
                </h3>
                <div className="space-y-1.5">
                  {brief.riskAlerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-2 bg-destructive/5 rounded-lg px-2.5 py-2 border border-destructive/10">
                      <AlertTriangle className={cn("w-3 h-3 shrink-0 mt-0.5", alert.severity === "high" ? "text-destructive" : "text-warning")} />
                      <p className="text-[13px] font-mono">{alert.alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Focus Assets */}
            {brief.focusAssets && brief.focusAssets.length > 0 && (
              <div className="rounded-xl p-3 border border-border/10 bg-card/60">
                <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 text-accent">
                  <Eye className="w-3 h-3" />
                  أصول تحت المراقبة
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {brief.focusAssets.map((asset, i) => (
                    <span key={i} className="text-[13px] font-mono bg-accent/10 text-accent px-2 py-1 rounded-lg border border-accent/10">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Tip */}
            {brief.dailyTip && (
              <div className="rounded-xl p-3 border border-accent/10 bg-accent/3">
                <h3 className="text-[13px] font-bold font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-accent">
                  <Lightbulb className="w-3 h-3" />
                  توصية الجلسة
                </h3>
                <p className="text-[13px] text-muted-foreground font-mono leading-relaxed">{brief.dailyTip}</p>
              </div>
            )}

            {/* Regenerate */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={fetchBrief}
              className="w-full rounded-xl p-3 flex items-center justify-center gap-2 border border-accent/10 hover:border-accent/20 transition-all bg-card/50"
            >
              <RefreshCw className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-medium">إعادة توليد الإحاطة</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MorningBrief;
