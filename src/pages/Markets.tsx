import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLivePrices, formatPrice, assetCategories, type AssetCategory } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import AssetLogo from "@/components/shared/AssetLogo";
import MiniChart from "@/components/MiniChart";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1 } },
};

const Markets = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, toggle: toggleFavorite, isLoggedIn } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => activeCategory === "الكل" || a.category === activeCategory)
      .filter((a) => !searchQuery || a.pair.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((a) => !showFavOnly || favorites.has(a.pair))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [assets, activeCategory, searchQuery, showFavOnly, favorites]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="nx-page"
    >
      {/* Search */}
      <motion.div variants={fade} className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن أصل..."
          className="nx-input pr-11 pl-11"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="مسح"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted-foreground"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fade} className="flex items-center gap-2 min-w-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 -mx-1 px-1 pb-0.5">
          {assetCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn("nx-chip", activeCategory === cat && "nx-chip-on")}
            >
              {cat}
            </button>
          ))}
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowFavOnly(!showFavOnly)}
            aria-label="المفضلة"
            className={cn(
              "w-11 h-11 flex items-center justify-center shrink-0 rounded-xl border transition-colors",
              showFavOnly ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            )}
          >
            <Star className={cn("w-5 h-5", showFavOnly && "fill-current")} />
          </button>
        )}
      </motion.div>

      {/* Asset list */}
      <motion.div variants={fade} className="rounded-xl border border-border/80 bg-card overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="py-12 text-center nx-body text-muted-foreground">لا توجد نتائج مطابقة</div>
        ) : (
          filteredAssets.map((item) => (
            <div
              key={item.pair}
              onClick={() => navigate(`/asset/${encodeURIComponent(item.pair)}`)}
              className="grid grid-cols-[40px_minmax(60px,1fr)_48px_minmax(82px,auto)_44px] min-[380px]:grid-cols-[40px_minmax(70px,1fr)_56px_minmax(92px,auto)_44px] items-center gap-2 min-h-[68px] px-3 border-b border-border/70 last:border-b-0 cursor-pointer hover:bg-secondary/40 active:bg-secondary/60 transition-colors"
            >
              <AssetLogo pair={item.pair} icon={item.icon} category={item.category} size={40} />

              <div className="min-w-0 flex-1">
                <p className="font-mono font-bold text-[16px] whitespace-nowrap nx-ltr">
                  {item.pair.replace("/USDT", "")}
                </p>
                <p className="nx-meta truncate">{item.category}</p>
              </div>

              <div className="w-12 min-[380px]:w-14 flex justify-center overflow-hidden" aria-hidden="true">
                <MiniChart data={item.sparkline} up={item.up} width={48} height={22} />
              </div>

              <div className="text-left min-w-0" dir="ltr">
                <p className="font-mono font-semibold text-[14px] min-[380px]:text-[15px] tabular-nums nx-ltr whitespace-nowrap">
                  {formatPrice(item.price)}
                </p>
                <p
                  className={cn(
                    "font-mono font-semibold text-[14px] tabular-nums nx-ltr",
                    item.up ? "text-success" : "text-destructive"
                  )}
                >
                  {item.up ? "+" : ""}
                  {item.change}%
                </p>
              </div>

              {isLoggedIn && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.pair); }}
                  aria-label="مفضلة"
                  className="w-11 h-11 flex items-center justify-center rounded-lg shrink-0"
                >
                  <Star
                    className={cn(
                      "w-[18px] h-[18px]",
                      favorites.has(item.pair) ? "fill-primary text-primary" : "text-muted-foreground"
                    )}
                  />
                </button>
              )}
            </div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

export default Markets;
