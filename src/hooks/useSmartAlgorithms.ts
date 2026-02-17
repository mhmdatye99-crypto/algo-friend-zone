import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useChallenges } from "@/hooks/useChallenges";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";

export interface TraderScore {
  overall: number;
  discipline: number;
  riskManagement: number;
  consistency: number;
  profitability: number;
  grade: string;
  gradeAr: string;
  color: string;
}

export interface MarketPattern {
  name: string;
  nameAr: string;
  confidence: number;
  direction: "bullish" | "bearish" | "neutral";
  pairs: string[];
}

export interface SmartAlert {
  id: string;
  type: "risk" | "opportunity" | "behavior" | "pattern" | "liquidity" | "volatility";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  icon: string;
}

export interface RiskScore {
  score: number;
  label: string;
  color: string;
  factors: { name: string; value: number; status: "good" | "warning" | "danger" }[];
}

export interface LiquidityBlock {
  pair: string;
  type: "institutional_buy" | "institutional_sell" | "liquidity_gap";
  level: string;
  strength: number;
  description: string;
}

export interface VolatilityMetric {
  stressLevel: number;
  label: string;
  color: string;
  trend: "rising" | "falling" | "stable";
  avgVolatility: number;
  highVolPairs: string[];
}

export function useSmartAlgorithms() {
  const { signals } = useSignals();
  const { latestScore } = useChallenges();
  const { stats } = useGoalPlanner();

  // === TRADER PERFORMANCE SCORE ===
  const traderScore: TraderScore = useMemo(() => {
    const discipline = latestScore?.score ?? 50;
    const winSignals = signals.filter(s => s.confidence >= 75).length;
    const totalSignals = signals.length || 1;
    const profitability = Math.round((winSignals / totalSignals) * 100);
    const riskManagement = Math.min(100, Math.round(discipline * 0.8 + (stats?.progress ?? 30) * 0.2));
    const consistency = Math.min(100, Math.round((discipline + profitability) / 2));
    const overall = Math.round(discipline * 0.3 + riskManagement * 0.25 + consistency * 0.25 + profitability * 0.2);

    let grade = "D", gradeAr = "مبتدئ", color = "text-destructive";
    if (overall >= 90) { grade = "A+"; gradeAr = "محترف"; color = "text-primary"; }
    else if (overall >= 75) { grade = "A"; gradeAr = "متقدم"; color = "text-success"; }
    else if (overall >= 60) { grade = "B"; gradeAr = "متوسط"; color = "text-warning"; }
    else if (overall >= 40) { grade = "C"; gradeAr = "مبتدئ+"; color = "text-warning"; }

    return { overall, discipline, riskManagement, consistency, profitability, grade, gradeAr, color };
  }, [latestScore, signals, stats]);

  // === MARKET PATTERN ANALYSIS ===
  const patterns: MarketPattern[] = useMemo(() => {
    const bullishSignals = signals.filter(s => s.direction === "صعودي" && s.confidence >= 70);
    const bearishSignals = signals.filter(s => s.direction === "هبوطي" && s.confidence >= 70);
    const result: MarketPattern[] = [];

    if (bullishSignals.length >= 3) {
      result.push({
        name: "Bullish Momentum",
        nameAr: "زخم صعودي قوي",
        confidence: Math.round(bullishSignals.reduce((s, sig) => s + sig.confidence, 0) / bullishSignals.length),
        direction: "bullish",
        pairs: bullishSignals.slice(0, 3).map(s => s.pair),
      });
    }

    if (bearishSignals.length >= 3) {
      result.push({
        name: "Bearish Pressure",
        nameAr: "ضغط هبوطي",
        confidence: Math.round(bearishSignals.reduce((s, sig) => s + sig.confidence, 0) / bearishSignals.length),
        direction: "bearish",
        pairs: bearishSignals.slice(0, 3).map(s => s.pair),
      });
    }

    const overbought = signals.filter(s => (s.rsi ?? 50) > 70);
    const oversold = signals.filter(s => (s.rsi ?? 50) < 30);

    if (overbought.length >= 2) {
      result.push({ name: "RSI Overbought Zone", nameAr: "منطقة تشبع شرائي", confidence: 72, direction: "bearish", pairs: overbought.slice(0, 3).map(s => s.pair) });
    }
    if (oversold.length >= 2) {
      result.push({ name: "RSI Oversold Zone", nameAr: "منطقة تشبع بيعي", confidence: 68, direction: "bullish", pairs: oversold.slice(0, 3).map(s => s.pair) });
    }

    // MACD Convergence detection
    const macdBullish = signals.filter(s => s.macd === "صعودي" && s.confidence >= 65);
    if (macdBullish.length >= 4) {
      result.push({ name: "MACD Convergence", nameAr: "تقارب MACD إيجابي", confidence: 74, direction: "bullish", pairs: macdBullish.slice(0, 3).map(s => s.pair) });
    }

    return result;
  }, [signals]);

  // === X-LOGIC: LIQUIDITY ENGINE (Enhanced — uses convergence, sentiment, winProbability) ===
  const liquidityBlocks: LiquidityBlock[] = useMemo(() => {
    return signals.slice(0, 12).map(s => {
      const isBuy = s.direction === "صعودي";

      // Parse liquidity flow value from signal
      const liqFlow = parseFloat(s.liquidity.replace(/[^0-9.]/g, "")) || 0;

      // Strength = weighted combination of convergence, confidence, sentiment extremity, and win probability
      const sentimentExtremity = Math.abs(s.sentiment - 50) / 50; // 0..1
      const convergenceScore = (s.convergence / 5) * 30; // 0-30
      const confidenceScore = (s.confidence / 100) * 25; // 0-25
      const sentimentScore = sentimentExtremity * 20; // 0-20
      const winProbScore = (s.winProbability / 100) * 25; // 0-25
      const strength = Math.min(100, Math.round(convergenceScore + confidenceScore + sentimentScore + winProbScore));

      // Detect type: liquidity gap when high volume diverges from sentiment
      const volPercent = Math.abs(parseFloat(s.volume.replace(/[^0-9.]/g, "")) || 0);
      const isGap = (volPercent > 30 && sentimentExtremity < 0.3) || (liqFlow > 1.5 && s.convergence <= 2);

      const typeLabel = isGap
        ? "liquidity_gap" as const
        : isBuy ? "institutional_buy" as const : "institutional_sell" as const;

      const description = isGap
        ? `فجوة سيولة عند ${s.entry} — تباين بين الحجم (${s.volume}) والمشاعر (${s.sentiment}%) يشير لحركة حادة`
        : isBuy
        ? `كتلة شرائية مؤسسية عند ${s.entry} — تقارب ${s.convergence}/5 مع ثقة ${s.confidence}% واحتمال فوز ${s.winProbability}%`
        : `ضغط بيعي مؤسسي عند ${s.entry} — تقارب ${s.convergence}/5 مع مشاعر سلبية ${s.sentiment}%`;

      return { pair: s.pair, type: typeLabel, level: s.entry, strength, description };
    }).filter(b => b.strength >= 55).sort((a, b) => b.strength - a.strength);
  }, [signals]);

  // === X-LOGIC: VOLATILITY ENGINE (Enhanced — multi-factor stress calculation) ===
  const volatilityMetric: VolatilityMetric = useMemo(() => {
    if (signals.length === 0) return { stressLevel: 30, label: "مستقر", color: "text-success", trend: "stable", avgVolatility: 0, highVolPairs: [] };

    // Factor 1: Volume intensity across all signals
    const volumes = signals.map(s => Math.abs(parseFloat(s.volume.replace(/[^0-9.]/g, "")) || 0));
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    // Factor 2: RSI extremes (overbought/oversold count)
    const rsiExtremes = signals.filter(s => s.rsi > 70 || s.rsi < 30).length;
    const rsiExtremeRatio = rsiExtremes / signals.length;

    // Factor 3: High-risk signal ratio
    const highRiskCount = signals.filter(s => s.risk === "مرتفع").length;
    const highRiskRatio = highRiskCount / signals.length;

    // Factor 4: Sentiment dispersion (how divided is the market?)
    const sentiments = signals.map(s => s.sentiment);
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const sentimentVariance = sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
    const sentimentDispersion = Math.min(1, Math.sqrt(sentimentVariance) / 30); // normalized 0..1

    // Factor 5: Low convergence signals (conflicting indicators)
    const lowConvergence = signals.filter(s => s.convergence <= 2).length;
    const conflictRatio = lowConvergence / signals.length;

    // Factor 6: MACD histogram extremes
    const macdExtremes = signals.filter(s => Math.abs(parseFloat(s.macdHist.replace(/[^0-9.-]/g, "")) || 0) > 5).length;

    // Composite stress level
    const stressLevel = Math.min(100, Math.round(
      avgVol * 1.2 +
      rsiExtremeRatio * 25 +
      highRiskRatio * 20 +
      sentimentDispersion * 15 +
      conflictRatio * 10 +
      macdExtremes * 3
    ));

    // Identify high-volatility pairs (above-average volume + extreme RSI or high risk)
    const highVolPairs = signals
      .filter(s => {
        const vol = Math.abs(parseFloat(s.volume.replace(/[^0-9.]/g, "")) || 0);
        return vol > avgVol * 1.3 || s.rsi > 75 || s.rsi < 25 || s.risk === "مرتفع";
      })
      .sort((a, b) => b.winProbability - a.winProbability)
      .map(s => s.pair)
      .slice(0, 5);

    // Determine trend from sentiment and convergence balance
    const bullishSentiment = signals.filter(s => s.sentiment > 60).length;
    const bearishSentiment = signals.filter(s => s.sentiment < 40).length;
    let trend: "rising" | "falling" | "stable" = "stable";
    if (stressLevel >= 60 && (bullishSentiment > bearishSentiment * 1.5 || bearishSentiment > bullishSentiment * 1.5)) {
      trend = "rising";
    } else if (stressLevel < 35) {
      trend = "falling";
    }

    let label = "مستقر", color = "text-success";
    if (stressLevel >= 75) { label = "إجهاد حاد"; color = "text-destructive"; }
    else if (stressLevel >= 55) { label = "إجهاد متوسط"; color = "text-warning"; }
    else if (stressLevel >= 35) { label = "منخفض"; color = "text-success"; }

    return { stressLevel, label, color, trend, avgVolatility: Math.round(avgVol * 10) / 10, highVolPairs };
  }, [signals]);

  // === X-LOGIC: PROBABILITY ENGINE — uses winProbability directly from signal engine ===
  const signalProbabilities: Map<string, number> = useMemo(() => {
    const map = new Map<string, number>();
    signals.forEach(s => {
      map.set(s.pair, s.winProbability);
    });
    return map;
  }, [signals]);

  // === SMART ALERTS ===
  const alerts: SmartAlert[] = useMemo(() => {
    const result: SmartAlert[] = [];

    if (traderScore.discipline < 40) {
      result.push({ id: "low-discipline", type: "behavior", title: "تحذير انضباط", message: "مستوى الانضباط منخفض — راجع خطة التداول", severity: "high", icon: "⚠️" });
    }

    const highConfSignals = signals.filter(s => s.confidence >= 85);
    if (highConfSignals.length > 0) {
      result.push({ id: "high-conf", type: "opportunity", title: "فرصة ذهبية", message: `${highConfSignals.length} إشارة بثقة عالية (+85%) متاحة الآن`, severity: "medium", icon: "🔥" });
    }

    // Liquidity alerts
    const gaps = liquidityBlocks.filter(b => b.type === "liquidity_gap");
    if (gaps.length > 0) {
      result.push({ id: "liq-gap", type: "liquidity", title: "فجوة سيولة", message: `تم رصد فجوات سيولة في ${gaps.map(g => g.pair).join("، ")}`, severity: "high", icon: "💧" });
    }

    // Volatility alerts
    if (volatilityMetric.stressLevel >= 70) {
      result.push({ id: "vol-stress", type: "volatility", title: "إجهاد سوق عالي", message: `مستوى الإجهاد ${volatilityMetric.stressLevel}% — تقليل حجم المراكز مُوصى`, severity: "high", icon: "⚡" });
    }

    patterns.forEach(p => {
      result.push({ id: `pattern-${p.name}`, type: "pattern", title: p.nameAr, message: `تم رصد ${p.name} في ${p.pairs.join("، ")}`, severity: p.confidence >= 75 ? "high" : "medium", icon: p.direction === "bullish" ? "📈" : "📉" });
    });

    if (stats && stats.progress >= 80) {
      result.push({ id: "goal-near", type: "opportunity", title: "اقتربت من هدفك!", message: `تقدمك ${Math.round(stats.progress)}% — استمر بالانضباط`, severity: "low", icon: "🎯" });
    }

    return result.slice(0, 6);
  }, [traderScore, signals, patterns, stats, liquidityBlocks, volatilityMetric]);

  // === RISK SCORE ===
  const riskScore: RiskScore = useMemo(() => {
    const disciplineFactor = traderScore.discipline;
    const volatilityFactor = signals.length > 0
      ? Math.round(100 - (signals.filter(s => s.confidence < 50).length / signals.length) * 100)
      : 70;
    const diversificationFactor = Math.min(100, signals.length * 10);

    const score = Math.round(disciplineFactor * 0.4 + volatilityFactor * 0.35 + diversificationFactor * 0.25);

    let label = "خطر عالي", color = "text-destructive";
    if (score >= 75) { label = "آمن"; color = "text-success"; }
    else if (score >= 50) { label = "متوسط"; color = "text-warning"; }

    return {
      score, label, color,
      factors: [
        { name: "الانضباط", value: disciplineFactor, status: disciplineFactor >= 70 ? "good" : disciplineFactor >= 40 ? "warning" : "danger" },
        { name: "التقلب", value: volatilityFactor, status: volatilityFactor >= 70 ? "good" : volatilityFactor >= 40 ? "warning" : "danger" },
        { name: "التنويع", value: diversificationFactor, status: diversificationFactor >= 60 ? "good" : diversificationFactor >= 30 ? "warning" : "danger" },
      ],
    };
  }, [traderScore, signals]);

  return { traderScore, patterns, alerts, riskScore, liquidityBlocks, volatilityMetric, signalProbabilities };
}
