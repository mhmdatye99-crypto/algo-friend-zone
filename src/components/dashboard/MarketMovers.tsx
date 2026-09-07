import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import MiniChart from "@/components/MiniChart";

const MarketMovers = () => {
  const assets = useLivePrices();
  const navigate = useNavigate();

  const topGainers = useMemo(() =>
    [...assets].sort((a, b) => b.change - a.change).slice(0, 4),
    [assets]
  );

  const topLosers = useMemo(() =>
    [...assets].sort((a, b) => a.change - b.change).slice(0, 4),
    [assets]
  );

  const MoverRow = ({ asset }: { asset: typeof assets[0] }) => (
    <button
      onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
      className="nx-tap flex items-center gap-2 py-2 px-2 hover:bg-secondary/50 rounded-lg transition-colors w-full text-right"
    >
      <span className="text-base shrink-0">{asset.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate">{asset.pair.replace("/USDT", "")}</p>
        <p className="nx-meta nx-ltr text-[12px]">{formatPrice(asset.price)}</p>
      </div>
      <MiniChart data={asset.sparkline} up={asset.up} width={36} height={14} />
      <span className={cn(
        "font-mono text-[13px] font-semibold tabular-nums min-w-[52px] text-left",
        asset.up ? "text-success" : "text-destructive"
      )}>
        {asset.up ? "+" : ""}{asset.change}%
      </span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="nx-card space-y-1">
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="nx-label text-success">الأكثر ارتفاعاً</span>
        </div>
        <div>
          {topGainers.map((a) => (
            <MoverRow key={a.pair} asset={a} />
          ))}
        </div>
      </div>

      <div className="nx-card space-y-1">
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <TrendingDown className="w-4 h-4 text-destructive" />
          <span className="nx-label text-destructive">الأكثر انخفاضاً</span>
        </div>
        <div>
          {topLosers.map((a) => (
            <MoverRow key={a.pair} asset={a} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;
