import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Sparkles, TrendingUp, Shield, Target, BarChart3,
  ArrowUp, ArrowDown, Minus, CheckCircle2, Loader2, RotateCcw,
  Share2, Bookmark, Bell, Cpu, Layers, Crosshair
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  pair?: string;
  timeframe?: string;
  pattern?: string;
  patternAr?: string;
  patternConfidence?: number;
  direction?: string;
  directionAr?: string;
  directionConfidence?: number;
  supportLevels?: string[];
  resistanceLevels?: string[];
  indicators?: { name: string; value?: string; signal: string }[];
  entry?: string;
  stopLoss?: string;
  takeProfit1?: string;
  takeProfit2?: string;
  riskReward?: string;
  strategy?: string;
  reasoning?: string[];
  summary?: string;
  error?: string;
}

type Step = "idle" | "loading" | "results";

const loadingSteps = [
  { label: "جارٍ رفع بيانات الصورة...", icon: Upload },
  { label: "تحديد الزوج والإطار الزمني...", icon: Crosshair },
  { label: "التعرف العصبي على الأنماط...", icon: Cpu },
  { label: "تحليل المؤشرات الفنية...", icon: BarChart3 },
  { label: "حساب مستويات الدعم والمقاومة...", icon: Layers },
  { label: "توليد توصية ألفا...", icon: Target },
];

