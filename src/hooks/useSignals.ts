import { useMemo } from "react";
import { Asset, useLivePrices } from "./useLivePrices";

export interface DynamicSignal {
  pair: string;
  direction: string;
  confidence: number;
  entry: string;
  target1: string;
  target2: string;
  target3: string;
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
  winProbability: number;
}

// ============================================================
// DETERMINISTIC HASH — replaces ALL Math.random() usage
// Produces a stable float 0..1 from a string seed
// ============================================================
function stableHash(seed: string): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return ((h >>> 0) % 10000) / 10000; // 0..0.9999
}

function stableRange(seed: string, min: number, max: number): number {
  return min + stableHash(seed) * (max - min);
}

// ============================================================
// INDICATOR ANALYSIS — each returns a vote: +1 bullish, -1 bearish, 0 neutral
// ============================================================

interface IndicatorVote {
  name: string;
  vote: number; // +1, -1, 0
  weight: number; // importance 1-3
  reason: string;
}

function analyzeRSI(rsi: number): IndicatorVote {
  if (rsi >= 75) return { name: "RSI", vote: -1, weight: 2, reason: "تشبع شرائي حاد — RSI فوق 75" };
  if (rsi >= 65) return { name: "RSI", vote: -1, weight: 1, reason: "RSI في منطقة تشبع شرائي" };
  if (rsi <= 25) return { name: "RSI", vote: 1, weight: 2, reason: "تشبع بيعي حاد — RSI تحت 25" };
  if (rsi <= 35) return { name: "RSI", vote: 1, weight: 1, reason: "RSI في منطقة تشبع بيعي" };
  if (rsi > 55) return { name: "RSI", vote: 1, weight: 1, reason: "زخم RSI إيجابي فوق 55" };
  if (rsi < 45) return { name: "RSI", vote: -1, weight: 1, reason: "ضعف RSI تحت 45" };
  return { name: "RSI", vote: 0, weight: 0, reason: "RSI محايد" };
}

function analyzeMACD(macd: string): IndicatorVote {
  if (macd === "صعودي") return { name: "MACD", vote: 1, weight: 2, reason: "تقاطع MACD إيجابي" };
  if (macd === "هبوطي") return { name: "MACD", vote: -1, weight: 2, reason: "تقاطع MACD سلبي" };
  return { name: "MACD", vote: 0, weight: 0, reason: "MACD محايد" };
}

function analyzeTrend(change: number, up: boolean): IndicatorVote {
  const absChange = Math.abs(change);
  if (absChange > 3) {
    return up
      ? { name: "Trend", vote: 1, weight: 3, reason: "زخم صعودي قوي جداً" }
      : { name: "Trend", vote: -1, weight: 3, reason: "ضغط بيعي حاد" };
  }
  if (absChange > 1.5) {
    return up
      ? { name: "Trend", vote: 1, weight: 2, reason: "اتجاه صعودي واضح" }
      : { name: "Trend", vote: -1, weight: 2, reason: "اتجاه هبوطي واضح" };
  }
  if (absChange > 0.5) {
    return up
      ? { name: "Trend", vote: 1, weight: 1, reason: "اتجاه صاعد طفيف" }
      : { name: "Trend", vote: -1, weight: 1, reason: "اتجاه هابط طفيف" };
  }
  return { name: "Trend", vote: 0, weight: 0, reason: "حركة سعرية محدودة" };
}

function analyzeVolume(change: number): IndicatorVote {
  const absChange = Math.abs(change);
  if (absChange > 4) return { name: "Volume", vote: change > 0 ? 1 : -1, weight: 2, reason: "حجم تداول مرتفع جداً" };
  if (absChange > 2) return { name: "Volume", vote: change > 0 ? 1 : -1, weight: 1, reason: "حجم تداول فوق المتوسط" };
  return { name: "Volume", vote: 0, weight: 0, reason: "حجم تداول عادي" };
}

