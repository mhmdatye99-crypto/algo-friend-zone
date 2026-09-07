import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ScanLine, Brain, Users, UserCircle, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: BarChart3,
    title: "مركز استخبارات التداول",
    subtitle: "توصيات حية، نسبة ثقة AI، مؤشر المخاطرة، ومنحنى رأس المال — كل شيء في لوحة واحدة",
    color: "var(--primary)",
  },
  {
    icon: ScanLine,
    title: "ماسح الأسواق بالذكاء الاصطناعي",
    subtitle: "التقط صورة لأي شارت أو ابحث عن أي زوج واحصل على تحليل مؤسسي فوري",
    color: "var(--primary)",
  },
  {
    icon: Brain,
    title: "المُرشد — مدربك الشخصي",
    subtitle: "يتابع انضباطك، يحلل سلوكك، ويقدم نصائح مخصصة لتطوير أدائك",
    color: "var(--primary)",
  },
  {
    icon: Users,
    title: "المجتمع والتحديات",
    subtitle: "تحديات أسبوعية، تصنيفات، وشارات إنجاز — الانضباط أهم من الربح",
    color: "var(--primary)",
  },
  {
    icon: UserCircle,
    title: "ملفك المهني",
    subtitle: "إحصائيات أدائك، سجل صفقاتك، ومنحنى نموّك كمتداول محترف",
    color: "var(--primary)",
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
              background: `hsl(${slide.color} / 0.12)`,
              border: `1px solid hsl(${slide.color} / 0.25)`,
              boxShadow: `0 0 40px hsl(${slide.color} / 0.15)`,
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Icon className="w-9 h-9" style={{ color: `hsl(${slide.color})` }} />
          </motion.div>

          <p className="text-[13px] font-mono text-muted-foreground mb-1 tracking-widest">
            {current + 1} / {slides.length}
          </p>
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

      <button onClick={onComplete} className="mt-3 text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">
        تخطي
      </button>
    </div>
  );
};

export default OnboardingSlides;
