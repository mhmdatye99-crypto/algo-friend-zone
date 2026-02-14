import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Target, Sun, Shield, Crown, ChevronLeft, LogOut, ShieldCheck,
  User, Star, Trophy, Flame, BookOpen, Bell, Palette, HelpCircle,
  Settings, Activity, Award, TrendingDown, Calculator, Wallet, Users,
  BarChart3
} from "lucide-react";
import PerformanceSection from "@/components/hub/PerformanceSection";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const stats = [
  { icon: Trophy, label: "الرتبة", value: "محلل أول", color: "text-primary" },
  { icon: Flame, label: "سلسلة التحليل", value: "14 يوم", color: "text-warning" },
  { icon: Star, label: "نقاط XP", value: "3,250", color: "text-primary" },
];

const performanceMetrics = [
  { label: "دقة التحليل", value: "72%", icon: Target },
  { label: "عامل الربح", value: "2.4", icon: Activity },
  { label: "نسبة شارب", value: "1.8", icon: Award },
  { label: "أقصى تراجع", value: "-8.2%", icon: TrendingDown },
];

interface MenuSection {
  title: string;
  items: {
    icon: any;
    label: string;
    desc: string;
    path: string;
    color: string;
    bg: string;
    border: string;
  }[];
}

const menuSections: MenuSection[] = [
  {
    title: "أدوات التداول",
    items: [
      { icon: BookOpen, label: "سجل الصفقات", desc: "تتبع وتحليل صفقاتك", path: "/trade-journal", color: "text-accent", bg: "bg-accent/10", border: "border-accent/15" },
      { icon: BarChart3, label: "سجل التحليلات", desc: "جميع تحليلاتك المحفوظة", path: "/my-analyses", color: "text-primary", bg: "bg-primary/10", border: "border-primary/15" },
      { icon: Calculator, label: "حاسبة المخاطر", desc: "حجم الصفقة ونسبة المخاطرة", path: "/risk-calculator", color: "text-success", bg: "bg-success/10", border: "border-success/15" },
      { icon: Target, label: "الأوديسة المالية", desc: "تتبع أهدافك ومسار الثروة", path: "/goal-planner", color: "text-warning", bg: "bg-warning/10", border: "border-warning/15" },
      { icon: Users, label: "غرفة العمليات", desc: "مجتمع المتداولين والتحليلات", path: "/community", color: "text-accent", bg: "bg-accent/10", border: "border-accent/15" },
    ],
  },
  {
    title: "الذكاء الاصطناعي",
    items: [
      { icon: Sun, label: "الملخص الصباحي", desc: "تقرير السوق اليومي بالـ AI", path: "/morning-brief", color: "text-warning", bg: "bg-warning/10", border: "border-warning/15" },
      { icon: Brain, label: "الأكاديمية الكمّية", desc: "تعلّم التداول بالذكاء الاصطناعي", path: "/academy", color: "text-primary", bg: "bg-primary/10", border: "border-primary/15" },
    ],
  },
  {
    title: "الحساب",
    items: [
      { icon: Crown, label: "الاشتراك", desc: "خطة اشتراكك وتفاصيلها", path: "/subscription", color: "text-primary", bg: "bg-primary/10", border: "border-primary/15" },
    ],
  },
];

const settingsItems = [
  { icon: Bell, label: "التنبيهات", desc: "إشعارات الإشارات والتحليلات" },
  { icon: Shield, label: "الأمان", desc: "كلمات المرور والمفاتيح" },
  { icon: Palette, label: "المظهر", desc: "تخصيص الألوان والسمة" },
  { icon: HelpCircle, label: "الدعم", desc: "المساعدة والأسئلة" },
];

