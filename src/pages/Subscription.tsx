import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, Clock, Sparkles, Shield, Zap, ArrowLeft, Loader2, ExternalLink, CheckCircle2, Settings } from "lucide-react";
import { useSubscription, STRIPE_TIERS, type StripeTier } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }),
};

const plans = [
  {
    tier: "free" as StripeTier,
    name: "Free",
    name_ar: "مجاني",
    price: 0,
    features: [
      "إشارات مؤجلة",
      "تحليلات محدودة",
      "المجتمع — قراءة فقط",
      "حاسبة المخاطر الأساسية",
    ],
    color: "muted-foreground",
  },
  {
    tier: "pro" as StripeTier,
    name: "X-Pro",
    name_ar: "إكس-برو",
    price: STRIPE_TIERS.pro.price,
    priceId: STRIPE_TIERS.pro.price_id,
    features: [
      "إشارات تداول لحظية",
      "AI Scan — تحليل الشارت",
      "إحصائيات أداء كاملة",
      "مستشار Alpha AI",
      "الأكاديمية الكمّية",
      "الملخص الصباحي",
    ],
    color: "primary",
    popular: true,
  },
  {
    tier: "elite" as StripeTier,
    name: "X-Elite",
    name_ar: "إكس-إيليت",
    price: STRIPE_TIERS.elite.price,
    priceId: STRIPE_TIERS.elite.price_id,
    features: [
      "كل ميزات X-Pro",
      "تنبيهات أولوية VIP",
      "رؤى AI متقدمة",
      "غرفة العمليات الخاصة",
      "الأوديسة المالية",
      "دعم أولوية",
    ],
    color: "accent",
  },
];

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isSubscribed, stripeTier, stripeSubscriptionEnd,
    startCheckout, openCustomerPortal, checkoutLoading,
    refreshSubscription, loading,
  } = useSubscription();

  // Handle success/cancel redirects
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("تم الاشتراك بنجاح! 🎉");
      refreshSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast.info("تم إلغاء عملية الدفع");
    }
  }, [searchParams, refreshSubscription]);

  const handleSubscribe = (tier: "pro" | "elite") => {
    if (!user) {
      toast.error("سجّل دخولك أولاً");
      navigate("/auth");
      return;
    }
    startCheckout(tier);
  };

  const daysRemaining = stripeSubscriptionEnd
    ? Math.max(0, Math.ceil((new Date(stripeSubscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

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

      {/* Active Subscription Banner */}
      {isSubscribed && stripeTier !== "free" && (
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
                {stripeTier === "elite" ? "X-Elite" : "X-Pro"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-secondary/40 rounded-xl p-3 border border-border/10">
              <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider mb-1">ينتهي في</p>
              <p className="text-xs font-bold font-mono">
                {stripeSubscriptionEnd ? new Date(stripeSubscriptionEnd).toLocaleDateString("ar-EG") : "—"}
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
          <button
            onClick={openCustomerPortal}
            className="w-full py-2.5 rounded-xl bg-secondary/60 text-foreground text-[11px] font-mono font-bold flex items-center justify-center gap-2 border border-border/10 hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> إدارة الاشتراك
          </button>
        </motion.div>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {searchParams.get("success") === "true" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="glass rounded-2xl p-6 text-center glow-gold"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            >
              <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-3" />
            </motion.div>
            <h3 className="text-base font-bold mb-1">تم الاشتراك بنجاح!</h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              مبروك! تم تفعيل اشتراكك. استمتع بجميع الميزات المتقدمة.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans */}
      <motion.div variants={fadeUp} custom={2}>
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-3">اختر خطتك</h2>
        <div className="space-y-3">
          {plans.map((plan, i) => {
            const isCurrentPlan = plan.tier === stripeTier;
            const isUpgrade = (plan.tier === "pro" && stripeTier === "free") ||
                              (plan.tier === "elite" && (stripeTier === "free" || stripeTier === "pro"));

            return (
              <motion.div
                key={plan.tier}
                className={cn(
                  "glass rounded-xl p-4 relative overflow-hidden transition-all",
                  plan.popular && "border-primary/30 glow-gold",
                  isCurrentPlan && "border-primary/50 ring-1 ring-primary/20"
                )}
                variants={fadeUp}
                custom={3 + i}
                whileHover={{ scale: 1.01 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[8px] font-mono font-bold px-3 py-1 rounded-br-lg border-b border-r border-primary/20">
                    <Sparkles className="w-2.5 h-2.5 inline mr-1" />الأكثر شعبية
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-success/20 text-success text-[8px] font-mono font-bold px-3 py-1 rounded-bl-lg border-b border-l border-success/20">
                    <Check className="w-2.5 h-2.5 inline mr-1" />خطتك الحالية
                  </div>
                )}

                <div className="flex items-center justify-between mb-3 mt-1">
                  <div>
                    <h3 className="text-sm font-bold font-mono">{plan.name_ar}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{plan.name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold font-mono text-primary">
                      {plan.price === 0 ? "مجاني" : `$${plan.price}`}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-[9px] text-muted-foreground font-mono">/ شهرياً</p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 mb-3">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <Check className={cn("w-3 h-3 shrink-0", `text-${plan.color}`)} />
                      <p className="text-[10px] font-mono text-foreground/70">{f}</p>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {plan.tier !== "free" && !isCurrentPlan && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSubscribe(plan.tier as "pro" | "elite")}
                    disabled={checkoutLoading}
                    className={cn(
                      "w-full py-3 rounded-xl font-mono font-bold text-[11px] flex items-center justify-center gap-2 transition-all",
                      plan.tier === "elite"
                        ? "bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 text-accent hover:from-accent/30 hover:to-primary/30"
                        : "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary hover:from-primary/30 hover:to-accent/30"
                    )}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {isUpgrade ? "ترقية الآن" : "اشترك الآن"}
                        <ExternalLink className="w-3 h-3" />
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Security Note */}
      <motion.div
        className="glass rounded-xl p-4 flex items-start gap-3"
        variants={fadeUp} custom={7}
      >
        <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-mono font-bold text-foreground/70 mb-1">دفع آمن عبر Stripe</p>
          <p className="text-[9px] text-muted-foreground font-mono leading-relaxed">
            جميع عمليات الدفع مشفرة ومعالجة بأمان عبر Stripe. لا نحفظ بيانات بطاقتك على خوادمنا.
            يمكنك الإلغاء في أي وقت من إدارة الاشتراك.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Subscription;
