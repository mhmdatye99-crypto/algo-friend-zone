import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const LiveTickerBar = () => {
  const assets = useLivePrices();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});

  // Track price changes for flash effect
  useEffect(() => {
    const newPrices: Record<string, number> = {};
    assets.forEach(a => { newPrices[a.pair] = a.price; });
    setPrevPrices(prev => {
      const merged = { ...prev };
      Object.keys(newPrices).forEach(k => { merged[k] = prev[k] ?? newPrices[k]; });
      return newPrices;
    });
  }, [assets]);

  const topMovers = assets
    .filter(a => a.category === "كريبتو" || a.category === "سلع")
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 15);

  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-1.5 px-2 animate-scroll"
        style={{ animationDuration: "40s" }}
      >
        {[...topMovers, ...topMovers].map((asset, i) => {
          const prevPrice = prevPrices[asset.pair];
          const flashing = prevPrice && prevPrice !== asset.price;
          return (
            <button
              key={`${asset.pair}-${i}`}
              onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
              className="flex items-center gap-1.5 shrink-0 group"
            >
              <span className="text-sm">{asset.icon}</span>
              <span className="text-[11px] font-mono font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {asset.pair.replace("/USDT", "")}
              </span>
              <span className={cn(
                "text-[11px] font-mono font-bold tabular-nums transition-all",
                flashing && (asset.up ? "text-success" : "text-destructive"),
                !flashing && "text-foreground/70"
              )}>
                {formatPrice(asset.price)}
              </span>
              <span className={cn(
                "text-[10px] font-mono font-bold tabular-nums",
                asset.up ? "text-success" : "text-destructive"
              )}>
                {asset.up ? "+" : ""}{asset.change}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LiveTickerBar;