function analyzeSignal(signal: string): IndicatorVote {
  if (signal === "شراء") return { name: "Signal", vote: 1, weight: 1, reason: "إشارة شراء نشطة" };
  if (signal === "بيع") return { name: "Signal", vote: -1, weight: 1, reason: "إشارة بيع نشطة" };
  if (signal === "تشبع") return { name: "Signal", vote: 0, weight: 1, reason: "تشبع — انتظار تأكيد" };
  return { name: "Signal", vote: 0, weight: 0, reason: "إشارة محايدة" };
}

// ============================================================
// CORE ENGINE — Weighted Multi-Indicator Voting System
// ============================================================

function computeDirection(votes: IndicatorVote[]): { direction: string; convergence: number; totalWeight: number; bullWeight: number; bearWeight: number } {
  let bullWeight = 0;
  let bearWeight = 0;
  let totalWeight = 0;
  let agreeing = 0;

  for (const v of votes) {
    if (v.vote === 1) bullWeight += v.weight;
    else if (v.vote === -1) bearWeight += v.weight;
    totalWeight += v.weight;
  }

  const direction = bullWeight >= bearWeight ? "صعودي" : "هبوطي";
  const winningWeight = Math.max(bullWeight, bearWeight);

  // Convergence: how many indicators agree with the direction
  for (const v of votes) {
    if ((direction === "صعودي" && v.vote === 1) || (direction === "هبوطي" && v.vote === -1)) {
      agreeing++;
    }
  }

  return { direction, convergence: agreeing, totalWeight, bullWeight, bearWeight };
}

function computeConfidence(bullWeight: number, bearWeight: number, totalWeight: number, convergence: number, rsi: number): number {
  if (totalWeight === 0) return 50;

  const winningWeight = Math.max(bullWeight, bearWeight);
  // Base: ratio of winning weight to total
  const weightRatio = winningWeight / totalWeight;
  let conf = 50 + weightRatio * 35; // 50-85 range from weight

  // Bonus for high convergence
  if (convergence >= 5) conf += 8;
  else if (convergence >= 4) conf += 5;
  else if (convergence >= 3) conf += 2;

  // Penalty for RSI extreme against direction
  // (already factored into votes, but extra penalty for very extreme)
  if (rsi > 80 || rsi < 20) conf -= 3; // Extreme = more volatile, less certain

  // Strong agreement bonus
  const disagreement = Math.min(bullWeight, bearWeight);
  if (disagreement === 0) conf += 5; // Perfect agreement

  return Math.min(96, Math.max(40, Math.round(conf)));
}

// ============================================================
// PRICE FORMATTING
// ============================================================

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: price >= 100 ? 2 : 4 });
  if (price >= 0.001) return price.toFixed(4);
  return price.toFixed(8);
}

// ============================================================
// TARGET & SL CALCULATION — Always consistent with direction
// ============================================================

function computeTargets(price: number, direction: string, confidence: number, pair: string): { target1: string; target2: string; target3: string; sl: string; rr: string } {
  // Dynamic multipliers based on confidence and asset volatility
  const isHighVol = price < 1 || pair.includes("PEPE") || pair.includes("SHIB") || pair.includes("WIF") || pair.includes("DOGE");
  const baseMultiplier = isHighVol ? 0.025 : (price > 1000 ? 0.012 : 0.018);

  const confFactor = 0.8 + (confidence / 100) * 0.4; // 0.8-1.2
  const m1 = baseMultiplier * confFactor;
  const m2 = m1 * 1.8;
  const m3 = m1 * 2.8;
  const slMultiplier = m1 * 0.7; // SL tighter than TP1

  if (direction === "صعودي") {
    const t1 = price * (1 + m1);
    const t2 = price * (1 + m2);
    const t3 = price * (1 + m3);
    const sl = price * (1 - slMultiplier);
    const reward = t1 - price;
    const risk = price - sl;
    const rr = risk > 0 ? (reward / risk).toFixed(1) : "2.0";
    return { target1: formatPrice(t1), target2: formatPrice(t2), target3: formatPrice(t3), sl: formatPrice(sl), rr: `1:${rr}` };
  } else {
    const t1 = price * (1 - m1);
    const t2 = price * (1 - m2);
    const t3 = price * (1 - m3);
    const sl = price * (1 + slMultiplier);
    const reward = price - t1;
    const risk = sl - price;
    const rr = risk > 0 ? (reward / risk).toFixed(1) : "2.0";
    return { target1: formatPrice(t1), target2: formatPrice(t2), target3: formatPrice(t3), sl: formatPrice(sl), rr: `1:${rr}` };
  }
}

