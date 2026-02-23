import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, X, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLivePrices, formatPrice, assetCategories, CRYPTO_LOGO_MAP, FOREX_FLAG_MAP, type AssetCategory } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import MiniChart from "@/components/MiniChart";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1 } },
};

type SortField = "name" | "price" | "change" | "vol";
type SortDir = "asc" | "desc";
type SignalFilter = "الكل" | "شراء" | "بيع" | "محايد" | "تشبع";

const signalFilters: SignalFilter[] = ["الكل", "شراء", "بيع", "محايد", "تشبع"];

const signalColor = (s: string) => {
  switch (s) {
    case "شراء": return "text-success bg-success/8";
    case "بيع": return "text-destructive bg-destructive/8";
    case "تشبع": return "text-warning bg-warning/8";
    default: return "text-muted-foreground bg-muted/30";
  }
};

const AssetLogo = ({ pair, icon, category }: { pair: string; icon: string; category: string }) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];

  if (category === "كريبتو" && logoUrl) {
    return (
      <div className="w-7 h-7 rounded bg-secondary/40 flex items-center justify-center overflow-hidden border border-border/20 shrink-0">
        <img src={logoUrl} alt={pair} className="w-5 h-5 rounded object-cover" loading="lazy" />
      </div>
    );
  }

  if (category === "فوركس" && flags) {
    return (
      <div className="w-7 h-7 rounded bg-secondary/40 flex items-center justify-center border border-border/20 shrink-0">
        <span className="text-[10px] leading-none">{flags}</span>
      </div>
    );
  }

  return (
    <div className="w-7 h-7 rounded bg-secondary/40 flex items-center justify-center border border-border/20 shrink-0">
      <span className="text-xs">{icon}</span>
    </div>
  );
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
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-4 pt-4 pb-28 space-y-2.5 max-w-lg mx-auto"
    >
      {/* Market Summary */}
      <motion.div variants={fade} className="flex items-center gap-3 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 text-success px-2 py-1 border border-success/10" style={{ borderRadius: '3px' }}>
          <TrendingUp className="w-3 h-3" />
          <span className="font-bold tabular-nums">{gainers}</span>
          <span className="text-success/60">صاعد</span>
        </div>
        <div className="flex items-center gap-1.5 text-destructive px-2 py-1 border border-destructive/10" style={{ borderRadius: '3px' }}>
          <TrendingDown className="w-3 h-3" />
          <span className="font-bold tabular-nums">{losers}</span>
          <span className="text-destructive/60">هابط</span>
        </div>
        <div className="mr-auto text-muted-foreground/50 tabular-nums">
          {assets.length} أصل
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث... BTC, EUR/USD"
            className="w-full bg-card border border-border/30 pr-9 pl-9 py-2 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors"
            style={{ borderRadius: '4px' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative w-9 h-9 flex items-center justify-center transition-colors shrink-0 border",
            showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground/50 border-border/30 hover:border-border/50"
          )}
          style={{ borderRadius: '4px' }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[7px] flex items-center justify-center font-bold" style={{ borderRadius: '2px' }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fade} className="flex items-center gap-1.5">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-[9px] font-mono font-semibold transition-all whitespace-nowrap border",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground/50 border-border/20 hover:border-border/40"
              )}
              style={{ borderRadius: '3px' }}
            >
              {cat}
            </button>
          ))}
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowFavOnly(!showFavOnly)}
            className={cn(
              "w-8 h-8 flex items-center justify-center transition-colors shrink-0 border",
              showFavOnly ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground/40 border-border/20"
            )}
            style={{ borderRadius: '3px' }}
          >
            <Star className={cn("w-3.5 h-3.5", showFavOnly && "fill-current")} />
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border border-border/15 bg-card/80" style={{ borderRadius: '4px' }}>
              <div>
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-wider mb-1.5">فلتر الإشارة</p>
                <div className="flex gap-1 flex-wrap">
                  {signalFilters.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSignalFilter(s)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-mono font-medium transition-all border",
                        signalFilter === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground/50 border-border/15 hover:border-border/30"
                      )}
                      style={{ borderRadius: '3px' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-wider mb-1.5">اتجاه التغيير</p>
                <div className="flex gap-1">
                  {([
                    { key: "all", label: "الكل" },
                    { key: "up", label: "صاعد ↑" },
                    { key: "down", label: "هابط ↓" },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setChangeFilter(key)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-mono font-medium transition-all border",
                        changeFilter === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground/50 border-border/15"
                      )}
                      style={{ borderRadius: '3px' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-wider mb-1.5">ترتيب حسب</p>
                <div className="flex gap-1 flex-wrap">
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
                        "flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-medium transition-all border",
                        sortField === field
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground/50 border-border/15"
                      )}
                      style={{ borderRadius: '3px' }}
                    >
                      {label}
                      {sortField === field && <ArrowUpDown className="w-2.5 h-2.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSignalFilter("الكل"); setChangeFilter("all"); setShowFavOnly(false); }}
                  className="text-[9px] font-mono text-destructive/70 hover:text-destructive transition-colors"
                >
                  إعادة تعيين
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <motion.div variants={fade}>
        <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-wider">
          {filteredAssets.length} أصل
          {searchQuery && ` — "${searchQuery}"`}
          {signalFilter !== "الكل" && ` — ${signalFilter}`}
        </p>
      </motion.div>

      {/* Asset Table */}
      <motion.div variants={fade} className="border border-border/15 bg-card/50 overflow-hidden" style={{ borderRadius: '4px' }}>
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_52px_44px] gap-2 px-3 py-2 text-[7px] font-mono text-muted-foreground/40 uppercase tracking-[0.15em] border-b border-border/10 bg-secondary/20">
          <span>الأصل</span>
          <span className="text-start w-20">السعر</span>
          <span className="text-center">24H</span>
          <span className="text-center">CHART</span>
        </div>

        {/* Rows */}
        {filteredAssets.length === 0 && (
          <div className="py-10 text-center text-[10px] font-mono text-muted-foreground/30">
            لا توجد نتائج مطابقة
          </div>
        )}
        {filteredAssets.map((item, i) => (
          <div
            key={item.pair}
            onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
            className="grid grid-cols-[1fr_auto_52px_44px] gap-2 items-center px-3 py-2.5 hover:bg-secondary/10 active:bg-secondary/15 transition-colors cursor-pointer border-b border-border/5 last:border-0"
          >
            {/* Asset */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={(e) => { e.stopPropagation(); isLoggedIn && toggleFavorite(item.pair); }}
                className="relative"
              >
                <AssetLogo pair={item.pair} icon={item.icon} category={item.category} />
                {favorites.has(item.pair) && (
                  <Star className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 fill-primary text-primary" />
                )}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-mono font-bold truncate">{item.pair.replace("/USDT", "")}</p>
                  <span className={cn("text-[7px] font-mono font-semibold px-1.5 py-0.5", signalColor(item.signal))} style={{ borderRadius: '2px' }}>
                    {item.signal}
                  </span>
                </div>
                <p className="text-[8px] font-mono text-muted-foreground/30 tabular-nums">{item.vol}</p>
              </div>
            </div>

            {/* Price */}
            <span className="text-[11px] font-mono font-semibold w-20 text-start tabular-nums text-foreground/80">
              {formatPrice(item.price)}
            </span>

            {/* Change */}
            <span className={cn(
              "text-[10px] font-mono font-bold text-center tabular-nums px-1 py-0.5",
              item.up ? "text-success" : "text-destructive"
            )} style={{ borderRadius: '2px', background: item.up ? 'hsla(145, 63%, 42%, 0.06)' : 'hsla(0, 62%, 50%, 0.06)' }}>
              {item.up ? "+" : ""}{item.change}%
            </span>

            {/* Sparkline */}
            <div className="flex justify-center">
              <MiniChart data={item.sparkline} up={item.up} width={36} height={16} />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Markets;