const ChartVision = () => {
  const [step, setStep] = useState<Step>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      analyzeChart(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeChart = async (imageBase64: string) => {
    setStep("loading");
    setLoadingStep(0);
    setAnalysis(null);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64 },
      });
      clearInterval(interval);
      setLoadingStep(loadingSteps.length - 1);
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setStep("idle"); return; }
      setAnalysis(data);
      setStep("results");
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      toast.error("فشل التحليل. يرجى المحاولة مرة أخرى.");
      setStep("idle");
    }
  };

  const resetAnalysis = () => {
    setStep("idle");
    setImagePreview(null);
    setAnalysis(null);
    setLoadingStep(0);
  };

  const directionIcon = analysis?.direction === "bullish"
    ? <ArrowUp className="w-4 h-4" />
    : analysis?.direction === "bearish"
      ? <ArrowDown className="w-4 h-4" />
      : <Minus className="w-4 h-4" />;

  const directionColor = analysis?.direction === "bullish"
    ? "text-success"
    : analysis?.direction === "bearish"
      ? "text-destructive"
      : "text-warning";

  return (
    <motion.div
      className="px-4 pt-4 pb-28 max-w-lg mx-auto space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      <AnimatePresence mode="wait">
        {/* الحالة الأولية */}
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-[75vh]">
            {/* القدرات */}
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3 font-mono">قدرات المحرك العصبي</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Target, label: "+50 نمط فني" },
                  { icon: BarChart3, label: "كشف الدعم/المقاومة" },
                  { icon: TrendingUp, label: "تحليل الاتجاه" },
                  { icon: Shield, label: "حساب المخاطر" },
                  { icon: Sparkles, label: "توليد استراتيجية" },
                  { icon: Camera, label: "مسح فوري" },
                ].map((cap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="intel-card rounded-[10px] p-3 flex flex-col items-center gap-2 text-center"
                  >
                    <cap.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider leading-tight">{cap.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* الحالة الفارغة */}
            <div className="intel-card rounded-[10px] p-8 text-center mb-4 flex-1 flex flex-col items-center justify-center">
              <Cpu className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40 animate-pulse" />
              <h4 className="text-xs font-semibold font-mono mb-1">المحرك العصبي في وضع الاستعداد</h4>
              <p className="text-[10px] text-muted-foreground font-mono">
                ارفع صورة شارت لبدء التحليل المؤسسي بالذكاء الاصطناعي
              </p>
            </div>

            {/* Upload Buttons — Bottom of screen for thumb access */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => cameraInputRef.current?.click()}
                className="rounded-[10px] p-4 flex items-center gap-3 transition-all"
                style={{
                  background: "linear-gradient(180deg, hsla(43,100%,50%,0.1) 0%, hsla(43,100%,50%,0.04) 100%)",
                  border: "1px solid hsla(43,100%,50%,0.15)",
                }}
              >
                <div className="w-11 h-11 rounded-[10px] bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-mono font-bold text-primary block">التقاط مباشر</span>
                  <span className="text-[9px] font-mono text-muted-foreground">كاميرا الجهاز</span>
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[10px] p-4 flex items-center gap-3 transition-all"
                style={{
                  background: "linear-gradient(180deg, hsla(190,100%,50%,0.08) 0%, hsla(190,100%,50%,0.02) 100%)",
                  border: "1px solid hsla(190,100%,50%,0.12)",
                }}
              >
                <div className="w-11 h-11 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-mono font-bold text-accent block">رفع صورة</span>
                  <span className="text-[9px] font-mono text-muted-foreground">من المعرض</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* التحميل — Camera shutter */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4 space-y-4">
            {imagePreview && (
              <motion.div
                className="rounded-xl overflow-hidden border border-primary/15 relative shutter-anim"
              >
                <img src={imagePreview} alt="الشارت" className="w-full h-48 object-cover opacity-50" />
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 0 hsl(43 100% 50% / 0)", "0 0 30px hsl(43 100% 50% / 0.3)", "0 0 0 hsl(43 100% 50% / 0)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Cpu className="w-7 h-7 text-primary" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            <div className="intel-card rounded-xl p-5 text-center">
              <h3 className="text-sm font-bold font-mono mb-4">جارٍ المعالجة العصبية...</h3>
              <div className="space-y-2.5">
                {loadingSteps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: i <= loadingStep ? 1 : 0.2, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2.5 text-xs font-mono"
                  >
                    {i < loadingStep ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : i === loadingStep ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-border/30 shrink-0" />
                    )}
                    <span className={i <= loadingStep ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* النتائج */}
        {step === "results" && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {imagePreview && (
              <div className="rounded-xl overflow-hidden border border-primary/10 relative">
                <img src={imagePreview} alt="الشارت" className="w-full h-40 object-cover" />
                {/* Ghost chart overlay hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-mono text-primary border border-primary/20">
                  تحليل مؤسسي مُكتمل
                </div>
              </div>
            )}

            {/* الزوج والاتجاه */}
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold font-mono">{analysis.pair || "غير معروف"}</h2>
                  <span className="text-[9px] text-muted-foreground font-mono">{analysis.timeframe || ""}</span>
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-bold font-mono", directionColor)}>
                  {directionIcon}
                  <span>{analysis.directionAr || analysis.direction?.toUpperCase()}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                الثقة: {analysis.directionConfidence}%
              </span>
            </div>

            {/* النمط */}
            <div className="glass rounded-lg p-3">
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-1.5">النمط المكتشف</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{analysis.pattern}</p>
                  {analysis.patternAr && <p className="text-[10px] text-muted-foreground">{analysis.patternAr}</p>}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold font-mono text-primary">{analysis.patternConfidence}%</span>
                </div>
              </div>
            </div>

            {/* الدعم والمقاومة */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-lg p-3">
                <h4 className="text-[9px] font-mono font-bold text-success uppercase tracking-wider mb-1.5">الدعم</h4>
                <div className="space-y-1">
                  {analysis.supportLevels?.map((l, i) => (
                    <div key={i} className="text-[11px] font-mono bg-success/5 px-2 py-0.5 rounded text-success border border-success/10">
                      د{i + 1}: {l}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <h4 className="text-[9px] font-mono font-bold text-destructive uppercase tracking-wider mb-1.5">المقاومة</h4>
                <div className="space-y-1">
                  {analysis.resistanceLevels?.map((l, i) => (
                    <div key={i} className="text-[11px] font-mono bg-destructive/5 px-2 py-0.5 rounded text-destructive border border-destructive/10">
                      م{i + 1}: {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* المؤشرات */}
            {analysis.indicators && analysis.indicators.length > 0 && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2">التقارب الفني</h3>
                <div className="space-y-1.5">
                  {analysis.indicators.map((ind, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">{ind.name}</span>
                      <div className="flex items-center gap-2">
                        {ind.value && <span>{ind.value}</span>}
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded",
                          ind.signal === "buy" || ind.signal === "bullish" ? "bg-success/10 text-success" :
                          ind.signal === "sell" || ind.signal === "bearish" ? "bg-destructive/10 text-destructive" :
                          "bg-secondary text-muted-foreground"
                        )}>{ind.signal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الاستراتيجية */}
            <div className="glass rounded-lg p-3 border border-primary/10">
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2">توصية الاستراتيجية</h3>
              <p className="text-[11px] text-muted-foreground font-mono mb-3">{analysis.strategy}</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="bg-secondary/40 rounded-lg p-2 border border-border/10">
                  <span className="text-[9px] text-muted-foreground font-mono block">الدخول</span>
                  <span className="font-mono font-bold">{analysis.entry}</span>
                </div>
                <div className="bg-destructive/5 rounded-lg p-2 border border-destructive/10">
                  <span className="text-[9px] text-destructive font-mono block">وقف الخسارة</span>
                  <span className="font-mono font-bold text-destructive">{analysis.stopLoss}</span>
                </div>
                <div className="bg-success/5 rounded-lg p-2 border border-success/10">
                  <span className="text-[9px] text-success font-mono block">الهدف 1</span>
                  <span className="font-mono font-bold text-success">{analysis.takeProfit1}</span>
                </div>
                <div className="bg-success/5 rounded-lg p-2 border border-success/10">
                  <span className="text-[9px] text-success font-mono block">الهدف 2</span>
                  <span className="font-mono font-bold text-success">{analysis.takeProfit2}</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[10px] text-muted-foreground font-mono">المخاطرة:العائد </span>
                <span className="text-xs font-bold font-mono text-primary">{analysis.riskReward}</span>
              </div>
            </div>

            {/* المنطق */}
            {analysis.reasoning && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2">منطق الذكاء الاصطناعي</h3>
                <div className="space-y-1.5">
                  {analysis.reasoning.map((r, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] font-mono">
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الملخص */}
            {analysis.summary && (
              <div className="glass rounded-lg p-3 border border-accent/10">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-1.5">الملخص التنفيذي</h3>
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            {/* Execution Shortcuts */}
            <div className="intel-card rounded-xl p-4">
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-3">اختصارات التنفيذ</h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.binance.com/en/trade/${(analysis.pair || "BTC_USDT").replace("/", "_")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-warning/10 border border-warning/20 text-[10px] font-mono font-bold text-warning hover:bg-warning/15 transition-all"
                >
                  فتح في Binance ↗
                </a>
                <button
                  onClick={() => {
                    const strategy = `${analysis.pair} | ${analysis.directionAr} | Entry: ${analysis.entry} | SL: ${analysis.stopLoss} | TP1: ${analysis.takeProfit1} | TP2: ${analysis.takeProfit2}`;
                    navigator.clipboard.writeText(strategy);
                    toast.success("تم نسخ الاستراتيجية");
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-[10px] font-mono font-bold text-accent hover:bg-accent/15 transition-all"
                >
                  نسخ لـ MetaTrader
                </button>
              </div>
            </div>

            {/* الإجراءات */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button whileTap={{ scale: 0.95 }} className="intel-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-[11px] font-mono hover:border-primary/20 transition-all">
                <Bookmark className="w-5 h-5 text-primary" />
                حفظ
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="intel-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-[11px] font-mono hover:border-accent/20 transition-all">
                <Share2 className="w-5 h-5 text-accent" />
                مشاركة
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="intel-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-[11px] font-mono hover:border-warning/20 transition-all">
                <Bell className="w-5 h-5 text-warning" />
                تنبيه
              </motion.button>
            </div>

            {/* إعادة التحليل */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={resetAnalysis}
              className="w-full intel-card rounded-xl p-3.5 flex items-center justify-center gap-2 hover:border-primary/20 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-medium">تحليل شارت آخر</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChartVision;
