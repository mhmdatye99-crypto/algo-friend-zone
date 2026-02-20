import { useLivePrices } from "@/hooks/useLivePrices";
import { useMemo } from "react";

/**
 * Maps trade journal pairs (e.g. "BTC/USD") to live price pairs (e.g. "BTC/USDT")
 * and provides real-time price lookup for calculating open trade PnL.
 */
export function useLivePnl() {
  const assets = useLivePrices();

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      map[a.pair] = a.price;
      // Also map "X/USD" -> price from "X/USDT" for crypto pairs
      if (a.pair.endsWith("/USDT")) {
        const usdPair = a.pair.replace("/USDT", "/USD");
        map[usdPair] = a.price;
      }
    });
    return map;
  }, [assets]);

  const getLivePrice = (pair: string): number | null => {
    return priceMap[pair] ?? null;
  };

  const calculateLivePnl = (
    pair: string,
    direction: string,
    entryPrice: number,
    positionSize: number | null
  ): number | null => {
    const currentPrice = getLivePrice(pair);
    if (currentPrice === null) return null;
    const size = positionSize || 1;
    if (direction === "long" || direction === "buy") {
      return (currentPrice - entryPrice) * size;
    } else {
      return (entryPrice - currentPrice) * size;
    }
  };

  return { getLivePrice, calculateLivePnl, priceMap };
}
