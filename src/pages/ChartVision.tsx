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
  { label: "Uploading image data...", icon: Upload },
  { label: "Identifying pair & timeframe...", icon: Crosshair },
  { label: "Neural pattern recognition...", icon: Cpu },
  { label: "Technical indicator analysis...", icon: BarChart3 },
  { label: "Computing support & resistance...", icon: Layers },
  { label: "Generating alpha recommendation...", icon: Target },
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
      toast.error("Please select a valid image file");
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
      toast.error("Analysis failed. Please retry.");
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
      className="px-4 pt-10 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      <AnimatePresence mode="wait">
        {/* IDLE */}
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">Neural Analysis Engine</p>
            <h1 className="text-lg font-bold mb-1">Chart Vision AI</h1>
            <p className="text-[10px] text-muted-foreground font-mono mb-6">
              Upload any chart image for institutional-grade pattern recognition & alpha generation
            </p>

            {/* Upload */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => cameraInputRef.current?.click()}
                className="glass rounded-lg p-5 flex flex-col items-center gap-2 border border-primary/15 hover:border-primary/30 transition-all"
              >
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-[11px] font-mono font-medium">Capture</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-lg p-5 flex flex-col items-center gap-2 border border-border/20 hover:border-accent/30 transition-all"
              >
                <Upload className="w-6 h-6 text-accent" />
                <span className="text-[11px] font-mono font-medium">Upload</span>
              </motion.button>
            </div>

            {/* Capabilities */}
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono">Capabilities</h3>
            <div className="grid grid-cols-3 gap-1.5 mb-6">
              {[
                { icon: Target, label: "50+ Patterns" },
                { icon: BarChart3, label: "S/R Detection" },
                { icon: TrendingUp, label: "Direction AI" },
                { icon: Shield, label: "Risk Calc" },
                { icon: Sparkles, label: "Strategy Gen" },
                { icon: Camera, label: "Live Compare" },
              ].map((cap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-lg p-2.5 flex flex-col items-center gap-1.5 text-center"
                >
                  <cap.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">{cap.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            <div className="glass rounded-lg p-6 text-center border border-border/10">
              <Cpu className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <h4 className="text-xs font-semibold font-mono mb-0.5">Neural Engine Ready</h4>
              <p className="text-[10px] text-muted-foreground font-mono">
                Upload a chart image to begin AI analysis
              </p>
            </div>
          </motion.div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
            {imagePreview && (
              <div className="rounded-lg overflow-hidden mb-4 border border-border/20 relative">
                <img src={imagePreview} alt="Chart" className="w-full h-44 object-cover opacity-60" />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            <div className="glass rounded-lg p-4 text-center mb-4">
              <h3 className="text-sm font-bold font-mono mb-4">Neural Processing...</h3>
              <div className="space-y-2 text-right">
                {loadingSteps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: i <= loadingStep ? 1 : 0.2, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 text-xs font-mono"
                  >
                    {i < loadingStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    ) : i === loadingStep ? (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded border border-border/30 shrink-0" />
                    )}
                    <span className={i <= loadingStep ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {step === "results" && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {imagePreview && (
              <div className="rounded-lg overflow-hidden border border-border/20">
                <img src={imagePreview} alt="Chart" className="w-full h-36 object-cover" />
              </div>
            )}

            {/* Pair & Direction */}
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold font-mono">{analysis.pair || "Unknown"}</h2>
                  <span className="text-[9px] text-muted-foreground font-mono">{analysis.timeframe || ""}</span>
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-bold font-mono", directionColor)}>
                  {directionIcon}
                  <span>{analysis.direction?.toUpperCase()}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Confidence: {analysis.directionConfidence}%
              </span>
            </div>

            {/* Pattern */}
            <div className="glass rounded-lg p-3">
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-1.5">Pattern Detected</h3>
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

            {/* Support & Resistance */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-lg p-3">
                <h4 className="text-[9px] font-mono font-bold text-success uppercase tracking-wider mb-1.5">Support</h4>
                <div className="space-y-1">
                  {analysis.supportLevels?.map((l, i) => (
                    <div key={i} className="text-[11px] font-mono bg-success/5 px-2 py-0.5 rounded text-success border border-success/10">
                      S{i + 1}: {l}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <h4 className="text-[9px] font-mono font-bold text-destructive uppercase tracking-wider mb-1.5">Resistance</h4>
                <div className="space-y-1">
                  {analysis.resistanceLevels?.map((l, i) => (
                    <div key={i} className="text-[11px] font-mono bg-destructive/5 px-2 py-0.5 rounded text-destructive border border-destructive/10">
                      R{i + 1}: {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicators */}
            {analysis.indicators && analysis.indicators.length > 0 && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2">Technical Convergence</h3>
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

            {/* Strategy */}
            <div className="glass rounded-lg p-3 border border-primary/10">
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2">Strategy Recommendation</h3>
              <p className="text-[11px] text-muted-foreground font-mono mb-3">{analysis.strategy}</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="bg-secondary/40 rounded-lg p-2 border border-border/10">
                  <span className="text-[9px] text-muted-foreground font-mono block">ENTRY</span>
                  <span className="font-mono font-bold">{analysis.entry}</span>
                </div>
                <div className="bg-destructive/5 rounded-lg p-2 border border-destructive/10">
                  <span className="text-[9px] text-destructive font-mono block">STOP</span>
                  <span className="font-mono font-bold text-destructive">{analysis.stopLoss}</span>
                </div>
                <div className="bg-success/5 rounded-lg p-2 border border-success/10">
                  <span className="text-[9px] text-success font-mono block">TP1</span>
                  <span className="font-mono font-bold text-success">{analysis.takeProfit1}</span>
                </div>
                <div className="bg-success/5 rounded-lg p-2 border border-success/10">
                  <span className="text-[9px] text-success font-mono block">TP2</span>
                  <span className="font-mono font-bold text-success">{analysis.takeProfit2}</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[10px] text-muted-foreground font-mono">R:R </span>
                <span className="text-xs font-bold font-mono text-primary">{analysis.riskReward}</span>
              </div>
            </div>

            {/* Reasoning */}
            {analysis.reasoning && (
              <div className="glass rounded-lg p-3">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-2">AI Reasoning</h3>
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

            {/* Summary */}
            {analysis.summary && (
              <div className="glass rounded-lg p-3 border border-accent/10">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider mb-1.5">Executive Summary</h3>
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-3 gap-1.5">
              <motion.button whileTap={{ scale: 0.95 }} className="glass rounded-lg p-2.5 flex flex-col items-center gap-1 text-[9px] font-mono">
                <Bookmark className="w-4 h-4 text-primary" />
                Save
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="glass rounded-lg p-2.5 flex flex-col items-center gap-1 text-[9px] font-mono">
                <Share2 className="w-4 h-4 text-accent" />
                Share
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="glass rounded-lg p-2.5 flex flex-col items-center gap-1 text-[9px] font-mono">
                <Bell className="w-4 h-4 text-warning" />
                Alert
              </motion.button>
            </div>

            {/* Reset */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={resetAnalysis}
              className="w-full glass rounded-lg p-3 flex items-center justify-center gap-2 border border-primary/10 hover:border-primary/20 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-medium">Analyze Another Chart</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChartVision;
