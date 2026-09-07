import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const LiveTickerBar = () => {
  const assets = useLivePrices();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const topMovers = assets
    .filter(a => a.category === "كريبتو" || a.category === "فوركس")
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 12);

  return (
    <div className="overflow-hidden relative border-b border-border bg-card/50">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide py-2 px-3 animate-scroll"
        style={{ animationDuration: "45s" }}
      >
        {[...topMovers, ...topMovers].map((asset, i) => (
          <button
            key={`${asset.pair}-${i}`}
            onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
            className="flex items-center gap-1.5 shrink-0"
          >
            <span className="text-[13px] font-medium text-foreground/80">
              {asset.pair.replace("/USDT", "")}
            </span>
            <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
              {formatPrice(asset.price)}
            </span>
            <span className={cn(
              "font-mono text-[13px] font-semibold tabular-nums",
              asset.up ? "text-success" : "text-destructive"
            )}>
              {asset.up ? "+" : ""}{asset.change}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LiveTickerBar;
