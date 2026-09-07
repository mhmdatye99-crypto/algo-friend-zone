import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Send, Search, ImagePlus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLivePrices } from "@/hooks/useLivePrices";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { pair: string; prediction: "bullish" | "bearish"; ai_confidence: number; analysis_summary: string; timeframe: string; image?: File | null; price_at_post?: number }) => void;
}

const allPairs = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "BNB/USDT", "ADA/USDT", "DOT/USDT", "DOGE/USDT", "AVAX/USDT", "LINK/USDT",
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF", "EUR/GBP", "GBP/JPY", "NZD/USD",
  "GOLD", "SILVER", "OIL",
];
const timeframes = ["1H", "4H", "D1", "W1"];

const CreatePostDialog = ({ open, onClose, onCreate }: Props) => {
  const [step, setStep] = useState(1);
  const [pair, setPair] = useState("");
  const [pairSearch, setPairSearch] = useState("");
  const [prediction, setPrediction] = useState<"bullish" | "bearish">("bullish");
  const [confidence, setConfidence] = useState(70);
  const [summary, setSummary] = useState("");
  const [timeframe, setTimeframe] = useState("4H");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const assets = useLivePrices();

  const filteredPairs = useMemo(() => {
    if (!pairSearch.trim()) return allPairs;
    const q = pairSearch.toLowerCase();
    return allPairs.filter(p => p.toLowerCase().includes(q));
  }, [pairSearch]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!summary.trim() || !pair) return;
    const currentAsset = assets.find(a => a.pair === pair);
    const priceAtPost = currentAsset?.price;
    onCreate({ pair, prediction, ai_confidence: confidence, analysis_summary: summary, timeframe, image: imageFile, price_at_post: priceAtPost });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setPair("");
    setPairSearch("");
    setSummary("");
    setConfidence(70);
    removeImage();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-card border-t border-border rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-4 max-h-[88vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} aria-label="السابق" className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <span className="text-[16px] font-semibold">
                  {step === 1 ? "اختر الأصل" : step === 2 ? "التفاصيل" : "ملخص التحليل"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-muted-foreground nx-ltr">{step}/3</span>
                <button onClick={resetAndClose} aria-label="إغلاق" className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Step 1: Asset Selector */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={pairSearch}
                      onChange={e => setPairSearch(e.target.value)}
                      placeholder="ابحث عن الأصل... BTC, SOL, GOLD"
                       className="nx-input pr-10 font-mono"
                      dir="rtl"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-[40vh] overflow-y-auto">
                    {filteredPairs.map(p => (
                      <button
                        key={p}
                        onClick={() => { setPair(p); setStep(2); }}
                        className={cn(
                           "min-h-11 px-2 py-2.5 rounded-lg text-[13px] font-mono font-medium transition-all border text-center nx-ltr",
                          pair === p
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/40 text-muted-foreground border-border/10 hover:border-primary/20 hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                    {filteredPairs.length === 0 && (
                       <div className="col-span-3 text-center py-6 text-[14px] text-muted-foreground">
                        لا توجد نتائج
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Prediction + Timeframe + Confidence */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="glass rounded-xl p-3 flex items-center justify-center gap-2">
                    <span className="text-[13px] font-mono font-bold text-primary">{pair}</span>
                  </div>

                  {/* Prediction */}
                  <div>
                     <label className="nx-label mb-1.5 block">التوقع</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPrediction("bullish")}
                        className={cn(
                           "min-h-12 flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-semibold transition-colors border",
                          prediction === "bullish" ? "bg-success/15 text-success border-success/25" : "bg-secondary/40 text-muted-foreground border-border/10"
                        )}
                      >
                        <TrendingUp className="w-4 h-4" /> صعودي
                      </button>
                      <button
                        onClick={() => setPrediction("bearish")}
                        className={cn(
                           "min-h-12 flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-semibold transition-colors border",
                          prediction === "bearish" ? "bg-destructive/15 text-destructive border-destructive/25" : "bg-secondary/40 text-muted-foreground border-border/10"
                        )}
                      >
                        <TrendingDown className="w-4 h-4" /> هبوطي
                      </button>
                    </div>
                  </div>

                  {/* Timeframe */}
                  <div>
                     <label className="nx-label mb-1.5 block">الإطار الزمني</label>
                    <div className="flex gap-1.5">
                      {timeframes.map(tf => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={cn(
                             "flex-1 min-h-11 py-2 rounded-lg text-[14px] font-mono font-medium transition-colors border nx-ltr",
                            timeframe === tf ? "bg-accent/15 text-accent border-accent/20" : "bg-secondary/40 text-muted-foreground border-border/10"
                          )}
                        >{tf}</button>
                      ))}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="nx-label">درجة الثقة</label>
                      <span className="text-[13px] font-mono font-bold text-primary">{confidence}%</span>
                    </div>
                    <input
                      type="range" min={10} max={100} value={confidence}
                      onChange={e => setConfidence(Number(e.target.value))}
                      className="w-full accent-primary h-1.5"
                    />
                  </div>

                  <button
                    onClick={() => setStep(3)}
                     className="nx-btn-primary w-full"
                  >
                    التالي <ChevronLeft className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Step 3: Summary + Image */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {/* Selected asset chip */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                       "px-2.5 py-1 rounded-lg text-[13px] font-mono font-bold border nx-ltr",
                      prediction === "bullish" ? "text-success border-success/20 bg-success/5" : "text-destructive border-destructive/20 bg-destructive/5"
                    )}>
                      {prediction === "bullish" ? "📈" : "📉"} {pair} · {timeframe} · {confidence}%
                    </span>
                  </div>

                  {/* Summary */}
                  <div>
                     <label className="nx-label mb-1.5 block">ملخص التحليل</label>
                    <textarea
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      placeholder="اشرح تحليلك... مستويات الدعم والمقاومة، السيناريوهات المتوقعة..."
                       className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-3 text-[16px] leading-7 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 resize-none h-28"
                      dir="rtl"
                      autoFocus
                    />
                  </div>

                  {/* Image */}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border/20">
                      <img src={imagePreview} alt="preview" className="w-full max-h-36 object-cover" />
                      <button onClick={removeImage} className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/30 bg-secondary/20 text-muted-foreground hover:border-primary/20 hover:text-primary transition-colors"
                    >
                      <ImagePlus className="w-4 h-4" />
                       <span className="text-[15px] font-semibold">إضافة شارت (اختياري)</span>
                    </button>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!summary.trim()}
                     className="nx-btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" /> نشر في غرفة العمليات
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostDialog;
