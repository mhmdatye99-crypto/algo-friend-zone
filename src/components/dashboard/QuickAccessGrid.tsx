import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Calculator, Target, Sun, Brain, Crown,
  ScanLine, Zap
} from "lucide-react";

const shortcuts = [
  { icon: Zap, label: "التوصيات", path: "/signals" },
  { icon: ScanLine, label: "تحليل الشارت", path: "/chart-analysis" },
  { icon: BookOpen, label: "سجل الصفقات", path: "/journal" },
  { icon: Calculator, label: "حاسبة المخاطر", path: "/tools" },
  { icon: Crown, label: "التحديات", path: "/community" },
  { icon: Brain, label: "مركز الذكاء", path: "/learning" },
  { icon: Sun, label: "الملخص", path: "/morning-brief" },
  { icon: Target, label: "مسار النمو", path: "/tools" },
];

const QuickAccessGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <p className="nx-label px-1">وصول سريع</p>
      <div className="grid grid-cols-4 gap-2.5">
        {shortcuts.map((s, i) => (
          <motion.button
            key={s.path}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(s.path)}
            className="nx-tap flex flex-col items-center gap-1.5 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all"
          >
            <s.icon className="w-5 h-5 text-primary" />
            <span className="text-[12px] font-medium text-foreground leading-tight text-center">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid;
