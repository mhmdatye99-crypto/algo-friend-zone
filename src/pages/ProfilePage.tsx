import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Star, Trophy, Flame, BookOpen, LogOut, ShieldCheck,
  User, BarChart3, Crosshair, TrendingUp, TrendingDown,
  Settings, Crown, Target, ChevronLeft
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
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSubscribed: hasSubscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: perf } = useTradePerformance();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  // Equity curve
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["profile-equity", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("status", "closed")
        .order("closed_at", { ascending: true }).limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "متداول";
  const initial = displayName.charAt(0).toUpperCase();

  const getRank = () => {
    if (!perf || perf.closedTrades === 0) return "مبتدئ";
    if (perf.winRate >= 60 && perf.closedTrades >= 50) return "خبير";
    if (perf.winRate >= 50 && perf.closedTrades >= 20) return "محترف";
    if (perf.closedTrades >= 10) return "متوسط";
    return "مبتدئ";
  };

  const avgRR = useMemo(() => {
    if (closedTrades.length === 0) return "—";
    const withRR = closedTrades.filter((t: any) => t.take_profit && t.stop_loss && t.entry_price);
    if (withRR.length === 0) return "—";
    const avg = withRR.reduce((sum: number, t: any) => {
      const risk = Math.abs(t.entry_price - t.stop_loss);
      const reward = Math.abs(t.take_profit - t.entry_price);
      return sum + (risk > 0 ? reward / risk : 0);
    }, 0) / withRR.length;
    return `1:${avg.toFixed(1)}`;
  }, [closedTrades]);

  const maxDrawdown = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    let peak = 0, maxDd = 0, running = 0;
    closedTrades.forEach((t: any) => {
      running += (t.pnl ?? 0);
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDd) maxDd = dd;
    });
    return maxDd;
  }, [closedTrades]);

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="px-4 pt-3 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">لوحة الأداء</p>
        <h1 className="text-lg font-bold">Performance <span className="text-gradient-gold">Dashboard</span></h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={fadeUp} className="rounded-xl p-4" style={{
        background: "linear-gradient(135deg, hsla(220, 20%, 12%, 0.6) 0%, hsla(220, 20%, 8%, 0.8) 100%)",
        border: "1px solid hsla(220, 14%, 16%, 0.5)",
      }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold font-mono text-primary">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-bold truncate">{displayName}</h2>
            <p className="text-[9px] text-muted-foreground font-mono truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-[8px] font-mono font-bold px-2 py-0.5 rounded-md",
                hasSubscription ? "text-success bg-success/10" : "text-muted-foreground bg-secondary"
              )}>
                {hasSubscription ? "✓ Pro" : "Free"}
              </span>
              <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">{getRank()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2">
        {[
          { label: "إجمالي الصفقات", value: `${perf?.closedTrades ?? 0}`, icon: BarChart3, color: "text-primary" },
          { label: "معدل الفوز", value: `${(perf?.winRate ?? 0).toFixed(0)}%`, icon: TrendingUp, color: (perf?.winRate ?? 0) >= 50 ? "text-success" : "text-destructive" },
          { label: "R:R المتوسط", value: avgRR, icon: Target, color: "text-accent" },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl p-3 bg-card/60 border border-border/10 text-center">
            <kpi.icon className={cn("w-4 h-4 mx-auto mb-1", kpi.color)} />
            <p className={cn("text-lg font-mono font-bold", kpi.color)}>{kpi.value}</p>
            <p className="text-[7px] font-mono text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3 bg-card/60 border border-border/10 text-center">
          <p className="text-[8px] font-mono text-muted-foreground">P&L الإجمالي</p>
          <p className={cn("text-lg font-mono font-bold", (perf?.totalPnl ?? 0) >= 0 ? "text-success" : "text-destructive")}>
            {(perf?.totalPnl ?? 0) >= 0 ? "+" : ""}${(perf?.totalPnl ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl p-3 bg-card/60 border border-border/10 text-center">
          <p className="text-[8px] font-mono text-muted-foreground">أقصى تراجع</p>
          <p className="text-lg font-mono font-bold text-destructive">${maxDrawdown.toFixed(0)}</p>
        </div>
      </motion.div>

      {/* Equity Curve Full */}
      {closedTrades.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl p-4 bg-card/60 border border-border/10">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> منحنى رأس المال
          </p>
          <div className="h-24 flex items-end gap-0.5">
            {closedTrades.map((t: any, i: number) => {
              const pnl = t.pnl ?? 0;
              const max = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
              const h = Math.max((Math.abs(pnl) / max) * 100, 4);
              return <div key={i} className={cn("flex-1 rounded-t-sm", pnl >= 0 ? "bg-success/50" : "bg-destructive/50")} style={{ height: `${h}%` }} />;
            })}
          </div>
        </motion.div>
      )}

      {/* Tabs: Performance | Achievements | History */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary/30 border border-border/20 rounded-xl h-10 p-1">
            <TabsTrigger value="performance" className="text-[9px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              الأداء
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-[9px] font-mono data-[state=active]:bg-success/10 data-[state=active]:text-success rounded-lg">
              الإنجازات
            </TabsTrigger>
            <TabsTrigger value="history" className="text-[9px] font-mono data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-lg">
              السجل
            </TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="mt-3">
            <PerformanceSection />
          </TabsContent>
          <TabsContent value="achievements" className="mt-3">
            <PredictionAchievements />
          </TabsContent>
          <TabsContent value="history" className="mt-3 space-y-1.5">
            {closedTrades.length === 0 ? (
              <div className="rounded-xl p-6 bg-card/40 border border-border/10 text-center">
                <p className="text-[11px] font-mono text-muted-foreground">لا توجد صفقات مغلقة بعد</p>
              </div>
            ) : (
              closedTrades.slice(-15).reverse().map((trade: any) => (
                <div key={trade.id} className="rounded-lg px-3 py-2 bg-card/60 border border-border/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-md flex items-center justify-center",
                      trade.direction === "long" ? "bg-success/10" : "bg-destructive/10")}>
                      {trade.direction === "long" ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[8px] font-mono text-muted-foreground">
                        {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                  </div>
                  <span className={cn("text-[11px] font-mono font-bold", (trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive")}>
                    {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
        <button onClick={() => navigate("/trade-journal")} className="flex items-center gap-2 p-3 rounded-xl bg-primary/8 border border-primary/15 hover:bg-primary/12 transition-all">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono font-bold">سجل الصفقات</span>
        </button>
        <button onClick={() => navigate("/risk-calculator")} className="flex items-center gap-2 p-3 rounded-xl bg-accent/8 border border-accent/15 hover:bg-accent/12 transition-all">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-mono font-bold">حاسبة المخاطر</span>
        </button>
      </motion.div>

      {!hasSubscription && (
        <motion.button variants={fadeUp} onClick={() => navigate("/subscription")}
          className="w-full rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(280, 80%, 60%, 0.06) 100%)", border: "1px solid hsla(43, 100%, 50%, 0.12)" }}>
          <Crown className="w-5 h-5 text-amber-400" />
          <div className="flex-1 text-right">
            <p className="text-[11px] font-mono font-bold">ترقية إلى Pro</p>
            <p className="text-[8px] font-mono text-muted-foreground">فتح جميع الميزات المتقدمة</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-amber-400" />
        </motion.button>
      )}

      {isAdmin && (
        <motion.div variants={fadeUp}>
          <button onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-all">
            <ShieldCheck className="w-4 h-4 text-destructive" />
            <span className="text-[11px] font-mono font-bold">لوحة الإدارة</span>
          </button>
        </motion.div>
      )}

      <motion.button variants={fadeUp} onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-destructive text-[11px] font-mono font-bold hover:bg-destructive/10 transition-all border border-destructive/10">
        <LogOut className="w-4 h-4" /> تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default ProfilePage;
