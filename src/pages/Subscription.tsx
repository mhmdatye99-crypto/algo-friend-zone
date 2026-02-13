import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Clock, Sparkles, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }),
};

interface Plan {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
}

const Subscription = () => {
  const { subscription, isSubscribed, loading } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      setPlans((data || []).map(p => ({ ...p, features: (p.features as string[]) || [] })));
      setPlansLoading(false);
    };
    fetchPlans();
  }, []);

  const daysRemaining = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const allFeatures = [
    "إشارات تداول غير محدودة",
    "مستشار Alpha AI بدون قيود",
    "ChartVision — تحليل الرسوم البيانية",
    "الأكاديمية الكمّية الكاملة",
    "الملخص الصباحي اليومي",
    "غرفة العمليات والمجتمع",
    "حاسبة المخاطر المتقدمة",
    "الأوديسة المالية — مسار الثروة",
  ];

  return (
    <motion.div
      className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono font-medium">الاشتراك</p>
        <h1 className="text-xl font-bold tracking-tight">خطة الاشتراك</h1>
      </motion.div>

      {/* Current Status */}
      {isSubscribed && subscription ? (
        <motion.div
          className="glass rounded-2xl p-5 glow-gold"
          variants={fadeUp} custom={1}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono">اشتراك فعّال</h3>
              <p className="text-[11px] text-muted-foreground font-mono">
                {subscription.plan?.name_ar || "Premium"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/40 rounded-xl p-3 border border-border/10">
              <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider mb-1">ينتهي في</p>
              <p className="text-xs font-bold font-mono">
                {new Date(subscription.expires_at).toLocaleDateString("ar-EG")}
              </p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-3 border border-border/10">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-primary" />
                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">متبقي</p>
              </div>
              <p className="text-xs font-bold font-mono text-primary mt-1">{daysRemaining} يوم</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="glass rounded-2xl p-5 text-center"
          variants={fadeUp} custom={1}
        >
          <div className="w-14 h-14 mx-auto rounded-xl bg-muted/30 border border-border/20 flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-bold mb-1">لا يوجد اشتراك فعّال</h3>
          <p className="text-[11px] text-muted-foreground font-mono">
            تواصل مع المشرف لتفعيل اشتراكك
          </p>
        </motion.div>
      )}

      {/* Plans */}
      <motion.div variants={fadeUp} custom={2}>
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-3">الخطط المتاحة</h2>
        <div className="space-y-3">
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : plans.map((plan, i) => {
            const isPopular = plan.name === "Quarterly";
            return (
              <motion.div
                key={plan.id}
                className={cn(
                  "glass rounded-xl p-4 relative overflow-hidden",
                  isPopular && "border-primary/30 glow-gold"
                )}
                variants={fadeUp}
                custom={3 + i}
                whileHover={{ scale: 1.01 }}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[8px] font-mono font-bold px-3 py-1 rounded-br-lg border-b border-r border-primary/20">
                    <Sparkles className="w-2.5 h-2.5 inline mr-1" />الأكثر شعبية
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-mono">{plan.name_ar}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{plan.description}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold font-mono text-primary">${plan.price}</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{plan.duration_days} يوم</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div variants={fadeUp} custom={6}>
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-3">ميزات الاشتراك</h2>
        <div className="glass rounded-xl p-4 space-y-2.5">
          {allFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] font-mono text-foreground/80">{f}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        className="glass rounded-xl p-4 text-center"
        variants={fadeUp} custom={7}
      >
        <p className="text-[11px] text-muted-foreground font-mono">
          للاشتراك أو التجديد، تواصل مع المشرف عبر التطبيق أو البريد الإلكتروني
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Subscription;