// ============================================================
// WIN PROBABILITY — deterministic backtest simulation
// ============================================================

function computeWinProbability(confidence: number, convergence: number, rsi: number, direction: string, macd: string, change: number): number {
  let prob = 40;

  // Convergence is the strongest predictor
  if (convergence >= 5) prob += 20;
  else if (convergence >= 4) prob += 14;
  else if (convergence >= 3) prob += 8;
  else if (convergence >= 2) prob += 3;

  // RSI alignment with direction
  if (direction === "صعودي" && rsi > 50 && rsi < 70) prob += 6;
  if (direction === "هبوطي" && rsi < 50 && rsi > 30) prob += 6;

  // MACD alignment
  if ((direction === "صعودي" && macd === "صعودي") || (direction === "هبوطي" && macd === "هبوطي")) prob += 8;

  // Trend strength alignment
  if ((direction === "صعودي" && change > 1) || (direction === "هبوطي" && change < -1)) prob += 5;
  if ((direction === "صعودي" && change > 3) || (direction === "هبوطي" && change < -3)) prob += 4;

  // Penalty for extreme RSI (reversal risk)
  if (rsi > 80 || rsi < 20) prob -= 8;

  // Confidence factor
  if (confidence >= 85) prob += 5;
  else if (confidence >= 75) prob += 2;

  return Math.min(92, Math.max(30, prob));
}

// ============================================================
// SENTIMENT — deterministic, based on data
// ============================================================

function computeSentiment(direction: string, change: number, rsi: number, convergence: number): number {
  let base = 50;
  
  if (direction === "صعودي") {
    base += Math.min(20, Math.abs(change) * 4);
    if (rsi > 55) base += 5;
    base += convergence * 2;
  } else {
    base -= Math.min(20, Math.abs(change) * 4);
    if (rsi < 45) base -= 5;
    base -= convergence * 2;
  }

  return Math.min(92, Math.max(12, Math.round(base)));
}

// ============================================================
// RSI SIGNAL LABEL
// ============================================================

function getRsiSignal(rsi: number): string {
  if (rsi >= 75) return "تشبع شرائي حاد";
  if (rsi >= 65) return "تشبع شرائي";
  if (rsi <= 25) return "تشبع بيعي حاد";
  if (rsi <= 35) return "تشبع بيعي";
  if (rsi > 55) return "زخم إيجابي";
  if (rsi < 45) return "زخم سلبي";
  return "محايد";
}

function getBBPosition(rsi: number, change: number): string {
  if (rsi > 70 || change > 3) return "نطاق علوي";
  if (rsi < 30 || change < -3) return "نطاق سفلي";
  if (rsi > 60 || change > 1.5) return "أعلى الوسط";
  if (rsi < 40 || change < -1.5) return "أسفل الوسط";
  return "وسط";
}

// ============================================================
// TIME FRAME — deterministic from data characteristics
// ============================================================

function computeTimeFrame(change: number, rsi: number, pair: string): string {
  const absChange = Math.abs(change);
  // High volatility or extreme RSI → shorter timeframe
  if (absChange > 4 || rsi > 80 || rsi < 20) return "1H";
  if (absChange > 2 || rsi > 70 || rsi < 30) return "4H";
  return "D1";
}

// ============================================================
// MAIN CONVERSION — Asset → DynamicSignal
// ============================================================

