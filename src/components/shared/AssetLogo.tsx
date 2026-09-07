import { CRYPTO_LOGO_MAP, FOREX_FLAG_MAP } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";

interface AssetLogoProps {
  pair: string;
  icon?: string;
  category?: string;
  size?: number;
  className?: string;
}

const AssetLogo = ({ pair, icon, category, size = 40, className }: AssetLogoProps) => {
  const logoUrl = CRYPTO_LOGO_MAP[pair];
  const flags = FOREX_FLAG_MAP[pair];

  return (
    <div
      className={cn(
        "rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      {category === "كريبتو" && logoUrl ? (
        <img
          src={logoUrl}
          alt={pair}
          loading="lazy"
          className="rounded-lg object-cover"
          style={{ width: size * 0.7, height: size * 0.7 }}
        />
      ) : (
        <span className="leading-none" style={{ fontSize: size * 0.4 }}>
          {(category === "فوركس" && flags) || icon || "•"}
        </span>
      )}
    </div>
  );
};

export default AssetLogo;
