import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const LiveTickerBar = () => {
  const assets = useLivePrices();
  const navigate = useNavigate();

  const topMovers = assets
    .filter(a => a.category === "كريبتو" || a.category === "فوركس")
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 12);

  return (
    <div className="w-full overflow-hidden relative border-b border-border bg-card/50" dir="ltr">
      <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div
        className="flex items-center gap-0 py-2 animate-scroll"
      >
        {[...topMovers, ...topMovers].map((asset, i) => (
          <button
            key={`${asset.pair}-${i}`}
            onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
            className="flex h-7 items-center gap-2 shrink-0 px-3 border-r border-border/60"
          >
            <span className="font-mono text-[13px] font-semibold text-foreground nx-ltr">
              {asset.pair.replace("/USDT", "")}
            </span>
            <span className="font-mono text-[13px] font-medium tabular-nums text-foreground nx-ltr">
              {formatPrice(asset.price)}
            </span>
            <span className={cn(
              "font-mono text-[13px] font-semibold tabular-nums nx-ltr",
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
