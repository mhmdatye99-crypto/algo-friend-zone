import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, X, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
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
    case "شراء": return "nx-badge-long";
    case "بيع": return "nx-badge-short";
    case "تشبع": return "nx-badge-warn";
    default: return "nx-badge-neutral";
  }
};

const AssetLogo = ({ pair, icon, category }: { pair: string; icon: string; category: string }) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];

  if (category === "كريبتو" && logoUrl) {
    return (
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border shrink-0">
        <img src={logoUrl} alt={pair} className="w-7 h-7 rounded-lg object-cover" loading="lazy" />
      </div>
    );
  }

  if (category === "فوركس" && flags) {
    return (
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border shrink-0">
        <span className="text-sm leading-none">{flags}</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border shrink-0">
      <span className="text-base">{icon}</span>
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
      className="nx-page"
    >
      {/* Market Summary */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-success px-3 py-1.5 rounded-lg bg-success/10 border border-success/15">
          <TrendingUp className="w-4 h-4" />
          <span className="nx-num text-[14px] nx-ltr">{gainers}</span>
          <span className="nx-meta text-success/80">صاعد</span>
        </div>
        <div className="flex items-center gap-1.5 text-destructive px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/15">
          <TrendingDown className="w-4 h-4" />
          <span className="nx-num text-[14px] nx-ltr">{losers}</span>
          <span className="nx-meta text-destructive/80">هابط</span>
        </div>
        <div className="mr-auto nx-meta nx-ltr">
          {assets.length} أصل
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث... BTC, EUR/USD"
            className="w-full h-12 bg-card border border-border rounded-xl pr-10 pl-10 text-[14px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative w-12 h-12 flex items-center justify-center transition-colors shrink-0 rounded-xl border",
            showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-primary text-primary-foreground text-[11px] rounded-full flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fade} className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 h-10 rounded-full text-[14px] font-semibold transition-all whitespace-nowrap border",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-foreground border-border hover:border-primary/40"
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
              "w-10 h-10 flex items-center justify-center transition-colors shrink-0 rounded-full border",
              showFavOnly ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border"
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="nx-card space-y-4">
              <div>
                <p className="nx-label mb-2">فلتر الإشارة</p>
                <div className="flex gap-2 flex-wrap">
                  {signalFilters.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSignalFilter(s)}
                      className={cn(
                        "px-3 h-9 rounded-full text-[13px] font-medium transition-all border",
                        signalFilter === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="nx-label mb-2">اتجاه التغيير</p>
                <div className="flex gap-2">
                  {([
                    { key: "all", label: "الكل" },
                    { key: "up", label: "صاعد ↑" },
                    { key: "down", label: "هابط ↓" },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setChangeFilter(key)}
                      className={cn(
                        "px-3 h-9 rounded-full text-[13px] font-medium transition-all border",
                        changeFilter === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-foreground border-border"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="nx-label mb-2">ترتيب حسب</p>
                <div className="flex gap-2 flex-wrap">
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
                        "flex items-center gap-1 px-3 h-9 rounded-full text-[13px] font-medium transition-all border",
                        sortField === field
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-foreground border-border"
                      )}
                    >
                      {label}
                      {sortField === field && <ArrowUpDown className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSignalFilter("الكل"); setChangeFilter("all"); setShowFavOnly(false); }}
                  className="text-[13px] font-semibold text-destructive hover:opacity-80 transition-colors"
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
        <p className="nx-meta">
          {filteredAssets.length} أصل
          {searchQuery && ` — "${searchQuery}"`}
          {signalFilter !== "الكل" && ` — ${signalFilter}`}
        </p>
      </motion.div>

      {/* Asset Table */}
      <motion.div variants={fade} className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Rows */}
        {filteredAssets.length === 0 && (
          <div className="py-12 text-center nx-meta">
            لا توجد نتائج مطابقة
          </div>
        )}
        {filteredAssets.map((item) => (
          <div
            key={item.pair}
            onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
            className="nx-row nx-tap cursor-pointer hover:bg-secondary/40 active:bg-secondary/60 transition-colors"
          >
            {/* Favorite */}
            <button
              onClick={(e) => { e.stopPropagation(); isLoggedIn && toggleFavorite(item.pair); }}
              className="relative w-11 h-11 flex items-center justify-center shrink-0 -ml-1"
            >
              <AssetLogo pair={item.pair} icon={item.icon} category={item.category} />
              {favorites.has(item.pair) && (
                <Star className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 fill-primary text-primary" />
              )}
            </button>

            {/* Asset name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-mono font-bold text-[15px] truncate nx-ltr">{item.pair.replace("/USDT", "")}</p>
                <span className={cn(signalColor(item.signal), "text-[11px] px-1.5 py-0.5")}>
                  {item.signal}
                </span>
              </div>
              <p className="nx-meta truncate">{item.vol}</p>
            </div>

            {/* Price + change */}
            <div className="text-left shrink-0">
              <p className="font-mono font-semibold text-[16px] tabular-nums nx-ltr">
                {formatPrice(item.price)}
              </p>
              <p className={cn(
                "font-mono font-bold text-[13px] tabular-nums nx-ltr",
                item.up ? "text-success" : "text-destructive"
              )}>
                {item.up ? "+" : ""}{item.change}%
              </p>
            </div>

            {/* Sparkline */}
            <div className="hidden xs:flex shrink-0">
              <MiniChart data={item.sparkline} up={item.up} width={40} height={20} />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Markets;
