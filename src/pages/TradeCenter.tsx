import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, X, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown, Minus,
  Zap, BarChart, Brain, Layers, Shield, BarChart3, AlertTriangle, Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSignals } from "@/hooks/useSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLivePrices, formatPrice, assetCategories, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP, type AssetCategory } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import MiniChart from "@/components/MiniChart";
import SignalCardCollapsible from "@/components/signals/SignalCardCollapsible";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

type MainTab = "markets" | "signals" | "performance";
type SortField = "name" | "price" | "change" | "vol";
type SortDir = "asc" | "desc";
type SignalFilter = "الكل" | "شراء" | "بيع" | "محايد" | "تشبع";

const signalFilters: SignalFilter[] = ["الكل", "شراء", "بيع", "محايد", "تشبع"];
const signalCategoryFilters = ["الكل", "فوركس", "كريبتو", "سلع", "مؤشرات"];

const AssetLogo = ({ pair, icon, category }: { pair: string; icon: string; category: string }) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];

  if (category === "كريبتو" && logoUrl) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/30 shrink-0">
        <img src={logoUrl} alt={pair} className="w-6 h-6 rounded-full object-cover" loading="lazy" />
      </div>
    );
  }
  if (category === "فوركس" && flags) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border/30 shrink-0">
        <span className="text-[11px] leading-none">{flags}</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border/30 shrink-0">
      <span className="text-sm">{icon}</span>
    </div>
  );
};

const TradeCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signals } = useSignals();
  const assets = useLivePrices();
  const { favorites, toggle: toggleFavorite, isLoggedIn } = useFavorites();

  // Main tab
  const [activeTab, setActiveTab] = useState<MainTab>("markets");

  // Markets state
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [signalFilter, setSignalFilter] = useState<SignalFilter>("الكل");
  const [sortField, setSortField] = useState<SortField>("change");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [changeFilter, setChangeFilter] = useState<"all" | "up" | "down">("all");

  // Signals state
  const [activeSignalFilter, setActiveSignalFilter] = useState("الكل");

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filteredAssets = useMemo(() => {
    let result = assets
      .filter(a => activeCategory === "الكل" || a.category === activeCategory)
      .filter(a => !searchQuery || a.pair.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(a => !showFavOnly || favorites.has(a.pair))
      .filter(a => signalFilter === "الكل" || a.signal === signalFilter)
      .filter(a => changeFilter === "all" || (changeFilter === "up" ? a.up : !a.up));

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.pair.localeCompare(b.pair); break;
        case "price": cmp = a.price - b.price; break;
        case "change": cmp = Math.abs(a.change) - Math.abs(b.change); break;
        case "vol": {
          const parseVol = (v: string) => {
            const n = parseFloat(v.replace(/[^0-9.]/g, ""));
            return v.includes("B") ? n * 1e9 : v.includes("M") ? n * 1e6 : n * 1e3;
          };
          cmp = parseVol(a.vol) - parseVol(b.vol);
          break;
        }
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [assets, activeCategory, searchQuery, showFavOnly, signalFilter, changeFilter, sortField, sortDir, favorites]);

  const filteredSignals = activeSignalFilter === "الكل"
    ? signals
    : signals.filter(s => s.category === activeSignalFilter);

  // Performance data
  const { data: closedTrades = [] } = useQuery({
    queryKey: ["trades-closed-all", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("trades").select("*").eq("status", "closed").order("closed_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const perfStats = useMemo(() => {
    if (closedTrades.length === 0) return null;
    const wins = closedTrades.filter((t: any) => (t.pnl ?? 0) > 0).length;
    const totalPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl ?? 0), 0);
    return { winRate: (wins / closedTrades.length) * 100, totalPnl, total: closedTrades.length, wins };
  }, [closedTrades]);

  const gainers = assets.filter(a => a.up).length;
  const losers = assets.length - gainers;
  const activeFiltersCount = [signalFilter !== "الكل", changeFilter !== "all", showFavOnly].filter(Boolean).length;

  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "markets", label: "الأسواق", icon: <BarChart3 className="w-3.5 h-3.5" />, count: assets.length },
    { key: "signals", label: "التوصيات", icon: <Zap className="w-3.5 h-3.5" />, count: signals.length },
    { key: "performance", label: "الأداء", icon: <BarChart className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-3"
    >
      {/* ─── Market Summary Strip ─── */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1 bg-primary/8 text-primary px-2 py-1 rounded-lg border border-primary/15">
          <TrendingUp className="w-3 h-3" />
          <span className="font-bold">{gainers}</span>
          <span className="text-primary/70">صاعد</span>
        </div>
        <div className="flex items-center gap-1 bg-destructive/8 text-destructive px-2 py-1 rounded-lg border border-destructive/15">
          <TrendingDown className="w-3 h-3" />
          <span className="font-bold">{losers}</span>
          <span className="text-destructive/70">هابط</span>
        </div>
        <div className="mr-auto flex items-center gap-1 text-muted-foreground">
          <Crosshair className="w-3 h-3" />
          {assets.length} أصل حي
        </div>
      </motion.div>

      {/* ─── Main Tabs ─── */}
      <motion.div variants={fadeUp} className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border/10">
        {mainTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-mono font-bold transition-all relative",
              activeTab === t.key
                ? "bg-background text-foreground shadow-sm border border-border/20"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={cn(
                "text-[8px] px-1.5 py-0.5 rounded-full font-mono",
                activeTab === t.key ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── MARKETS TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "markets" && (
        <div className="space-y-3">
          {/* Search */}
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث... BTC, EUR/USD"
                className="w-full bg-secondary/60 border border-border/30 rounded-xl pr-10 pl-10 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </motion.div>

          {/* Category + Fav */}
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
              {assetCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all whitespace-nowrap",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {isLoggedIn && (
              <button
                onClick={() => setShowFavOnly(!showFavOnly)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                  showFavOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                <Star className={cn("w-4 h-4", showFavOnly && "fill-current")} />
              </button>
            )}
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-xl p-3 space-y-3 border border-border/20">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1.5">فلتر الإشارة</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {signalFilters.map((s) => (
                        <button key={s} onClick={() => setSignalFilter(s)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                            signalFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground"
                          )}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1.5">اتجاه التغيير</p>
                    <div className="flex gap-1.5">
                      {([{ key: "all" as const, label: "الكل" }, { key: "up" as const, label: "صاعد ↑" }, { key: "down" as const, label: "هابط ↓" }]).map(({ key, label }) => (
                        <button key={key} onClick={() => setChangeFilter(key)}
                          className={cn("px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all", changeFilter === key ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground")}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground mb-1.5">ترتيب حسب</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {([{ field: "change" as SortField, label: "التغيير" }, { field: "price" as SortField, label: "السعر" }, { field: "vol" as SortField, label: "الحجم" }, { field: "name" as SortField, label: "الاسم" }]).map(({ field, label }) => (
                        <button key={field} onClick={() => toggleSort(field)}
                          className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all", sortField === field ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground")}>
                          {label}
                          {sortField === field && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button onClick={() => { setSignalFilter("الكل"); setChangeFilter("all"); setShowFavOnly(false); }}
                      className="text-[10px] font-mono text-destructive hover:underline">
                      إعادة تعيين الفلاتر
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <p className="text-[10px] font-mono text-muted-foreground px-1">
            {filteredAssets.length} أصل
            {searchQuery && ` — "${searchQuery}"`}
          </p>

          {/* Asset Table */}
          <div className="glass rounded-xl overflow-hidden border border-border/10">
            <div className="grid grid-cols-[1fr_auto_56px_48px] gap-2 px-3 py-2 text-[9px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border/10 bg-secondary/30">
              <span>الأصل</span>
              <span className="text-start w-20">السعر</span>
              <span className="text-center">24h</span>
              <span className="text-center">شارت</span>
            </div>

            {filteredAssets.length === 0 && (
              <div className="py-8 text-center text-[12px] font-mono text-muted-foreground">لا توجد نتائج</div>
            )}

            {filteredAssets.map((item, i) => (
              <motion.div
                key={item.pair}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
                className="grid grid-cols-[1fr_auto_56px_48px] gap-2 items-center px-3 py-2.5 hover:bg-secondary/20 active:bg-secondary/30 transition-colors cursor-pointer border-b border-border/5 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button onClick={(e) => { e.stopPropagation(); isLoggedIn && toggleFavorite(item.pair); }} className="relative">
                    <AssetLogo pair={item.pair} icon={item.icon} category={item.category} />
                    {favorites.has(item.pair) && <Star className="absolute -top-1 -right-1 w-3 h-3 fill-primary text-primary" />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-mono font-semibold truncate">{item.pair.replace("/USDT", "")}</p>
                      <span className={cn(
                        "text-[8px] font-mono px-1.5 py-0.5 rounded-md font-medium",
                        item.signal === "شراء" && "bg-primary/15 text-primary",
                        item.signal === "بيع" && "bg-destructive/15 text-destructive",
                        item.signal === "تشبع" && "bg-amber-400/15 text-amber-400",
                        item.signal === "محايد" && "bg-muted text-muted-foreground",
                      )}>
                        {item.signal}
                      </span>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground/70">{item.vol}</p>
                  </div>
                </div>
                <span className="text-[12px] font-mono font-semibold w-20 text-start tabular-nums">{formatPrice(item.price)}</span>
                <span className={cn(
                  "text-[11px] font-mono font-bold text-center tabular-nums px-1.5 py-0.5 rounded-md",
                  item.up ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}>
                  {item.up ? "+" : ""}{item.change}%
                </span>
                <div className="flex justify-center">
                  <MiniChart data={item.sparkline} up={item.up} width={40} height={18} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── SIGNALS TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "signals" && (
        <div className="space-y-3">
          {/* Signal category filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {signalCategoryFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveSignalFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-all",
                  activeSignalFilter === f
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
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : (
            <motion.div className="space-y-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
              {filteredSignals.map((signal) => (
                <SignalCardCollapsible key={signal.pair} signal={signal} />
              ))}
            </motion.div>
          )}

          {filteredSignals.length === 0 && signals.length > 0 && (
            <p className="text-center text-muted-foreground font-mono text-sm mt-10">لا توجد إشارات لهذه الفئة حالياً</p>
          )}

          {/* Risk Warning */}
          <div className="glass rounded-xl p-3 border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-muted-foreground/70 leading-relaxed">
                جميع التوصيات لأغراض تعليمية فقط ولا تشكل نصيحة مالية. التداول ينطوي على مخاطر عالية.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ─── PERFORMANCE TAB ─── */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "performance" && (
        <div className="space-y-3">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2">
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

          {/* Equity curve */}
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
                    <div key={i} className={cn("flex-1 rounded-t-sm transition-all", pnl >= 0 ? "bg-primary/60" : "bg-destructive/60")} style={{ height: `${height}%` }} />
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-[11px] font-mono text-muted-foreground">سجّل صفقات لعرض منحنى الأداء</p>
              </div>
            )}
          </div>

          {/* Last trades */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">آخر {closedTrades.length} صفقة</p>
            {closedTrades.length === 0 ? (
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-[11px] font-mono text-muted-foreground">لا توجد صفقات مغلقة بعد</p>
              </div>
            ) : closedTrades.map((trade: any) => (
              <div key={trade.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", trade.direction === "long" ? "bg-primary/15" : "bg-destructive/15")}>
                      {trade.direction === "long" ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold">{trade.pair}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">
                        {trade.closed_at ? new Date(trade.closed_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={cn("text-[12px] font-mono font-bold", (trade.pnl ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                      {(trade.pnl ?? 0) >= 0 ? "+" : ""}${(trade.pnl ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TradeCenter;
