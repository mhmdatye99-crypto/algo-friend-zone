import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crosshair, TrendingUp, TrendingDown, Briefcase, BarChart3, Plus, Zap, AlertTriangle,
  Brain, Shield, BarChart, Layers,
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

type CenterTab = "signals" | "performance" | "how-it-works";

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

  // Performance data from trades
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["trades-closed-all", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const perfStats = useMemo(() => {
    if (closedTrades.length === 0) return null;
    const wins = closedTrades.filter((t: any) => (t.pnl ?? 0) > 0).length;
    const totalPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl ?? 0), 0);
    const winRate = (wins / closedTrades.length) * 100;
    return { winRate, totalPnl, total: closedTrades.length, wins };
  }, [closedTrades]);

  const tabs: { key: CenterTab; label: string; icon: React.ReactNode }[] = [
    { key: "signals", label: "التوصيات", icon: <Zap className="w-3.5 h-3.5" /> },
    { key: "performance", label: "الأداء", icon: <BarChart className="w-3.5 h-3.5" /> },
    { key: "how-it-works", label: "كيف يعمل", icon: <Brain className="w-3.5 h-3.5" /> },
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
          </button>
        ))}
      </motion.div>

      {/* Signals Tab */}
      {activeTab === "signals" && (
        <div className="space-y-3">
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

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
              <p className="text-2xl font-mono font-bold text-primary">{perfStats ? `${perfStats.winRate.toFixed(0)}%` : "—"}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total P&L</p>
              <p className={cn("text-2xl font-mono font-bold", (perfStats?.totalPnl ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                {perfStats ? `${perfStats.totalPnl >= 0 ? "+" : ""}$${perfStats.totalPnl.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          {/* Equity curve placeholder */}
          <div className="glass rounded-xl p-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Equity Curve
            </p>
            {closedTrades.length > 0 ? (
              <div className="h-32 flex items-end gap-1">
                {closedTrades.slice(0, 20).reverse().map((t: any, i: number) => {
                  const pnl = t.pnl ?? 0;
                  const maxPnl = Math.max(...closedTrades.map((tt: any) => Math.abs(tt.pnl ?? 0)), 1);
                  const height = Math.max((Math.abs(pnl) / maxPnl) * 100, 8);
                  return (
                    <div
                      key={i}
                      className={cn("flex-1 rounded-t-sm transition-all", pnl >= 0 ? "bg-primary/60" : "bg-destructive/60")}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-[11px] font-mono text-muted-foreground">سجّل صفقات لعرض منحنى الأداء</p>
              </div>
            )}
          </div>

          {/* Last 20 trades */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">
              آخر {closedTrades.length} صفقة
            </p>
            {closedTrades.length === 0 ? (
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-[11px] font-mono text-muted-foreground">لا توجد صفقات مغلقة بعد</p>
              </div>
            ) : closedTrades.map((trade: any) => (
              <div key={trade.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      trade.direction === "long" ? "bg-primary/15" : "bg-destructive/15"
                    )}>
                      {trade.direction === "long"
                        ? <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">
                        {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={cn(
                      "text-[12px] font-mono font-bold",
                      (trade.pnl ?? 0) >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                    </span>
                    <p className="text-[8px] font-mono text-muted-foreground">
                      {(trade.pnl ?? 0) >= 0 ? "TP Hit ✓" : "SL Hit ✗"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Tab */}
      {activeTab === "how-it-works" && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-display font-bold tracking-wide text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> How Nexus AI Works
            </h3>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
              يعتمد Nexus AI على تحليل متعدد الطبقات يجمع بين هيكل السوق، مناطق السيولة، ونماذج التقلب لتوليد إشارات تداول عالية الدقة.
            </p>

            {[
              { icon: Layers, title: "Market Structure", desc: "تحليل الاتجاهات الرئيسية عبر فريمات زمنية متعددة (H1, H4, D1) لتحديد الاتجاه السائد ومستويات الدعم والمقاومة الحرجة." },
              { icon: BarChart3, title: "Liquidity Zones", desc: "رصد مناطق تجمع السيولة وأوامر المؤسسات الكبرى لتحديد نقاط الدخول المثالية حيث تتركز أوامر الشراء/البيع." },
              { icon: Shield, title: "Volatility Models", desc: "نماذج تقلب متقدمة تقيس انحراف الأسعار عن المتوسطات وتحدد فترات التوسع والانكماش لتوقيت الدخول بدقة." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/20 border border-border/10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[12px] font-mono font-bold mb-0.5">{item.title}</p>
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Disclaimer */}
          <div className="glass rounded-xl p-4 border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-mono font-bold text-warning mb-1">تحذير المخاطر</p>
                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                  جميع الإشارات والتوصيات المقدمة هي لأغراض تعليمية فقط ولا تشكل نصيحة مالية أو استثمارية. التداول في الأسواق المالية ينطوي على مخاطر عالية وقد يؤدي إلى خسارة كامل رأس المال. يرجى التداول بمسؤولية.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TradeCenter;
