import { useMemo } from "react";
import { Asset, useLivePrices } from "./useLivePrices";

export interface DynamicSignal {
  pair: string;
  direction: string;
  confidence: number;
  entry: string;
  target1: string;
  target2: string;
  sl: string;
  rr: string;
  timeFrame: string;
  alphaScore: number;
  rsi: number;
  rsiSignal: string;
  macd: string;
  macdHist: string;
  bbPosition: string;
  volume: string;
  sentiment: number;
  liquidity: string;
  convergence: number;
  reasons: string[];
  risk: string;
  icon: string;
  category: string;
}

function getRsiSignal(rsi: number): string {
  if (rsi >= 70) return "تشبع شرائي";
  if (rsi >= 60) return "قريب من التشبع";
  if (rsi <= 30) return "تشبع بيعي";
  if (rsi <= 40) return "قريب من التشبع";
  return "محايد";
}

function getBBPosition(rsi: number, change: number): string {
  if (rsi > 65 || change > 2) return "نطاق علوي";
  if (rsi < 35 || change < -2) return "نطاق سفلي";
  return "وسط";
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: price >= 100 ? 2 : 4 });
  if (price >= 0.001) return price.toFixed(4);
  return price.toFixed(8);
}

function computeTarget(price: number, direction: string, multiplier: number): string {
  const factor = direction === "صعودي" ? 1 + multiplier : 1 - multiplier;
  return formatPrice(price * factor);
}

function computeSL(price: number, direction: string): string {
  const factor = direction === "صعودي" ? 0.985 : 1.015;
  return formatPrice(price * factor);
}

function generateReasons(asset: Asset, direction: string): string[] {
  const reasons: string[] = [];
  
  if (asset.rsi > 55 && direction === "صعودي") reasons.push("زخم RSI إيجابي");
  if (asset.rsi < 45 && direction === "هبوطي") reasons.push("ضعف في مؤشر RSI");
  if (asset.rsi > 70) reasons.push("تشبع شرائي واضح على RSI");
  if (asset.rsi < 30) reasons.push("تشبع بيعي واضح على RSI");
  
  if (asset.macd === "صعودي") reasons.push("تقاطع MACD إيجابي");
  if (asset.macd === "هبوطي") reasons.push("تباين سلبي على MACD");
  
  if (Math.abs(asset.change) > 2) reasons.push("حجم تداول فوق المتوسط");
  if (asset.change > 3) reasons.push("زخم صعودي قوي");
  if (asset.change < -3) reasons.push("ضغط بيعي متزايد");
  
  if (asset.up && asset.rsi > 50) reasons.push("اتجاه صاعد مستمر");
  if (!asset.up && asset.rsi < 50) reasons.push("اتجاه هابط مستمر");
  
  if (reasons.length < 2) {
    reasons.push(direction === "صعودي" ? "ارتداد من دعم ديناميكي" : "مقاومة فنية قوية");
  }
  
  return reasons.slice(0, 4);
}

function assetToSignal(asset: Asset): DynamicSignal {
  const direction = asset.signal === "شراء" || (asset.up && asset.rsi > 50) ? "صعودي" : "هبوطي";
  
  // Confidence based on RSI alignment + change strength
  const rsiAlignment = direction === "صعودي" ? (asset.rsi > 50 ? 1 : 0) : (asset.rsi < 50 ? 1 : 0);
  const macdAlignment = (direction === "صعودي" && asset.macd === "صعودي") || (direction === "هبوطي" && asset.macd === "هبوطي") ? 1 : 0;
  const changeStrength = Math.min(Math.abs(asset.change) / 5, 1);
  const confidence = Math.round(60 + rsiAlignment * 12 + macdAlignment * 10 + changeStrength * 10 + Math.random() * 5);
  const clampedConfidence = Math.min(Math.max(confidence, 55), 96);
  
  // Alpha score
  const alphaScore = Math.min(Math.max(clampedConfidence - 5 + Math.round(Math.random() * 10 - 5), 50), 98);
  
  // Convergence
  let convergence = 1;
  if (rsiAlignment) convergence++;
  if (macdAlignment) convergence++;
  if (Math.abs(asset.change) > 1) convergence++;
  if ((direction === "صعودي" && asset.rsi > 55) || (direction === "هبوطي" && asset.rsi < 45)) convergence++;
  convergence = Math.min(convergence, 5);
  
  // Sentiment
  const sentiment = direction === "صعودي" 
    ? Math.round(55 + Math.abs(asset.change) * 5 + Math.random() * 15)
    : Math.round(45 - Math.abs(asset.change) * 5 - Math.random() * 15);
  const clampedSentiment = Math.min(Math.max(sentiment, 15), 92);
  
  // MACD histogram
  const macdHist = asset.macd === "صعودي" 
    ? `+${(Math.abs(asset.change) * 2 + Math.random() * 5).toFixed(1)}`
    : asset.macd === "هبوطي"
    ? `-${(Math.abs(asset.change) * 2 + Math.random() * 5).toFixed(1)}`
    : `${(Math.random() * 2 - 1).toFixed(1)}`;
  
  // Liquidity
  const liqAmount = (Math.random() * 3 + 0.2).toFixed(1);
  const liquidity = direction === "صعودي" ? `+$${liqAmount}M` : `-$${liqAmount}M`;
  
  // Risk
  const risk = clampedConfidence >= 82 ? "منخفض" : clampedConfidence >= 70 ? "متوسط" : "مرتفع";
  
  // Time frame
  const timeFrames = ["1H", "4H", "D1"];
  const timeFrame = timeFrames[Math.floor(Math.abs(asset.change * 10) % 3)];
  
  // RR
  const rr = `1:${(2 + Math.random() * 1.5).toFixed(1)}`;

  return {
    pair: asset.pair,
    direction,
    confidence: clampedConfidence,
    entry: formatPrice(asset.price),
    target1: computeTarget(asset.price, direction, 0.015),
    target2: computeTarget(asset.price, direction, 0.03),
    sl: computeSL(asset.price, direction),
    rr,
    timeFrame,
    alphaScore,
    rsi: asset.rsi,
    rsiSignal: getRsiSignal(asset.rsi),
    macd: asset.macd,
    macdHist,
    bbPosition: getBBPosition(asset.rsi, asset.change),
    volume: `${asset.change >= 0 ? "+" : ""}${Math.round(Math.abs(asset.change) * 10 + Math.random() * 20)}%`,
    sentiment: clampedSentiment,
    liquidity,
    convergence,
    reasons: generateReasons(asset, direction),
    risk,
    icon: asset.icon,
    category: asset.category,
  };
}

// Priority order: major assets first
const PRIORITY_PAIRS = [
  "BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT",
  "ADA/USDT", "DOGE/USDT", "DOT/USDT", "AVAX/USDT", "LINK/USDT",
  "GOLD", "SILVER", "OIL",
  "EUR/USD", "GBP/USD", "USD/JPY",
];

export const useSignals = () => {
  const assets = useLivePrices();
  
  const signals = useMemo(() => {
    // Stable sort: sort once by priority, don't re-shuffle on price updates
    const sorted = [...assets].sort((a, b) => {
      const idxA = PRIORITY_PAIRS.indexOf(a.pair);
      const idxB = PRIORITY_PAIRS.indexOf(b.pair);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      // Stable fallback: alphabetical
      return a.pair.localeCompare(b.pair);
    });
    return sorted.map(assetToSignal);
  }, [assets]);
  
  return { signals };
};
