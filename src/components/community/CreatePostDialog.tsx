import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Send, Sparkles, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { pair: string; prediction: "bullish" | "bearish"; ai_confidence: number; analysis_summary: string; timeframe: string; image?: File | null }) => void;
}

const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "EUR/USD", "GBP/USD", "GOLD", "XRP/USDT", "BNB/USDT"];
const timeframes = ["1H", "4H", "D1", "W1"];

const CreatePostDialog = ({ open, onClose, onCreate }: Props) => {
  const [pair, setPair] = useState("BTC/USDT");
  const [prediction, setPrediction] = useState<"bullish" | "bearish">("bullish");
  const [confidence, setConfidence] = useState(70);
  const [summary, setSummary] = useState("");
  const [timeframe, setTimeframe] = useState("4H");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!summary.trim()) return;
    onCreate({ pair, prediction, ai_confidence: confidence, analysis_summary: summary, timeframe, image: imageFile });
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
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-strong rounded-t-2xl p-5 space-y-4 safe-area-bottom"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-mono font-bold">نشر تحليل جديد</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Pair Selection */}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">الأصل</label>
              <div className="flex flex-wrap gap-1.5">
                {pairs.map(p => (
                  <button
                    key={p}
                    onClick={() => setPair(p)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all border",
                      pair === p ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border/10 hover:bg-secondary/80"
                    )}
                  >{p}</button>
                ))}
              </div>
            </div>

            {/* Prediction */}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">التوقع</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPrediction("bullish")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-mono font-bold transition-all border",
                    prediction === "bullish" ? "bg-success/20 text-success border-success/30 glow-success" : "bg-secondary text-muted-foreground border-border/10"
                  )}
                >
                  <TrendingUp className="w-4 h-4" /> صعودي
                </button>
                <button
                  onClick={() => setPrediction("bearish")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-mono font-bold transition-all border",
                    prediction === "bearish" ? "bg-destructive/20 text-destructive border-destructive/30 glow-danger" : "bg-secondary text-muted-foreground border-border/10"
                  )}
                >
                  <TrendingDown className="w-4 h-4" /> هبوطي
                </button>
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">الإطار الزمني</label>
              <div className="flex gap-1.5">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all border",
                      timeframe === tf ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border/10"
                    )}
                  >{tf}</button>
                ))}
              </div>
            </div>

            {/* Confidence Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">درجة الثقة</label>
                <span className="text-[12px] font-mono font-bold text-primary">{confidence}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-primary h-1.5"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">ملخص التحليل</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="اشرح تحليلك... مستويات الدعم والمقاومة، المؤشرات الفنية، السيناريوهات..."
                className="w-full bg-secondary/60 border border-border/30 rounded-xl px-3 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 resize-none h-20"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">صورة / شارت (اختياري)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border/30">
                  <img src={imagePreview} alt="preview" className="w-full max-h-40 object-cover" />
                  <button onClick={removeImage} className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-[11px] font-mono">إضافة صورة أو شارت</span>
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!summary.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-[13px] hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-gold"
            >
              <Send className="w-4 h-4" /> نشر في غرفة العمليات
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostDialog;
