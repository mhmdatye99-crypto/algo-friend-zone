import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { useMemo } from "react";
import MiniChart from "@/components/MiniChart";

const MarketMovers = () => {
  const assets = useLivePrices();
  const navigate = useNavigate();

  const topGainers = useMemo(() =>
    [...assets].sort((a, b) => b.change - a.change).slice(0, 5),
    [assets]
  );

  const topLosers = useMemo(() =>
    [...assets].sort((a, b) => a.change - b.change).slice(0, 5),
    [assets]
  );

  const MoverRow = ({ asset, rank }: { asset: typeof assets[0]; rank: number }) => (
    <button
      onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
      className="flex items-center gap-2 py-2 px-1 hover:bg-secondary/20 rounded-lg transition-colors w-full text-right"
    >
      <span className="text-[10px] font-mono text-muted-foreground/50 w-4">{rank}</span>
      <span className="text-base">{asset.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono font-bold truncate">{asset.pair.replace("/USDT", "")}</p>
        <p className="text-[9px] font-mono text-muted-foreground tabular-nums">{formatPrice(asset.price)}</p>
      </div>
      <MiniChart data={asset.sparkline} up={asset.up} width={36} height={14} />
      <span className={cn(
        "text-[11px] font-mono font-bold tabular-nums min-w-[52px] text-left",
        asset.up ? "text-success" : "text-destructive"
      )}>
        {asset.up ? "+" : ""}{asset.change}%
      </span>
    </button>
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Top Gainers */}
      <div className="glass rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          <span className="text-[10px] font-mono text-success font-bold uppercase tracking-wider">الأكثر ارتفاعاً</span>
        </div>
        <div className="space-y-0.5">
          {topGainers.map((a, i) => (
            <MoverRow key={a.pair} asset={a} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="glass rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[10px] font-mono text-destructive font-bold uppercase tracking-wider">الأكثر انخفاضاً</span>
        </div>
        <div className="space-y-0.5">
          {topLosers.map((a, i) => (
            <MoverRow key={a.pair} asset={a} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;
