import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crosshair, TrendingUp, TrendingDown, Briefcase, BarChart3, Plus, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type CenterTab = "signals" | "trades" | "quick";

const filters = ["الكل", "فوركس", "كريبتو", "سلع", "مؤشرات"];

const TradeCenter = () => {
  const navigate = useNavigate();
  const { signals } = useSignals();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CenterTab>("signals");
  const [activeFilter, setActiveFilter] = useState("الكل");

  const filteredSignals = activeFilter === "الكل"
    ? signals
    : signals.filter(s => s.category === activeFilter);

  const { data: activeTrades = [] } = useQuery({
    queryKey: ["trades-open", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: recentTrades = [] } = useQuery({
    queryKey: ["trades-recent", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const tabs: { key: CenterTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "signals", label: "الإشارات", icon: <Zap className="w-3.5 h-3.5" />, badge: signals.filter(s => s.confidence >= 80).length },
    { key: "trades", label: "صفقاتي", icon: <Briefcase className="w-3.5 h-3.5" />, badge: activeTrades.length },
    { key: "quick", label: "سريع", icon: <Plus className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-4 pb-28 max-w-lg mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">LIVE SIGNALS</p>
        <h1 className="text-xl font-display font-bold text-foreground tracking-wide">
          <span className="text-gradient-gold">توصيات</span> حية
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-mono font-bold transition-all relative",
              activeTab === t.key
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary/40 text-muted-foreground border border-border/10"
            )}
          >
            {t.icon}
            {t.label}
            {t.badge && t.badge > 0 && (
              <span className="absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Signals Tab */}
      {activeTab === "signals" && (
        <div className="space-y-3">
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all duration-300",
                  activeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {signals.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {filteredSignals.map((signal) => (
                <SignalCardCollapsible key={signal.pair} signal={signal} />
              ))}
            </motion.div>
          )}

          {filteredSignals.length === 0 && signals.length > 0 && (
            <p className="text-center text-muted-foreground font-mono text-sm mt-10">
              لا توجد إشارات لهذه الفئة حالياً
            </p>
          )}
        </div>
      )}

      {/* Active Trades Tab */}
      {activeTab === "trades" && (
        <div className="space-y-3">
          {/* Open Trades */}
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">
            صفقات مفتوحة ({activeTrades.length})
          </p>
          {activeTrades.length === 0 ? (
            <div className="glass rounded-[14px] p-6 text-center">
              <Briefcase className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground font-mono">لا توجد صفقات مفتوحة</p>
            </div>
          ) : (
            activeTrades.map((trade: any) => (
              <div
                key={trade.id}
                onClick={() => navigate("/trade-journal")}
                className="glass rounded-[12px] p-3 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      trade.direction === "long" ? "bg-success/15" : "bg-destructive/15"
                    )}>
                      {trade.direction === "long"
                        ? <TrendingUp className="w-3.5 h-3.5 text-success" />
                        : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">
                        {new Date(trade.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-mono font-bold">{trade.entry_price}</p>
                    <p className="text-[9px] font-mono text-warning">مفتوحة</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Recent Closed */}
          {recentTrades.length > 0 && (
            <>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1 mt-4">
                آخر الصفقات المغلقة
              </p>
              {recentTrades.map((trade: any) => (
                <div key={trade.id} className="glass rounded-[12px] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center",
                        trade.direction === "long" ? "bg-success/15" : "bg-destructive/15"
                      )}>
                        {trade.direction === "long"
                          ? <TrendingUp className="w-3.5 h-3.5 text-success" />
                          : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                      <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                    </div>
                    <span className={cn(
                      "text-[12px] font-mono font-bold",
                      (trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          <button
            onClick={() => navigate("/trade-journal")}
            className="w-full py-2.5 rounded-lg bg-secondary/40 text-muted-foreground text-[11px] font-mono font-bold border border-border/10 hover:bg-secondary/60 transition-colors"
          >
            عرض السجل الكامل →
          </button>
        </div>
      )}

      {/* Quick Log Tab */}
      {activeTab === "quick" && (
        <div className="space-y-4">
          <div className="glass rounded-[14px] p-6 text-center">
            <Plus className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="text-sm font-bold font-mono mb-1">تسجيل سريع</h4>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">
              افتح سجل الصفقات لتسجيل صفقة جديدة بالتفاصيل الكاملة
            </p>
            <button
              onClick={() => navigate("/trade-journal")}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-[12px] font-mono font-bold hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4 inline-block ml-2" />
              تسجيل صفقة جديدة
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/risk-calculator")}
              className="glass rounded-[12px] p-4 text-center hover:bg-secondary/20 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-[11px] font-mono font-bold">حاسبة المخاطر</p>
              <p className="text-[9px] font-mono text-muted-foreground">حجم الصفقة المثالي</p>
            </button>
            <button
              onClick={() => navigate("/my-analyses")}
              className="glass rounded-[12px] p-4 text-center hover:bg-secondary/20 transition-colors"
            >
              <Crosshair className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-[11px] font-mono font-bold">سجل التحليلات</p>
              <p className="text-[9px] font-mono text-muted-foreground">تحليلاتك المحفوظة</p>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TradeCenter;
