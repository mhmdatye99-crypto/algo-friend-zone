export interface AIIndicator {
  name: string;
  value?: string | null;
  signal?: string | null;
  detected?: boolean;
}

export interface AIAnalysisResult {
  pair?: string;
  timeframe?: string;
  pattern?: string;
  patternAr?: string;
  patternConfidence?: number;
  direction?: string;
  directionAr?: string;
  directionConfidence?: number;
  supportLevels?: string[];
  resistanceLevels?: string[];
  indicators?: AIIndicator[];
  entry?: string;
  stopLoss?: string;
  takeProfit1?: string;
  takeProfit2?: string;
  riskReward?: string;
  strategy?: string;
  reasoning?: string[];
  summary?: string;
  /** Optional richer context — may be absent depending on chart clarity */
  marketStructure?: string | null;
  momentum?: string | null;
  volatility?: string | null;
  trend?: string | null;
  bullishScenario?: string | null;
  bearishScenario?: string | null;
  waitCondition?: string | null;
  error?: string;
}

/** Normalized bias used across the result UI and future share cards. */
export type Bias = "long" | "short" | "wait";

export const getBias = (a: AIAnalysisResult): Bias => {
  if (a.direction === "bullish") return "long";
  if (a.direction === "bearish") return "short";
  return "wait";
};

/** Everything a future share card needs, derived from the real analysis only. */
export interface ShareableAnalysis {
  pair: string | null;
  timeframe: string | null;
  bias: Bias;
  confidence: number | null;
  entry: string | null;
  stopLoss: string | null;
  takeProfit1: string | null;
  takeProfit2: string | null;
  createdAt: string;
}

export const toShareable = (a: AIAnalysisResult, createdAt: string): ShareableAnalysis => ({
  pair: a.pair || null,
  timeframe: a.timeframe || null,
  bias: getBias(a),
  confidence: typeof a.directionConfidence === "number" ? a.directionConfidence : null,
  entry: a.entry || null,
  stopLoss: a.stopLoss || null,
  takeProfit1: a.takeProfit1 || null,
  takeProfit2: a.takeProfit2 || null,
  createdAt,
});

export const NA = "غير متوفر";
