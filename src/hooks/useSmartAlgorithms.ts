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

// === INSTITUTIONAL ALERT TYPES ===
export type InstitutionalAlertType = "liquidity_shift" | "volatility_expansion" | "structure_break" | "divergence" | "order_flow";

export interface SmartAlert {
  id: string;
  type: InstitutionalAlertType;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  icon: string;
  tag: string; // Institutional tag like [LIQ-SHIFT], [VOL-EXP]
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

// === DISCIPLINE STREAK ===
export interface DisciplineStreak {
  currentStreak: number;
  longestStreak: number;
  level: string;
  levelAr: string;
  unlockedRewards: string[];
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
        name: "Bullish Momentum", nameAr: "زخم صعودي قوي",
        confidence: Math.round(bullishSignals.reduce((s, sig) => s + sig.confidence, 0) / bullishSignals.length),
        direction: "bullish", pairs: bullishSignals.slice(0, 3).map(s => s.pair),
      });
    }
    if (bearishSignals.length >= 3) {
      result.push({
        name: "Bearish Pressure", nameAr: "ضغط هبوطي",
        confidence: Math.round(bearishSignals.reduce((s, sig) => s + sig.confidence, 0) / bearishSignals.length),
        direction: "bearish", pairs: bearishSignals.slice(0, 3).map(s => s.pair),
      });
    }

    const overbought = signals.filter(s => (s.rsi ?? 50) > 70);
    const oversold = signals.filter(s => (s.rsi ?? 50) < 30);
    if (overbought.length >= 2) result.push({ name: "RSI Overbought Zone", nameAr: "منطقة تشبع شرائي", confidence: 72, direction: "bearish", pairs: overbought.slice(0, 3).map(s => s.pair) });
    if (oversold.length >= 2) result.push({ name: "RSI Oversold Zone", nameAr: "منطقة تشبع بيعي", confidence: 68, direction: "bullish", pairs: oversold.slice(0, 3).map(s => s.pair) });

    const macdBullish = signals.filter(s => s.macd === "صعودي" && s.confidence >= 65);
    if (macdBullish.length >= 4) result.push({ name: "MACD Convergence", nameAr: "تقارب MACD إيجابي", confidence: 74, direction: "bullish", pairs: macdBullish.slice(0, 3).map(s => s.pair) });

    return result;
  }, [signals]);

  // === LIQUIDITY ENGINE ===
  const liquidityBlocks: LiquidityBlock[] = useMemo(() => {
    return signals.slice(0, 12).map(s => {
      const isBuy = s.direction === "صعودي";
      const liqFlow = parseFloat(s.liquidity.replace(/[^0-9.]/g, "")) || 0;
      const sentimentExtremity = Math.abs(s.sentiment - 50) / 50;
      const convergenceScore = (s.convergence / 5) * 30;
      const confidenceScore = (s.confidence / 100) * 25;
      const sentimentScore = sentimentExtremity * 20;
      const winProbScore = (s.winProbability / 100) * 25;
      const strength = Math.min(100, Math.round(convergenceScore + confidenceScore + sentimentScore + winProbScore));
      const volPercent = Math.abs(parseFloat(s.volume.replace(/[^0-9.]/g, "")) || 0);
      const isGap = (volPercent > 30 && sentimentExtremity < 0.3) || (liqFlow > 1.5 && s.convergence <= 2);
      const typeLabel = isGap ? "liquidity_gap" as const : isBuy ? "institutional_buy" as const : "institutional_sell" as const;
      const description = isGap
        ? `فجوة سيولة عند ${s.entry} — تباين حجم/مشاعر يشير لحركة حادة`
        : isBuy
        ? `كتلة شرائية مؤسسية عند ${s.entry} — تقارب ${s.convergence}/5`
        : `ضغط بيعي مؤسسي عند ${s.entry} — مشاعر سلبية ${s.sentiment}%`;
      return { pair: s.pair, type: typeLabel, level: s.entry, strength, description };
    }).filter(b => b.strength >= 55).sort((a, b) => b.strength - a.strength);
  }, [signals]);

  // === VOLATILITY ENGINE ===
  const volatilityMetric: VolatilityMetric = useMemo(() => {
    if (signals.length === 0) return { stressLevel: 30, label: "مستقر", color: "text-success", trend: "stable", avgVolatility: 0, highVolPairs: [] };
    const volumes = signals.map(s => Math.abs(parseFloat(s.volume.replace(/[^0-9.]/g, "")) || 0));
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const rsiExtremes = signals.filter(s => s.rsi > 70 || s.rsi < 30).length;
    const rsiExtremeRatio = rsiExtremes / signals.length;
    const highRiskCount = signals.filter(s => s.risk === "مرتفع").length;
    const highRiskRatio = highRiskCount / signals.length;
    const sentiments = signals.map(s => s.sentiment);
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const sentimentVariance = sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
    const sentimentDispersion = Math.min(1, Math.sqrt(sentimentVariance) / 30);
    const lowConvergence = signals.filter(s => s.convergence <= 2).length;
    const conflictRatio = lowConvergence / signals.length;
    const macdExtremes = signals.filter(s => Math.abs(parseFloat(s.macdHist.replace(/[^0-9.-]/g, "")) || 0) > 5).length;

    const stressLevel = Math.min(100, Math.round(avgVol * 1.2 + rsiExtremeRatio * 25 + highRiskRatio * 20 + sentimentDispersion * 15 + conflictRatio * 10 + macdExtremes * 3));
    const highVolPairs = signals
      .filter(s => { const vol = Math.abs(parseFloat(s.volume.replace(/[^0-9.]/g, "")) || 0); return vol > avgVol * 1.3 || s.rsi > 75 || s.rsi < 25 || s.risk === "مرتفع"; })
      .sort((a, b) => b.winProbability - a.winProbability).map(s => s.pair).slice(0, 5);

    const bullishSentiment = signals.filter(s => s.sentiment > 60).length;
    const bearishSentiment = signals.filter(s => s.sentiment < 40).length;
    let trend: "rising" | "falling" | "stable" = "stable";
    if (stressLevel >= 60 && (bullishSentiment > bearishSentiment * 1.5 || bearishSentiment > bullishSentiment * 1.5)) trend = "rising";
    else if (stressLevel < 35) trend = "falling";

    let label = "مستقر", color = "text-success";
    if (stressLevel >= 75) { label = "إجهاد حاد"; color = "text-destructive"; }
    else if (stressLevel >= 55) { label = "إجهاد متوسط"; color = "text-warning"; }
    else if (stressLevel >= 35) { label = "منخفض"; color = "text-success"; }

    return { stressLevel, label, color, trend, avgVolatility: Math.round(avgVol * 10) / 10, highVolPairs };
  }, [signals]);

  // === PROBABILITY ENGINE ===
  const signalProbabilities: Map<string, number> = useMemo(() => {
    const map = new Map<string, number>();
    signals.forEach(s => map.set(s.pair, s.winProbability));
    return map;
  }, [signals]);

  // === INSTITUTIONAL CONTEXT ALERTS ===
  const alerts: SmartAlert[] = useMemo(() => {
    const result: SmartAlert[] = [];

    // Liquidity Shift Detection
    const gaps = liquidityBlocks.filter(b => b.type === "liquidity_gap");
    if (gaps.length > 0) {
      result.push({
        id: "liq-shift", type: "liquidity_shift",
        title: "تحول سيولة مؤسسي",
        message: `رصد فجوات سيولة في ${gaps.map(g => g.pair).join("، ")} — احتمال حركة سعرية حادة`,
        severity: "critical", icon: "💧", tag: "[LIQ-SHIFT]",
      });
    }

    // Volatility Expansion
    if (volatilityMetric.stressLevel >= 70) {
      result.push({
        id: "vol-expansion", type: "volatility_expansion",
        title: "توسع تقلب مؤسسي",
        message: `مستوى الإجهاد ${volatilityMetric.stressLevel}% — تقليل حجم المراكز وتوسيع وقف الخسارة`,
        severity: "critical", icon: "⚡", tag: "[VOL-EXP]",
      });
    } else if (volatilityMetric.stressLevel >= 55) {
      result.push({
        id: "vol-moderate", type: "volatility_expansion",
        title: "تقلب متصاعد",
        message: `إجهاد السوق ${volatilityMetric.stressLevel}% — مراقبة الأزواج عالية التقلب`,
        severity: "high", icon: "📊", tag: "[VOL-MOD]",
      });
    }

    // Structure Break Detection
    const highConfSignals = signals.filter(s => s.confidence >= 85 && s.convergence >= 4);
    if (highConfSignals.length > 0) {
      const dirs = highConfSignals.map(s => s.direction);
      const dominantDir = dirs.filter(d => d === "صعودي").length > dirs.filter(d => d === "هبوطي").length ? "صعودي" : "هبوطي";
      result.push({
        id: "structure-break", type: "structure_break",
        title: `كسر هيكلي ${dominantDir === "صعودي" ? "صاعد" : "هابط"}`,
        message: `${highConfSignals.length} إشارة بتقارب عالي (≥4/5) تؤكد ${dominantDir === "صعودي" ? "اختراق" : "كسر"} هيكلي`,
        severity: "high", icon: dominantDir === "صعودي" ? "🔺" : "🔻", tag: "[STR-BRK]",
      });
    }

    // Divergence Detection (RSI vs Price)
    const divergences = signals.filter(s =>
      (s.direction === "صعودي" && s.rsi > 70) || (s.direction === "هبوطي" && s.rsi < 30)
    );
    if (divergences.length >= 2) {
      result.push({
        id: "divergence", type: "divergence",
        title: "انحراف فني مرصود",
        message: `تباين RSI/السعر في ${divergences.slice(0, 3).map(d => d.pair).join("، ")} — احتمال انعكاس`,
        severity: "high", icon: "🔄", tag: "[DIV]",
      });
    }

    // Order Flow Imbalance
    const strongBlocks = liquidityBlocks.filter(b => b.strength >= 75);
    if (strongBlocks.length >= 2) {
      const buyBlocks = strongBlocks.filter(b => b.type === "institutional_buy").length;
      const sellBlocks = strongBlocks.filter(b => b.type === "institutional_sell").length;
      if (buyBlocks > sellBlocks * 1.5 || sellBlocks > buyBlocks * 1.5) {
        result.push({
          id: "order-flow", type: "order_flow",
          title: `خلل في تدفق الأوامر ${buyBlocks > sellBlocks ? "شرائي" : "بيعي"}`,
          message: `${strongBlocks.length} كتلة مؤسسية بقوة ≥75% — ضغط ${buyBlocks > sellBlocks ? "شراء" : "بيع"} واضح`,
          severity: "medium", icon: "📈", tag: "[ORD-FLW]",
        });
      }
    }

    // Discipline Alert
    if (traderScore.discipline < 40) {
      result.push({
        id: "discipline-warning", type: "structure_break",
        title: "تحذير انضباط",
        message: "مستوى الانضباط منخفض — مراجعة خطة التداول ضرورية قبل أي مركز جديد",
        severity: "high", icon: "🛡️", tag: "[DISC]",
      });
    }

    return result.slice(0, 5);
  }, [signals, liquidityBlocks, volatilityMetric, traderScore]);

  // === DISCIPLINE STREAK ===
  const disciplineStreak: DisciplineStreak = useMemo(() => {
    const score = latestScore?.score ?? 50;
    // Simulated streak based on current discipline score
    const currentStreak = score >= 70 ? Math.floor(score / 10) : score >= 50 ? Math.floor(score / 15) : 0;
    const longestStreak = Math.max(currentStreak, Math.floor(traderScore.overall / 8));

    let level = "مبتدئ", levelAr = "مبتدئ";
    const unlockedRewards: string[] = [];

    if (currentStreak >= 30) {
      level = "elite"; levelAr = "محترف";
      unlockedRewards.push("تحليل Volume Profile", "Order Flow العميق", "HTF Confirmation", "استراتيجيات متقدمة");
    } else if (currentStreak >= 14) {
      level = "advanced"; levelAr = "متقدم";
      unlockedRewards.push("تحليل Volume Profile", "Order Flow العميق");
    } else if (currentStreak >= 7) {
      level = "intermediate"; levelAr = "متوسط";
      unlockedRewards.push("تحليل Volume Profile");
    }

    return { currentStreak, longestStreak, level, levelAr, unlockedRewards };
  }, [latestScore, traderScore]);

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

  return { traderScore, patterns, alerts, riskScore, liquidityBlocks, volatilityMetric, signalProbabilities, disciplineStreak };
}