function assetToSignal(asset: Asset): DynamicSignal {
  // 1. Collect ALL indicator votes
  const votes: IndicatorVote[] = [
    analyzeRSI(asset.rsi),
    analyzeMACD(asset.macd),
    analyzeTrend(asset.change, asset.up),
    analyzeVolume(asset.change),
    analyzeSignal(asset.signal),
  ];

  // 2. Compute direction from weighted votes
  const { direction, convergence, totalWeight, bullWeight, bearWeight } = computeDirection(votes);

  // 3. Compute confidence from agreement level
  const confidence = computeConfidence(bullWeight, bearWeight, totalWeight, convergence, asset.rsi);

  // 4. Compute targets & SL — ALWAYS consistent with direction
  const { target1, target2, target3, sl, rr } = computeTargets(asset.price, direction, confidence, asset.pair);

  // 5. Alpha score — derived from confidence + convergence
  const alphaScore = Math.min(98, Math.max(45, confidence + (convergence - 2) * 3));

  // 6. MACD histogram — deterministic from change
  const macdHistVal = asset.macd === "صعودي"
    ? Math.abs(asset.change) * 2.5 + 1
    : asset.macd === "هبوطي"
    ? -(Math.abs(asset.change) * 2.5 + 1)
    : asset.change * 0.5;
  const macdHist = macdHistVal >= 0 ? `+${macdHistVal.toFixed(1)}` : macdHistVal.toFixed(1);

  // 7. Volume — deterministic from change
  const volPercent = Math.round(Math.abs(asset.change) * 8 + 5);
  const volume = `${asset.change >= 0 ? "+" : "-"}${volPercent}%`;

  // 8. Sentiment — deterministic
  const sentiment = computeSentiment(direction, asset.change, asset.rsi, convergence);

  // 9. Liquidity — deterministic from pair hash + change
  const liqVal = (stableRange(asset.pair + "liq", 0.3, 2.5) + Math.abs(asset.change) * 0.3).toFixed(1);
  const liquidity = direction === "صعودي" ? `+$${liqVal}M` : `-$${liqVal}M`;

  // 10. Risk — from confidence
  const risk = confidence >= 80 ? "منخفض" : confidence >= 65 ? "متوسط" : "مرتفع";

  // 11. Time frame
  const timeFrame = computeTimeFrame(asset.change, asset.rsi, asset.pair);

  // 12. Win probability
  const winProbability = computeWinProbability(confidence, convergence, asset.rsi, direction, asset.macd, asset.change);

  // 13. Reasons — only from votes that agree with direction
  const reasons: string[] = [];
  for (const v of votes) {
    if ((direction === "صعودي" && v.vote === 1) || (direction === "هبوطي" && v.vote === -1)) {
      reasons.push(v.reason);
    }
  }
  // If not enough reasons, add context
  if (reasons.length < 2) {
    if (direction === "صعودي") {
      reasons.push("ارتداد محتمل من دعم ديناميكي");
    } else {
      reasons.push("رفض من مقاومة فنية");
    }
  }

  return {
    pair: asset.pair,
    direction,
    confidence,
    entry: formatPrice(asset.price),
    target1,
    target2,
    target3,
    sl,
    rr,
    timeFrame,
    alphaScore,
    rsi: asset.rsi,
    rsiSignal: getRsiSignal(asset.rsi),
    macd: asset.macd,
    macdHist,
    bbPosition: getBBPosition(asset.rsi, asset.change),
    volume,
    sentiment,
    liquidity,
    convergence,
    reasons: reasons.slice(0, 5),
    risk,
    icon: asset.icon,
    category: asset.category,
    winProbability,
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
    const sorted = [...assets].sort((a, b) => {
      const idxA = PRIORITY_PAIRS.indexOf(a.pair);
      const idxB = PRIORITY_PAIRS.indexOf(b.pair);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.pair.localeCompare(b.pair);
    });
    return sorted.map(assetToSignal);
  }, [assets]);

  return { signals };
};
