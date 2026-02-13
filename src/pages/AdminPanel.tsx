import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, Crown, Clock, Search, Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Navigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }),
};

interface UserSub {
  id: string;
  user_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  plan: { name_ar: string; duration_days: number } | null;
  profile: { display_name: string | null } | null;
}

const AdminPanel = () => {
  const { isAdmin, loading: authLoading } = useSubscription();
  const [subs, setSubs] = useState<UserSub[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New subscription form
  const [showForm, setShowForm] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: subsData }, { data: plansData }] = await Promise.all([
      supabase.from("user_subscriptions").select("*, plan:subscription_plans(name_ar, duration_days)").order("created_at", { ascending: false }),
      supabase.from("subscription_plans").select("*").eq("is_active", true),
    ]);

    // Fetch profiles for user display names
    if (subsData && subsData.length > 0) {
      const userIds = [...new Set(subsData.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const enriched = subsData.map(s => ({
        ...s,
        profile: profileMap.get(s.user_id) || null,
      }));
      setSubs(enriched as any);
    } else {
      setSubs([]);
    }

    setPlans(plansData || []);
    setLoading(false);
  };

  const handleActivate = async () => {
    if (!targetEmail || !selectedPlan) {
      toast.error("أدخل البريد الإلكتروني واختر الخطة");
      return;
    }

    setSaving(true);

    // Find user by email from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .ilike("display_name", `%${targetEmail}%`)
      .maybeSingle();

    if (!profile) {
      // Try to find by looking at the email in display_name or search broadly
      toast.error("لم يتم العثور على المستخدم. تأكد من أن المستخدم مسجّل في التطبيق.");
      setSaving(false);
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) {
      toast.error("خطة غير صالحة");
      setSaving(false);
      return;
    }

    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const { error } = await supabase.from("user_subscriptions").insert({
      user_id: profile.user_id,
      plan_id: selectedPlan,
      status: "active",
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      activated_by: "admin",
    });

    if (error) {
      toast.error("فشل تفعيل الاشتراك: " + error.message);
    } else {
      toast.success(`تم تفعيل اشتراك ${profile.display_name || "المستخدم"} بنجاح!`);
      setShowForm(false);
      setTargetEmail("");
      setSelectedPlan("");
      fetchData();
    }
    setSaving(false);
  };

  const handleCancel = async (subId: string) => {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subId);

    if (error) {
      toast.error("فشل إلغاء الاشتراك");
    } else {
      toast.success("تم إلغاء الاشتراك");
      fetchData();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const inputClass = "w-full bg-secondary/40 rounded-xl px-3 py-2.5 text-sm font-mono border border-border/20 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/30";

  return (
    <motion.div
      className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={fadeUp} custom={0}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono font-medium">لوحة الإدارة</p>
          <h1 className="text-xl font-bold tracking-tight">إدارة الاشتراكات</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-3 gap-2.5" variants={fadeUp} custom={1}>
        <div className="glass rounded-xl p-3 text-center">
          <Users className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-lg font-bold font-mono">{subs.length}</p>
          <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">إجمالي</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Crown className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold font-mono text-success">
            {subs.filter(s => s.status === "active" && new Date(s.expires_at) > new Date()).length}
          </p>
          <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">فعّال</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-destructive" />
          <p className="text-lg font-bold font-mono text-destructive">
            {subs.filter(s => s.status !== "active" || new Date(s.expires_at) <= new Date()).length}
          </p>
          <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">منتهي</p>
        </div>
      </motion.div>

      {/* Add Subscription */}
      <motion.div variants={fadeUp} custom={2}>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/25 hover:bg-primary/25 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          تفعيل اشتراك جديد
        </motion.button>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-4 mt-3 space-y-3"
          >
            <div>
              <label className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider block mb-1 font-medium">اسم المستخدم</label>
              <input
                placeholder="ابحث بالاسم..."
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider block mb-1 font-medium">الخطة</label>
              <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className={inputClass}>
                <option value="">اختر خطة...</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name_ar} — ${p.price} ({p.duration_days} يوم)</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={handleActivate}
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-2.5 rounded-xl bg-success/15 text-success text-xs font-mono font-bold border border-success/25 hover:bg-success/25 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <div className="w-3.5 h-3.5 border-2 border-success/30 border-t-success rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                تفعيل
              </motion.button>
              <motion.button
                onClick={() => setShowForm(false)}
                whileTap={{ scale: 0.97 }}
                className="py-2.5 px-4 rounded-xl bg-secondary/50 text-muted-foreground text-xs font-mono border border-border/20 hover:bg-secondary transition-all duration-200"
              >
                إلغاء
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Search */}
      <motion.div className="relative" variants={fadeUp} custom={3}>
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <input
          placeholder="ابحث عن مشترك..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={cn(inputClass, "pr-10")}
        />
      </motion.div>

      {/* Subscriptions List */}
      <motion.div className="space-y-2" variants={fadeUp} custom={4}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-xs text-muted-foreground font-mono">لا توجد اشتراكات بعد</p>
          </div>
        ) : (
          subs
            .filter(s => {
              if (!search) return true;
              return (s.profile?.display_name || "").toLowerCase().includes(search.toLowerCase());
            })
            .map((sub) => {
              const isActive = sub.status === "active" && new Date(sub.expires_at) > new Date();
              const daysLeft = Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

              return (
                <motion.div
                  key={sub.id}
                  className="glass rounded-xl p-3.5 flex items-center gap-3"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "bg-success/15 border border-success/25" : "bg-destructive/15 border border-destructive/25"
                  )}>
                    <Crown className={cn("w-4 h-4", isActive ? "text-success" : "text-destructive")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-mono truncate">
                      {sub.profile?.display_name || sub.user_id.slice(0, 8)}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono">
                      {sub.plan?.name_ar || "—"} • {isActive ? `${daysLeft} يوم متبقي` : sub.status === "cancelled" ? "ملغي" : "منتهي"}
                    </p>
                  </div>
                  {isActive && (
                    <motion.button
                      onClick={() => handleCancel(sub.id)}
                      whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </motion.div>
              );
            })
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;
