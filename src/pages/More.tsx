import { motion } from "framer-motion";
import {
  Users, Brain, Target, Sun, User, Shield, Crown,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const menuItems = [
  {
    icon: Users,
    label: "غرفة العمليات",
    desc: "المجتمع والتوقعات والنقاشات",
    path: "/community",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/15",
  },
  {
    icon: Brain,
    label: "الأكاديمية الكمّية",
    desc: "تعلّم التداول بالذكاء الاصطناعي",
    path: "/academy",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/15",
  },
  {
    icon: Target,
    label: "الأوديسة المالية",
    desc: "تتبع أهدافك ومسار الثروة",
    path: "/goal-planner",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/15",
  },
  {
    icon: Sun,
    label: "الملخص الصباحي",
    desc: "تقرير السوق اليومي بالذكاء الاصطناعي",
    path: "/morning-brief",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/15",
  },
  {
    icon: User,
    label: "الملف الشخصي",
    desc: "إعدادات الحساب والتفضيلات",
    path: "/risk-calculator",
    color: "text-muted-foreground",
    bg: "bg-secondary",
    border: "border-border/20",
  },
  {
    icon: Shield,
    label: "حاسبة المخاطر",
    desc: "حجم الصفقة ونسبة المخاطرة للعائد",
    path: "/profile",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/15",
  },
  {
    icon: Crown,
    label: "الاشتراك",
    desc: "عرض خطة اشتراكك وتفاصيلها",
    path: "/subscription",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/15",
  },
];

const More = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-4 pb-28 space-y-3 max-w-lg mx-auto"
    >
      {menuItems.map((item) => (
        <motion.button
          key={item.label}
          variants={fadeUp}
          onClick={() => navigate(item.path)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all hover:brightness-110 text-right"
          style={{
            background: "hsla(240, 15%, 3.5%, 0.5)",
            border: "1px solid hsla(43, 100%, 50%, 0.06)",
          }}
        >
          <div className={`w-10 h-10 rounded-[10px] ${item.bg} flex items-center justify-center border ${item.border} shrink-0`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-mono font-bold text-foreground">{item.label}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{item.desc}</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        </motion.button>
      ))}
    </motion.div>
  );
};

export default More;
