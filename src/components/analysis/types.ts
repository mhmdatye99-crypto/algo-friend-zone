export interface AIIndicator {
  name: string;
  value?: string | null;
  signal?: string | null;
  detected?: boolean;
}

export interface AIAnalysisResult {
  pair?: string;
  timeframe?: string;
  currentPrice?: string | number | null;
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
  const d = (a.direction || "").toLowerCase();
  const ar = a.directionAr || "";
  if (d.includes("bullish") || d === "long" || ar.includes("صاعد")) return "long";
  if (d.includes("bearish") || d === "short" || ar.includes("هابط")) return "short";
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

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const list = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const clean = value.map(text).filter((item): item is string => Boolean(item));
  return clean.length ? clean : undefined;
};

/** Keeps only usable values from the existing service response. It never derives market data. */
export const normalizeAnalysis = (value: unknown): AIAnalysisResult | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const error = text(raw.error);
  if (error) return { error };

  const indicators = Array.isArray(raw.indicators)
    ? raw.indicators.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return [];
        const indicator = item as Record<string, unknown>;
        const name = text(indicator.name);
        if (!name || indicator.detected === false) return [];
        return [{
          name,
          value: text(indicator.value) ?? null,
          signal: text(indicator.signal) ?? null,
          detected: true,
        }];
      })
    : [];

  const confidence = typeof raw.directionConfidence === "number" && Number.isFinite(raw.directionConfidence)
    ? Math.max(0, Math.min(100, Math.round(raw.directionConfidence)))
    : undefined;
  const currentPrice = typeof raw.currentPrice === "number" && Number.isFinite(raw.currentPrice)
    ? raw.currentPrice
    : text(raw.currentPrice);

  const result: AIAnalysisResult = {
    pair: text(raw.pair), timeframe: text(raw.timeframe), currentPrice,
    pattern: text(raw.pattern), patternAr: text(raw.patternAr),
    patternConfidence: typeof raw.patternConfidence === "number" ? raw.patternConfidence : undefined,
    direction: text(raw.direction), directionAr: text(raw.directionAr), directionConfidence: confidence,
    supportLevels: list(raw.supportLevels), resistanceLevels: list(raw.resistanceLevels), indicators,
    entry: text(raw.entry), stopLoss: text(raw.stopLoss), takeProfit1: text(raw.takeProfit1),
    takeProfit2: text(raw.takeProfit2), riskReward: text(raw.riskReward), strategy: text(raw.strategy),
    reasoning: list(raw.reasoning), summary: text(raw.summary), marketStructure: text(raw.marketStructure),
    momentum: text(raw.momentum), volatility: text(raw.volatility), trend: text(raw.trend),
    bullishScenario: text(raw.bullishScenario), bearishScenario: text(raw.bearishScenario),
    waitCondition: text(raw.waitCondition),
  };

  const hasChartEvidence = Boolean(
    result.pair || result.timeframe || result.marketStructure || result.trend || result.reasoning?.length ||
    result.supportLevels?.length || result.resistanceLevels?.length || result.indicators?.length
  );
  if (!hasChartEvidence) return null;
  return result;
};
