import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Calculator, Target, Sun, Brain, Crown,
  ScanLine, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const shortcuts = [
  { icon: Zap, label: "التوصيات", path: "/trade-center", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  { icon: ScanLine, label: "تحليل الشارت", path: "/chart-vision", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { icon: BookOpen, label: "سجل الصفقات", path: "/trade-journal", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  { icon: Calculator, label: "حاسبة المخاطر", path: "/risk-calculator", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { icon: Crown, label: "التحديات", path: "/challenges", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  { icon: Brain, label: "مركز الذكاء", path: "/nexus-brain", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { icon: Sun, label: "الملخص", path: "/morning-brief", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  { icon: Target, label: "مسار النمو", path: "/goal-planner", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
];

const QuickAccessGrid = () => {
  const navigate = useNavigate();

  return (
    <div>
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 px-1">
        وصول سريع
      </p>
      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map((s, i) => (
          <motion.button
            key={s.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(s.path)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all hover:brightness-125 active:scale-95",
              s.bg, s.border
            )}
          >
            <s.icon className={cn("w-5 h-5", s.color)} />
            <span className="text-[10px] font-mono font-bold text-foreground leading-tight">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid;
