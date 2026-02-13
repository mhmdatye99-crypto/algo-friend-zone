import { motion } from "framer-motion";
import {
  Brain, Target, Sun, User, Shield, Crown,
  ChevronLeft, LogOut, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    icon: Shield,
    label: "حاسبة المخاطر",
    desc: "حجم الصفقة ونسبة المخاطرة للعائد",
    path: "/risk-calculator",
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
  {
    icon: User,
    label: "الملف الشخصي",
    desc: "إعدادات الحساب والتفضيلات",
    path: "/profile",
    color: "text-muted-foreground",
    bg: "bg-secondary",
    border: "border-border/20",
  },
];

const More = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSubscribed: hasSubscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
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
      className="px-4 pt-4 pb-28 space-y-3 max-w-lg mx-auto"
    >
      {/* بطاقة المستخدم */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 px-4 py-4 rounded-[12px]"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(190, 100%, 50%, 0.04) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.12)",
        }}
      >
        <div className="w-12 h-12 rounded-[12px] bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold font-mono text-primary">{initial}</span>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-mono font-bold text-foreground">{displayName}</p>
          <p className="text-[10px] font-mono text-muted-foreground">{user?.email}</p>
          <span className={`text-[10px] font-mono font-bold ${hasSubscription ? "text-success" : "text-muted-foreground"}`}>
            {hasSubscription ? "✓ اشتراك فعّال" : "بدون اشتراك"}
          </span>
        </div>
      </motion.div>

      {/* القائمة */}
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

      {/* لوحة الإدارة */}
      {isAdmin && (
        <motion.button
          variants={fadeUp}
          onClick={() => navigate("/admin")}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all hover:brightness-110 text-right"
          style={{
            background: "hsla(350, 80%, 50%, 0.06)",
            border: "1px solid hsla(350, 80%, 50%, 0.12)",
          }}
        >
          <div className="w-10 h-10 rounded-[10px] bg-destructive/10 flex items-center justify-center border border-destructive/15 shrink-0">
            <ShieldCheck className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-mono font-bold text-foreground">لوحة الإدارة</p>
            <p className="text-[10px] font-mono text-muted-foreground">إدارة المستخدمين والاشتراكات</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        </motion.button>
      )}

      {/* تسجيل الخروج */}
      <motion.button
        variants={fadeUp}
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all hover:brightness-110 text-right"
        style={{
          background: "hsla(240, 15%, 3.5%, 0.5)",
          border: "1px solid hsla(0, 0%, 50%, 0.08)",
        }}
      >
        <div className="w-10 h-10 rounded-[10px] bg-destructive/10 flex items-center justify-center border border-destructive/15 shrink-0">
          <LogOut className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-mono font-bold text-destructive">تسجيل الخروج</p>
          <p className="text-[10px] font-mono text-muted-foreground">الخروج من الحساب</p>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default More;
