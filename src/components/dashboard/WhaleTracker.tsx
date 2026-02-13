import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type WhaleMove = {
  id: string;
  pair: string;
  icon: string;
  type: "buy" | "sell";
  amount: string;
  usdValue: string;
  time: string;
  exchange: string;
};

const EXCHANGES = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit"];
const PAIRS = [
  { pair: "BTC", icon: "₿" },
  { pair: "ETH", icon: "Ξ" },
  { pair: "SOL", icon: "◎" },
  { pair: "XRP", icon: "✕" },
  { pair: "BNB", icon: "◆" },
];

function generateWhaleMove(id: number): WhaleMove {
  const p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
  const isBuy = Math.random() > 0.45;
  const amounts: Record<string, [number, number]> = {
    BTC: [50, 2500],
    ETH: [500, 30000],
    SOL: [5000, 200000],
    XRP: [500000, 10000000],
    BNB: [1000, 50000],
  };
  const [min, max] = amounts[p.pair];
  const qty = Math.floor(min + Math.random() * (max - min));
  const prices: Record<string, number> = { BTC: 98500, ETH: 3400, SOL: 195, XRP: 0.62, BNB: 680 };
  const usd = qty * prices[p.pair];
  const mins = Math.floor(Math.random() * 45) + 1;

  return {
    id: `w-${id}`,
    pair: p.pair,
    icon: p.icon,
    type: isBuy ? "buy" : "sell",
    amount: qty >= 1000000 ? `${(qty / 1000000).toFixed(1)}M` : qty >= 1000 ? `${(qty / 1000).toFixed(1)}K` : qty.toString(),
    usdValue: usd >= 1000000000 ? `$${(usd / 1000000000).toFixed(2)}B` : usd >= 1000000 ? `$${(usd / 1000000).toFixed(1)}M` : `$${(usd / 1000).toFixed(0)}K`,
    time: `${mins}د`,
    exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)],
  };
}

const WhaleTracker = () => {
  const [moves, setMoves] = useState<WhaleMove[]>(() =>
    Array.from({ length: 6 }, (_, i) => generateWhaleMove(i))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMoves(prev => {
        const newMove = generateWhaleMove(Date.now());
        return [newMove, ...prev.slice(0, 5)];
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const buyCount = moves.filter(m => m.type === "buy").length;
  const sellCount = moves.length - buyCount;
  const buyPct = Math.round((buyCount / moves.length) * 100);

  return (
    <div className="glass rounded-[14px] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🐋</span>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Whale Tracker</p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-[10px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          مباشر
        </span>
      </div>

      {/* Buy/Sell pressure bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] font-mono mb-1">
          <span className="text-success">شراء {buyPct}%</span>
          <span className="text-destructive">بيع {100 - buyPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
          <motion.div
            className="h-full bg-success"
            animate={{ width: `${buyPct}%` }}
            transition={{ duration: 0.6 }}
          />
          <div className="h-full bg-destructive flex-1" />
        </div>
      </div>

      {/* Whale moves list */}
      <div className="space-y-1.5">
        {moves.map((move, i) => (
          <motion.div
            key={move.id}
            initial={i === 0 ? { opacity: 0, x: 20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-center gap-2 rounded-[10px] px-2.5 py-2 border",
              move.type === "buy"
                ? "bg-success/5 border-success/10"
                : "bg-destructive/5 border-destructive/10"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold",
              move.type === "buy" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
            )}>
              {move.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold">{move.amount} {move.pair}</span>
                <span className={cn(
                  "text-[8px] font-mono px-1.5 py-0.5 rounded",
                  move.type === "buy" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                )}>
                  {move.type === "buy" ? "شراء" : "بيع"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono text-muted-foreground">{move.exchange}</span>
                <span className="text-[9px] font-mono text-muted-foreground/50">•</span>
                <span className="text-[9px] font-mono text-muted-foreground">منذ {move.time}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-foreground">{move.usdValue}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhaleTracker;