const Hub = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSubscribed: hasSubscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPerf, setShowPerf] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "محلل";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-4 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* بطاقة المحلل */}
      <motion.div
        variants={fadeUp}
        className="rounded-[14px] p-5 text-center"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(190, 100%, 50%, 0.04) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.12)",
        }}
      >
        <div className="mx-auto mb-3 rounded-[14px] bg-primary/15 border border-primary/20 flex items-center justify-center w-16 h-16">
          <span className="text-2xl font-bold font-mono text-primary">{initial}</span>
        </div>
        <h2 className="text-base font-bold">{displayName}</h2>
        <p className="text-[10px] text-muted-foreground font-mono mb-1">{user?.email}</p>
        <span className={cn(
          "text-[10px] font-mono font-bold inline-block px-2 py-0.5 rounded-md",
          hasSubscription ? "text-success bg-success/10" : "text-muted-foreground bg-secondary"
        )}>
          {hasSubscription ? "✓ اشتراك فعّال" : "بدون اشتراك"}
        </span>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-secondary/40 rounded-[10px] p-2 border border-border/10">
              <s.icon className={cn("w-3.5 h-3.5 mx-auto mb-0.5", s.color)} />
              <p className="text-[11px] font-bold font-mono">{s.value}</p>
              <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Performance toggle */}
        <button
          onClick={() => setShowPerf(!showPerf)}
          className="mt-3 text-[10px] font-mono text-primary flex items-center gap-1 mx-auto hover:underline"
        >
          <BarChart3 className="w-3 h-3" />
          {showPerf ? "إخفاء الأداء" : "📊 عرض إحصائيات الأداء"}
        </button>

        <AnimatePresence>
          {showPerf && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                <PerformanceSection />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* أقسام القائمة */}
      {menuSections.map((section) => (
        <motion.div key={section.title} variants={fadeUp} className="space-y-1.5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-1 font-medium">
            {section.title}
          </p>
          <div className="rounded-[12px] overflow-hidden divide-y divide-border/5"
            style={{ background: "hsla(240, 15%, 3.5%, 0.5)", border: "1px solid hsla(43, 100%, 50%, 0.06)" }}
          >
            {section.items.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3.5 py-3 transition-all hover:bg-secondary/20 text-right"
              >
                <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center border shrink-0", item.bg, item.border)}>
                  <item.icon className={cn("w-4 h-4", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-mono font-bold text-foreground">{item.label}</p>
                  <p className="text-[9px] font-mono text-muted-foreground truncate">{item.desc}</p>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* الإعدادات */}
      <motion.div variants={fadeUp} className="space-y-1.5">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-1 font-medium flex items-center gap-1">
          <Settings className="w-3 h-3" /> الإعدادات
        </p>
        <div className="rounded-[12px] overflow-hidden divide-y divide-border/5"
          style={{ background: "hsla(240, 15%, 3.5%, 0.5)", border: "1px solid hsla(43, 100%, 50%, 0.06)" }}
        >
          {settingsItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3.5 py-3 transition-all hover:bg-secondary/20 text-right"
            >
              <div className="w-9 h-9 rounded-[10px] bg-secondary/50 flex items-center justify-center border border-border/10 shrink-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-mono font-bold text-foreground">{item.label}</p>
                <p className="text-[9px] font-mono text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* لوحة الإدارة */}
      {isAdmin && (
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] transition-all hover:brightness-110 text-right"
            style={{ background: "hsla(350, 80%, 50%, 0.06)", border: "1px solid hsla(350, 80%, 50%, 0.12)" }}
          >
            <div className="w-9 h-9 rounded-[10px] bg-destructive/10 flex items-center justify-center border border-destructive/15 shrink-0">
              <ShieldCheck className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-mono font-bold text-foreground">لوحة الإدارة</p>
              <p className="text-[9px] font-mono text-muted-foreground">إدارة المستخدمين والاشتراكات</p>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
          </button>
        </motion.div>
      )}

      {/* تسجيل الخروج */}
      <motion.button
        variants={fadeUp}
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-destructive text-[11px] font-mono font-bold hover:bg-destructive/10 transition-all border border-destructive/10"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default Hub;
