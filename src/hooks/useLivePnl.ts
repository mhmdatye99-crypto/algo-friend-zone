import { useLivePrices } from "@/hooks/useLivePrices";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Trade {
  id: string;
  pair: string;
  direction: string;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: number | null;
  status: string;
}

type TPSLResult = "tp_hit" | "sl_hit" | null;

export function checkTPSL(
  trade: Pick<Trade, "direction" | "stop_loss" | "take_profit">,
  currentPrice: number
): TPSLResult {
  const { direction, stop_loss, take_profit } = trade;
  const isLong = direction === "long" || direction === "buy";

  if (take_profit !== null && take_profit !== undefined) {
    if (isLong && currentPrice >= take_profit) return "tp_hit";
    if (!isLong && currentPrice <= take_profit) return "tp_hit";
  }

  if (stop_loss !== null && stop_loss !== undefined) {
    if (isLong && currentPrice <= stop_loss) return "sl_hit";
    if (!isLong && currentPrice >= stop_loss) return "sl_hit";
  }

  return null;
}

/**
 * Maps trade journal pairs to live price pairs and provides
 * real-time price lookup, PnL calculation, and TP/SL monitoring.
 */
export function useLivePnl() {
  const assets = useLivePrices();

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      map[a.pair] = a.price;
      // Map "X/USD" -> price from "X/USDT" for crypto pairs
      if (a.pair.endsWith("/USDT")) {
        const usdPair = a.pair.replace("/USDT", "/USD");
        map[usdPair] = a.price;
      }
    });
    return map;
  }, [assets]);

  const getLivePrice = useCallback(
    (pair: string): number | null => {
      return priceMap[pair] ?? null;
    },
    [priceMap]
  );

  const calculateLivePnl = useCallback(
    (
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
    },
    [getLivePrice]
  );

  return { getLivePrice, calculateLivePnl, priceMap, checkTPSL };
}

/**
 * Monitors open trades and auto-closes them when TP/SL is hit.
 * Debounces per trade to prevent duplicate closes.
 */
export function useAutoCloseMonitor(
  trades: Trade[],
  priceMap: Record<string, number>,
  closeTradeFn: (tradeId: string, exitPrice: number, result: "tp_hit" | "sl_hit") => void
) {
  const closedSetRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const openTrades = trades.filter((t) => t.status === "open");
    if (openTrades.length === 0) return;

    const now = Date.now();

    openTrades.forEach((trade) => {
      // Skip already closed in this session
      if (closedSetRef.current.has(trade.id)) return;

      // 2-second debounce per trade
      const lastCheck = lastCheckRef.current[trade.id] || 0;
      if (now - lastCheck < 2000) return;
      lastCheckRef.current[trade.id] = now;

      // Get live price for this pair
      let currentPrice = priceMap[trade.pair] ?? null;
      // Try USDT variant for crypto
      if (currentPrice === null && !trade.pair.includes("USDT")) {
        const usdtPair = trade.pair.replace("/USD", "/USDT");
        currentPrice = priceMap[usdtPair] ?? null;
      }

      if (currentPrice === null) return;

      const result = checkTPSL(trade, currentPrice);
      if (result) {
        closedSetRef.current.add(trade.id);
        closeTradeFn(trade.id, currentPrice, result);
      }
    });
  }, [trades, priceMap, closeTradeFn]);

  // Cleanup closed set when trades change
  useEffect(() => {
    const openIds = new Set(trades.filter((t) => t.status === "open").map((t) => t.id));
    closedSetRef.current.forEach((id) => {
      if (!openIds.has(id)) closedSetRef.current.delete(id);
    });
  }, [trades]);
}
