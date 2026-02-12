import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Sparkles, TrendingUp, Shield, Target, BarChart3,
  ArrowUp, ArrowDown, Minus, CheckCircle2, XCircle, Loader2, RotateCcw,
  Share2, Bookmark, Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const capabilities = [
  { icon: Target, label: "50+ نمط فني", color: "from-primary to-orange-500" },
  { icon: BarChart3, label: "دعم ومقاومة", color: "from-cyan-500 to-blue-500" },
  { icon: TrendingUp, label: "توقع الاتجاه", color: "from-emerald-500 to-green-500" },
  { icon: Shield, label: "حساب المخاطرة", color: "from-purple-500 to-pink-500" },
  { icon: Sparkles, label: "استراتيجية ذكية", color: "from-amber-500 to-yellow-400" },
  { icon: Camera, label: "مقارنة مباشرة", color: "from-rose-500 to-red-500" },
];

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
  "تحميل الصورة...",
  "التعرف على الزوج والإطار الزمني...",
  "اكتشاف الأنماط الفنية...",
  "تحليل المؤشرات...",
  "حساب المستويات...",
  "توليد التوصية...",
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
      toast.error("يرجى اختيار صورة صالحة");
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

    // Simulate step progression
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
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

      if (data?.error) {
        toast.error(data.error);
        setStep("idle");
        return;
      }

      setAnalysis(data);
      setStep("results");
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      toast.error("حدث خطأ أثناء التحليل. حاول مرة أخرى.");
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
    ? <ArrowUp className="w-5 h-5" />
    : analysis?.direction === "bearish"
      ? <ArrowDown className="w-5 h-5" />
      : <Minus className="w-5 h-5" />;

  const directionColor = analysis?.direction === "bullish"
    ? "text-emerald-400"
    : analysis?.direction === "bearish"
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <motion.div
      className="px-4 pt-12 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      <AnimatePresence mode="wait">
        {/* ─── IDLE STATE ─── */}
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Hero */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center glow-gold"
              >
                <Camera className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">📸 Chart Vision AI</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                صور شارتك واحصل على تحليل ذكي فوري
                <br />
                يكتشف الأنماط ويحدد الفرص ويقترح الاستراتيجية
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => cameraInputRef.current?.click()}
                className="glass rounded-2xl p-6 flex flex-col items-center gap-3 border border-primary/20 glow-gold hover:border-primary/40 transition-all"
              >
                <Camera className="w-8 h-8 text-primary" />
                <span className="text-sm font-semibold">التقط صورة</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-2xl p-6 flex flex-col items-center gap-3 border border-border/30 hover:border-accent/40 transition-all"
              >
                <Upload className="w-8 h-8 text-accent" />
                <span className="text-sm font-semibold">ارفع من المعرض</span>
              </motion.button>
            </div>

            {/* Capabilities */}
            <h3 className="text-sm font-semibold mb-3">ماذا يمكنه أن يفعل؟</h3>
            <div className="grid grid-cols-3 gap-2 mb-8">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-xl p-3 flex flex-col items-center gap-2 text-center"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cap.color} flex items-center justify-center`}>
                    <cap.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">{cap.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            <div className="glass rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-muted-foreground animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold mb-1">ابدأ بأول تحليل!</h4>
              <p className="text-xs text-muted-foreground">
                التقط صورة لأي شارت وسيقوم AI بتحليله خلال ثوانٍ
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── LOADING STATE ─── */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8">
            {imagePreview && (
              <div className="rounded-2xl overflow-hidden mb-6 border border-border/30">
                <img src={imagePreview} alt="Chart" className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="glass rounded-2xl p-6 text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
              </div>
              <h3 className="text-lg font-bold mb-4">AI يحلل الشارت...</h3>
              <div className="space-y-3 text-right">
                {loadingSteps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= loadingStep ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    {i < loadingStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : i === loadingStep ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border/50 shrink-0" />
                    )}
                    <span className={i <= loadingStep ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── RESULTS STATE ─── */}
        {step === "results" && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Image Preview */}
            {imagePreview && (
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <img src={imagePreview} alt="Chart" className="w-full h-40 object-cover" />
              </div>
            )}

            {/* Pair & Direction */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold">{analysis.pair || "غير محدد"}</h2>
                  <span className="text-xs text-muted-foreground">{analysis.timeframe || ""}</span>
                </div>
                <div className={`flex items-center gap-1 text-lg font-bold ${directionColor}`}>
                  {directionIcon}
                  <span>{analysis.directionAr || analysis.direction}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  ثقة الاتجاه: {analysis.directionConfidence}%
                </span>
              </div>
            </div>

            {/* Pattern */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-bold mb-2">🎯 النمط المكتشف</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{analysis.patternAr || analysis.pattern}</p>
                  {analysis.pattern !== analysis.patternAr && (
                    <p className="text-xs text-muted-foreground">{analysis.pattern}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{analysis.patternConfidence}%</span>
                </div>
              </div>
            </div>

            {/* Support & Resistance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4">
                <h4 className="text-xs font-semibold text-emerald-400 mb-2">📊 مستويات الدعم</h4>
                <div className="space-y-1">
                  {analysis.supportLevels?.map((l, i) => (
                    <div key={i} className="text-sm font-mono bg-emerald-500/10 px-2 py-1 rounded text-emerald-300">
                      S{i + 1}: {l}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <h4 className="text-xs font-semibold text-red-400 mb-2">📊 مستويات المقاومة</h4>
                <div className="space-y-1">
                  {analysis.resistanceLevels?.map((l, i) => (
                    <div key={i} className="text-sm font-mono bg-red-500/10 px-2 py-1 rounded text-red-300">
                      R{i + 1}: {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicators */}
            {analysis.indicators && analysis.indicators.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">📈 المؤشرات الفنية</h3>
                <div className="space-y-2">
                  {analysis.indicators.map((ind, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{ind.name}</span>
                      <div className="flex items-center gap-2">
                        {ind.value && <span className="font-mono">{ind.value}</span>}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{ind.signal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy */}
            <div className="glass rounded-2xl p-4 border border-primary/20">
              <h3 className="text-sm font-bold mb-3">💡 الاستراتيجية المقترحة</h3>
              <p className="text-sm text-muted-foreground mb-4">{analysis.strategy}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <span className="text-xs text-muted-foreground block">نقطة الدخول</span>
                  <span className="font-mono font-bold">{analysis.entry}</span>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3">
                  <span className="text-xs text-red-400 block">وقف الخسارة</span>
                  <span className="font-mono font-bold text-red-300">{analysis.stopLoss}</span>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3">
                  <span className="text-xs text-emerald-400 block">الهدف الأول</span>
                  <span className="font-mono font-bold text-emerald-300">{analysis.takeProfit1}</span>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3">
                  <span className="text-xs text-emerald-400 block">الهدف الثاني</span>
                  <span className="font-mono font-bold text-emerald-300">{analysis.takeProfit2}</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs text-muted-foreground">المخاطرة/المكافأة: </span>
                <span className="text-sm font-bold text-primary">{analysis.riskReward}</span>
              </div>
            </div>

            {/* Reasoning */}
            {analysis.reasoning && (
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">🧠 لماذا هذه التوصية؟</h3>
                <div className="space-y-2">
                  {analysis.reasoning.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="glass rounded-2xl p-4 border border-accent/20">
                <h3 className="text-sm font-bold mb-2">📝 الملخص</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="glass rounded-xl p-3 flex flex-col items-center gap-1 text-xs"
              >
                <Bookmark className="w-5 h-5 text-primary" />
                حفظ
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="glass rounded-xl p-3 flex flex-col items-center gap-1 text-xs"
              >
                <Share2 className="w-5 h-5 text-accent" />
                مشاركة
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="glass rounded-xl p-3 flex flex-col items-center gap-1 text-xs"
              >
                <Bell className="w-5 h-5 text-amber-400" />
                تنبيه
              </motion.button>
            </div>

            {/* Analyze Another */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={resetAnalysis}
              className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 border border-primary/20 hover:border-primary/40 transition-all"
            >
              <RotateCcw className="w-5 h-5 text-primary" />
              <span className="font-semibold">تحليل صورة أخرى</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChartVision;
