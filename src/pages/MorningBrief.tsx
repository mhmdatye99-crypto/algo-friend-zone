import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Clock, Lightbulb, Eye, Loader2, Sparkles, BarChart3,
  Shield, ChevronLeft, ArrowUpRight, ArrowDownRight
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
    } catch (err: any) {
      console.error(err);
      toast.error("فشل تحميل الملخص. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const impactColor = (impact: string) =>
    impact === "high" ? "text-destructive bg-destructive/10" :
    impact === "medium" ? "text-warning bg-warning/10" :
    "text-muted-foreground bg-secondary";

  const severityColor = (s: string) =>
    s === "high" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5";

  const sentimentColor = (score: number) =>
    score >= 65 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

  return (
    <motion.div
      className="px-4 pt-10 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">الملخص الصباحي</p>
          <h1 className="text-lg font-bold">خريطة الطريق المالية</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-warning" />
          <span className="text-[10px] font-mono text-muted-foreground">8:00 صباحاً</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground font-mono mb-5">
        ملخصك اليومي المولّد بالذكاء الاصطناعي لتخطيط جلسة التداول
      </p>

      <AnimatePresence mode="wait">
        {!brief && !loading && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass rounded-lg p-8 text-center border border-border/10 mb-4">
              <Sun className="w-10 h-10 mx-auto mb-3 text-warning" />
              <h3 className="text-sm font-bold font-mono mb-1">ملخصك الصباحي جاهز للتوليد</h3>
              <p className="text-[10px] text-muted-foreground font-mono mb-4">
                اضغط الزر أدناه لتوليد خريطة الطريق المالية المخصصة ليومك
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={fetchBrief}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                توليد الملخص الصباحي
              </motion.button>
            </div>

            {/* ماذا يتضمن */}
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono">ماذا يتضمن الملخص</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: BarChart3, label: "نظرة عامة على الأسواق" },
                { icon: Clock, label: "أحداث اقتصادية مهمة" },
                { icon: TrendingUp, label: "أفضل الفرص" },
                { icon: AlertTriangle, label: "تحذيرات المخاطر" },
                { icon: Eye, label: "تحليل المعنويات" },
                { icon: Lightbulb, label: "نصيحة اليوم" },
              ].map((item, i) => (
                <div key={i} className="glass rounded-lg p-3 flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[10px] font-mono text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass rounded-lg p-10 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-primary animate-spin" />
              <h3 className="text-sm font-bold font-mono mb-1">جارٍ توليد الملخص...</h3>
              <p className="text-[10px] text-muted-foreground font-mono">
                يقوم الذكاء الاصطناعي بتحليل الأسواق العالمية
              </p>
            </div>
          </motion.div>
        )}

        {brief && !loading && (
          <motion.div
            key="brief"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* التاريخ والتحية */}
            <div className="glass rounded-lg p-3">
              <p className="text-[9px] font-mono text-muted-foreground mb-0.5">{brief.date}</p>
              <p className="text-xs font-mono">{brief.greeting}</p>
            </div>

            {/* نظرة عامة */}
            <div className="glass rounded-lg p-3">
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-primary" />
                نظرة عامة على الأسواق
              </h3>
              <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{brief.marketOverview}</p>
            </div>

            {/* المعنويات */}
            {brief.sentiment && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-primary" />
                  معنويات الأسواق
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "crypto", label: "كريبتو", data: brief.sentiment.crypto },
                    { key: "forex", label: "فوركس", data: brief.sentiment.forex },
                    { key: "commodities", label: "سلع", data: brief.sentiment.commodities },
                  ].map((s) => s.data && (
                    <div key={s.key} className="bg-secondary/40 rounded-lg p-2 text-center border border-border/10">
                      <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className={cn("text-base font-bold font-mono", sentimentColor(s.data.score))}>{s.data.score}</p>
                      <p className="text-[8px] font-mono text-muted-foreground">{s.data.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الأحداث */}
            {brief.keyEvents && brief.keyEvents.length > 0 && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary" />
                  أحداث اقتصادية مهمة
                </h3>
                <div className="space-y-1.5">
                  {brief.keyEvents.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 bg-secondary/30 rounded-lg px-2.5 py-2">
                      <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5", impactColor(ev.impact))}>
                        {ev.impact === "high" ? "عالي" : ev.impact === "medium" ? "متوسط" : "منخفض"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono font-medium">{ev.event}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-muted-foreground">{ev.time}</span>
                          <div className="flex gap-1">
                            {ev.assets?.map((a, ai) => (
                              <span key={ai} className="text-[8px] font-mono bg-secondary px-1 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* أفضل الفرص */}
            {brief.topOpportunities && brief.topOpportunities.length > 0 && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-success" />
                  أفضل الفرص
                </h3>
                <div className="space-y-1.5">
                  {brief.topOpportunities.map((opp, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-lg px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        {opp.direction === "شراء" ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-success shrink-0" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-destructive shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold">{opp.pair}</span>
                            <span className={cn(
                              "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded",
                              opp.direction === "شراء" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            )}>
                              {opp.direction}
                            </span>
                          </div>
                          <p className="text-[9px] font-mono text-muted-foreground">{opp.reason}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary">{opp.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* تحذيرات */}
            {brief.riskAlerts && brief.riskAlerts.length > 0 && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  تحذيرات المخاطر
                </h3>
                <div className="space-y-1.5">
                  {brief.riskAlerts.map((alert, i) => (
                    <div key={i} className={cn("flex items-start gap-2 rounded-lg px-2.5 py-2 border", severityColor(alert.severity))}>
                      <Shield className={cn("w-3 h-3 shrink-0 mt-0.5", alert.severity === "high" ? "text-destructive" : "text-warning")} />
                      <p className="text-[11px] font-mono">{alert.alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* أصول للمراقبة */}
            {brief.focusAssets && brief.focusAssets.length > 0 && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-primary" />
                  أصول تستحق المراقبة
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {brief.focusAssets.map((asset, i) => (
                    <span key={i} className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/10">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* نصيحة اليوم */}
            {brief.dailyTip && (
              <div className="glass rounded-lg p-3 border border-accent/10">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-warning" />
                  نصيحة اليوم
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{brief.dailyTip}</p>
              </div>
            )}

            {/* إعادة التوليد */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={fetchBrief}
              className="w-full glass rounded-lg p-3 flex items-center justify-center gap-2 border border-primary/10 hover:border-primary/20 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-medium">إعادة توليد الملخص</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MorningBrief;
