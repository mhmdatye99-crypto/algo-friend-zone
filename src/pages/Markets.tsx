import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, X, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLivePrices, formatPrice, assetCategories, type AssetCategory } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import MiniChart from "@/components/MiniChart";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

type SortField = "name" | "price" | "change" | "vol";
type SortDir = "asc" | "desc";
type SignalFilter = "الكل" | "شراء" | "بيع" | "محايد" | "تشبع";

const signalFilters: SignalFilter[] = ["الكل", "شراء", "بيع", "محايد", "تشبع"];

const signalIcon = (s: SignalFilter) => {
  switch (s) {
    case "شراء": return <TrendingUp className="w-3 h-3" />;
    case "بيع": return <TrendingDown className="w-3 h-3" />;
    case "تشبع": return <TrendingUp className="w-3 h-3" />;
    default: return <Minus className="w-3 h-3" />;
  }
};

const signalColor = (s: string) => {
  switch (s) {
    case "شراء": return "text-success";
    case "بيع": return "text-destructive";
    case "تشبع": return "text-amber-400";
    default: return "text-muted-foreground";
  }
};

const Markets = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, toggle: toggleFavorite, isLoggedIn } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [signalFilter, setSignalFilter] = useState<SignalFilter>("الكل");
  const [sortField, setSortField] = useState<SortField>("change");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [changeFilter, setChangeFilter] = useState<"all" | "up" | "down">("all");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
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

  const activeFiltersCount = [
    signalFilter !== "الكل",
    changeFilter !== "all",
    showFavOnly,
  ].filter(Boolean).length;

  const gainers = assets.filter(a => a.up).length;
  const losers = assets.length - gainers;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-4 pb-28 space-y-3 max-w-lg mx-auto"
    >
      {/* Market Summary Bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3" />
          <span>{gainers} صاعد</span>
        </div>
        <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg">
          <TrendingDown className="w-3 h-3" />
          <span>{losers} هابط</span>
        </div>
        <div className="mr-auto text-muted-foreground">
          {assets.length} أصل
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أصل... BTC, EUR, GOLD"
            className="w-full bg-secondary/60 border border-border/30 rounded-[10px] pr-10 pl-10 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
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
            "relative w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors shrink-0",
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

      {/* Category tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-[10px] text-[11px] font-mono font-medium transition-all whitespace-nowrap",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
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
              "w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors shrink-0",
              showFavOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            <Star className={cn("w-4 h-4", showFavOnly && "fill-current")} />
          </button>
        )}
      </motion.div>

      {/* Advanced Filters Panel */}
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
              {/* Signal Filter */}
              <div>
                <p className="text-[10px] font-mono text-muted-foreground mb-1.5">فلتر الإشارة</p>
                <div className="flex gap-1.5 flex-wrap">
                  {signalFilters.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSignalFilter(s)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                        signalFilter === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {s !== "الكل" && signalIcon(s)}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Direction Filter */}
              <div>
                <p className="text-[10px] font-mono text-muted-foreground mb-1.5">اتجاه التغيير</p>
                <div className="flex gap-1.5">
                  {([
                    { key: "all", label: "الكل" },
                    { key: "up", label: "صاعد ↑" },
                    { key: "down", label: "هابط ↓" },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setChangeFilter(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                        changeFilter === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <p className="text-[10px] font-mono text-muted-foreground mb-1.5">ترتيب حسب</p>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { field: "change" as SortField, label: "التغيير" },
                    { field: "price" as SortField, label: "السعر" },
                    { field: "vol" as SortField, label: "الحجم" },
                    { field: "name" as SortField, label: "الاسم" },
                  ]).map(({ field, label }) => (
                    <button
                      key={field}
                      onClick={() => toggleSort(field)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all",
                        sortField === field
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {label}
                      {sortField === field && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSignalFilter("الكل"); setChangeFilter("all"); setShowFavOnly(false); }}
                  className="text-[10px] font-mono text-destructive hover:underline"
                >
                  إعادة تعيين الفلاتر
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <motion.div variants={fadeUp}>
        <p className="text-[10px] font-mono text-muted-foreground">
          {filteredAssets.length} أصل
          {searchQuery && ` — "${searchQuery}"`}
          {signalFilter !== "الكل" && ` — إشارة: ${signalFilter}`}
        </p>
      </motion.div>

      {/* Asset table */}
      <motion.div variants={fadeUp} className="glass rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_auto_56px_56px] gap-2 px-3 py-2 text-[9px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border/10">
          <span>#</span>
          <span>الأصل</span>
          <span className="text-start w-16">السعر</span>
          <span className="text-center">24h</span>
          <span className="text-center">شارت</span>
        </div>

        {/* Rows */}
        {filteredAssets.length === 0 && (
          <div className="py-8 text-center text-[12px] font-mono text-muted-foreground">
            لا توجد نتائج مطابقة
          </div>
        )}
        {filteredAssets.map((item, i) => (
          <motion.div
            key={item.pair}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.015 }}
            onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
            className="grid grid-cols-[24px_1fr_auto_56px_56px] gap-2 items-center px-3 py-2.5 hover:bg-secondary/20 transition-colors cursor-pointer border-b border-border/5 last:border-0"
          >
            {/* Rank / Fav */}
            <button
              onClick={(e) => { e.stopPropagation(); isLoggedIn && toggleFavorite(item.pair); }}
              className={cn(
                "text-[11px] font-mono transition-colors",
                favorites.has(item.pair) ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              {favorites.has(item.pair) ? (
                <Star className="w-3.5 h-3.5 fill-current text-primary" />
              ) : (
                <span>{i + 1}</span>
              )}
            </button>

            {/* Asset info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border/20 shrink-0">
                <span className="text-sm">{item.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] font-mono font-medium truncate">{item.pair}</p>
                  <span className={cn("text-[8px] font-mono px-1 py-0.5 rounded", signalColor(item.signal))}>
                    {item.signal}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">{item.vol}</p>
              </div>
            </div>

            {/* Price */}
            <span className="text-[12px] font-mono font-medium w-16 text-start tabular-nums">
              {formatPrice(item.price)}
            </span>

            {/* Change */}
            <span className={cn(
              "text-[11px] font-mono font-medium text-center tabular-nums",
              item.up ? "text-success" : "text-destructive"
            )}>
              {item.up ? "+" : ""}{item.change}%
            </span>

            {/* Sparkline */}
            <div className="flex justify-center">
              <MiniChart data={item.sparkline} up={item.up} width={44} height={18} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Markets;
