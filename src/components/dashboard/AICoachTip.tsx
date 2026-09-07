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
            messages: [{ role: "user", content: "أعطني إشارة دخول تداول واحدة قصيرة (جملة واحدة فقط) مع إيموجي مناسب في البداية. كن مبتكراً ومختلفاً كل مرة." }],
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
        className="nx-card-flat flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[13px] font-semibold text-accent">مدرّب الذكاء الاصطناعي</span>
          </div>
          <p className="nx-body text-[14px] leading-relaxed">{tip}</p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="nx-tap flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICoachTip;
