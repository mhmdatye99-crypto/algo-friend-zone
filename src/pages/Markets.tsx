import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLivePrices, formatPrice, assetCategories, type AssetCategory } from "@/hooks/useLivePrices";
import { useFavorites } from "@/hooks/useFavorites";
import MiniChart from "@/components/MiniChart";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Markets = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, toggle: toggleFavorite, isLoggedIn } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const filteredAssets = assets
    .filter(a => activeCategory === "الكل" || a.category === activeCategory)
    .filter(a => !searchQuery || a.pair.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(a => !showFavOnly || favorites.has(a.pair));

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-4 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* Search bar */}
      <motion.div variants={fadeUp} className="relative">
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
      </motion.div>

      {/* Category tabs + Fav filter */}
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

      {/* Results count */}
      <motion.div variants={fadeUp}>
        <p className="text-[10px] font-mono text-muted-foreground">
          {filteredAssets.length} أصل
          {searchQuery && ` — "${searchQuery}"`}
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
        {filteredAssets.map((item, i) => (
          <motion.div
            key={item.pair}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
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
                <p className="text-[12px] font-mono font-medium truncate">{item.pair}</p>
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
