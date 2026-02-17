import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TIPS_CACHE_KEY = "ai-coach-tip";
const TIPS_TTL = 30 * 60 * 1000; // 30 min

const FALLBACK_TIPS = [
  "💡 تذكّر: لا تخاطر بأكثر من 2% من رأس مالك في صفقة واحدة",
  "📊 راجع نسبة الفوز الخاصة بك — المتداولون المحترفون يحققون 40-60% فقط مع RR مرتفع",
  "🧠 التداول بدون خطة مثل القيادة بدون خريطة — حدّد نقاط الدخول والخروج مسبقاً",
  "⏰ أفضل أوقات التداول: افتتاح لندن (10:00 بتوقيت مكة) وافتتاح نيويورك (16:30)",
  "🎯 ركّز على 2-3 أزواج فقط — التشتت عدو الدقة",
];

const AICoachTip = () => {
  const { user } = useAuth();
  const [tip, setTip] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const loadTip = useCallback(async () => {
    try {
      const cached = localStorage.getItem(TIPS_CACHE_KEY);
      if (cached) {
        const { tip: cachedTip, ts } = JSON.parse(cached);
        if (Date.now() - ts < TIPS_TTL) {
          setTip(cachedTip);
          return;
        }
      }
    } catch {}

    if (user) {
      try {
        const { data } = await supabase.functions.invoke("asset-consultant", {
          body: {
            messages: [{ role: "user", content: "أعطني نصيحة تداول واحدة قصيرة (جملة واحدة فقط) مع إيموجي مناسب في البداية. كن مبتكراً ومختلفاً كل مرة." }],
            assetContext: { pair: "عام", price: 0, change: 0, rsi: 50, macd: "محايد", signal: "محايد", vol: "", category: "عام", up: true },
          },
        });
        if (data && typeof data === "string" && data.length > 10) {
          const cleanTip = data.slice(0, 120);
          setTip(cleanTip);
          localStorage.setItem(TIPS_CACHE_KEY, JSON.stringify({ tip: cleanTip, ts: Date.now() }));
          return;
        }
      } catch {}
    }

    const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    setTip(fallback);
    localStorage.setItem(TIPS_CACHE_KEY, JSON.stringify({ tip: fallback, ts: Date.now() }));
  }, [user]);

  useEffect(() => {
    loadTip();
  }, [loadTip]);

  if (!tip || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 relative overflow-hidden backdrop-blur-sm"
        style={{
          background: "linear-gradient(135deg, hsla(190, 100%, 50%, 0.04), hsla(43, 100%, 50%, 0.03))",
          border: "1px solid hsla(190, 100%, 50%, 0.08)",
        }}
      >
        <div className="w-6 h-6 rounded-lg bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
          <Brain className="w-3 h-3 text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            <span className="text-[8px] font-mono uppercase tracking-wider text-accent font-bold">AI Coach</span>
          </div>
          <p className="text-[10px] font-mono text-foreground/85 leading-relaxed">{tip}</p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICoachTip;
