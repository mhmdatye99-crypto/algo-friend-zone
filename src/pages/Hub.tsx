import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star, Trophy, Flame, BookOpen, LogOut, ShieldCheck,
  User, BarChart3, Crosshair, Plus, TrendingUp, TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import PerformanceSection from "@/components/hub/PerformanceSection";
import PredictionAchievements from "@/components/profile/PredictionAchievements";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useTradePerformance } from "@/hooks/useTradePerformance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const Hub = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSubscribed: hasSubscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  const { data: perf } = useTradePerformance();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "محلل";
  const initial = displayName.charAt(0).toUpperCase();

  const getRank = () => {
    if (!perf || perf.closedTrades === 0) return "مبتدئ";
    if (perf.winRate >= 60 && perf.closedTrades >= 50) return "محلل خبير";
    if (perf.winRate >= 50 && perf.closedTrades >= 20) return "محلل أول";
    if (perf.closedTrades >= 10) return "محلل";
    return "متدرب";
  };

  const reputation = perf ? Math.round(perf.closedTrades * perf.winRate / 10) : 0;

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
      {/* بطاقة المحلل المختصرة */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(190, 100%, 50%, 0.04) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center w-14 h-14 shrink-0">
            <span className="text-xl font-bold font-mono text-primary">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold truncate">{displayName}</h2>
            <p className="text-[10px] text-muted-foreground font-mono truncate">{user?.email}</p>
            <span className={cn(
              "text-[9px] font-mono font-bold inline-block px-2 py-0.5 rounded-md mt-1",
              hasSubscription ? "text-success bg-success/10" : "text-muted-foreground bg-secondary"
            )}>
              {hasSubscription ? "✓ اشتراك فعّال" : "بدون اشتراك"}
            </span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-card/60 rounded-xl p-2.5 text-center border border-border/10">
            <Star className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-[12px] font-bold font-mono">{reputation}</p>
            <p className="text-[8px] text-muted-foreground font-mono">نقاط XP</p>
          </div>
          <div className="bg-card/60 rounded-xl p-2.5 text-center border border-border/10">
            <Flame className="w-4 h-4 mx-auto mb-1 text-warning" />
            <p className="text-[12px] font-bold font-mono">{perf?.closedTrades || 0}</p>
            <p className="text-[8px] text-muted-foreground font-mono">صفقات مغلقة</p>
          </div>
          <div className="bg-card/60 rounded-xl p-2.5 text-center border border-border/10">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-[12px] font-bold font-mono">{getRank()}</p>
            <p className="text-[8px] text-muted-foreground font-mono">الرتبة</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate("/trade-journal")}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/8 border border-primary/15 hover:bg-primary/15 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div className="text-right">
            <p className="text-[11px] font-mono font-bold text-foreground">سجّل صفقة</p>
            <p className="text-[8px] text-muted-foreground font-mono">تسجيل صفقة جديدة</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/my-analyses")}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/8 border border-accent/15 hover:bg-accent/15 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <div className="text-right">
            <p className="text-[11px] font-mono font-bold text-foreground">التحليلات</p>
            <p className="text-[8px] text-muted-foreground font-mono">سجل التحليلات</p>
          </div>
        </button>
      </motion.div>

      {/* PnL Summary Card */}
      {perf && perf.closedTrades > 0 && (
        <motion.div
          variants={fadeUp}
          className="rounded-xl p-4 border border-border/20 bg-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">ملخص الأرباح</span>
            {perf.totalPnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
          <p className={cn(
            "text-2xl font-bold font-mono",
            perf.totalPnl >= 0 ? "text-success" : "text-destructive"
          )}>
            {perf.totalPnl >= 0 ? "+" : ""}${perf.totalPnl.toLocaleString()}
          </p>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-[9px] text-muted-foreground font-mono">معدل الفوز</p>
              <p className="text-[12px] font-bold font-mono text-primary">{perf.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-mono">عامل الربح</p>
              <p className="text-[12px] font-bold font-mono text-warning">
                {perf.profitFactor === Infinity ? "∞" : perf.profitFactor.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-mono">أفضل زوج</p>
              <p className="text-[12px] font-bold font-mono text-success">{perf.bestPair}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs: الأداء | الإنجازات */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-secondary/30 border border-border/20 rounded-xl h-10 p-1 gap-1">
            <TabsTrigger value="performance" className="text-[10px] font-mono font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              الأداء التفصيلي
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-[10px] font-mono font-medium data-[state=active]:bg-success/10 data-[state=active]:text-success rounded-lg flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              الإنجازات
            </TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="mt-3">
            <PerformanceSection />
          </TabsContent>
          <TabsContent value="achievements" className="mt-3">
            <PredictionAchievements />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* لوحة الإدارة */}
      {isAdmin && (
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all hover:brightness-110 text-right"
            style={{ background: "hsla(350, 80%, 50%, 0.06)", border: "1px solid hsla(350, 80%, 50%, 0.12)" }}
          >
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/15 shrink-0">
              <ShieldCheck className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-mono font-bold text-foreground">لوحة الإدارة</p>
              <p className="text-[9px] font-mono text-muted-foreground">إدارة المستخدمين والاشتراكات</p>
            </div>
          </button>
        </motion.div>
      )}

      {/* تسجيل الخروج */}
      <motion.button
        variants={fadeUp}
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-destructive text-[11px] font-mono font-bold hover:bg-destructive/10 transition-all border border-destructive/10"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default Hub;
