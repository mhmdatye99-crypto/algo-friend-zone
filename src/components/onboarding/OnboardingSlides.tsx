import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Users, Target, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: ScanLine,
    title: "حلّل أي شارت بالذكاء الاصطناعي",
    subtitle: "التقط صورة لأي شارت واحصل على تحليل مؤسسي فوري",
    color: "43, 100%, 50%",
  },
  {
    icon: Users,
    title: "تابع إشارات ألفا من الحيتان",
    subtitle: "إشارات حية من أقوى المتداولين مع نقاط الدخول والأهداف",
    color: "190, 100%, 50%",
  },
  {
    icon: Target,
    title: "ارسم مسارك نحو $1M",
    subtitle: "خطط أهدافك المالية وتتبع تقدمك يومياً",
    color: "300, 80%, 50%",
  },
];

interface Props {
  onComplete: () => void;
}

const OnboardingSlides = ({ onComplete }: Props) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center" dir="rtl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: `hsla(${slide.color}, 0.12)`,
              border: `1px solid hsla(${slide.color}, 0.25)`,
              boxShadow: `0 0 40px hsla(${slide.color}, 0.15)`,
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Icon className="w-9 h-9" style={{ color: `hsl(${slide.color})` }} />
          </motion.div>
          <h2 className="text-lg font-display font-bold mb-2">{slide.title}</h2>
          <p className="text-sm font-mono text-muted-foreground max-w-xs">{slide.subtitle}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              background: i === current ? `hsl(${slides[current].color})` : "hsl(var(--muted))",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
        {current > 0 && (
          <button onClick={prev} className="p-2.5 rounded-xl bg-secondary/50 border border-border/20">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="flex-1 py-3 rounded-xl text-sm font-mono font-bold btn-nexus text-primary"
        >
          {current === slides.length - 1 ? "ابدأ الآن" : "التالي"}
        </motion.button>
      </div>

      <button onClick={onComplete} className="mt-3 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors">
        تخطي
      </button>
    </div>
  );
};

export default OnboardingSlides;
