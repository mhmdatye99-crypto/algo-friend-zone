import { useMemo } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useTradePerformance } from "@/hooks/useTradePerformance";
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
  type: "risk" | "opportunity" | "behavior" | "pattern";
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

    // RSI overbought/oversold detection
    const overbought = signals.filter(s => (s.rsi ?? 50) > 70);
    const oversold = signals.filter(s => (s.rsi ?? 50) < 30);

    if (overbought.length >= 2) {
      result.push({
        name: "RSI Overbought Zone",
        nameAr: "منطقة تشبع شرائي",
        confidence: 72,
        direction: "bearish",
        pairs: overbought.slice(0, 3).map(s => s.pair),
      });
    }

    if (oversold.length >= 2) {
      result.push({
        name: "RSI Oversold Zone",
        nameAr: "منطقة تشبع بيعي",
        confidence: 68,
        direction: "bullish",
        pairs: oversold.slice(0, 3).map(s => s.pair),
      });
    }

    return result;
  }, [signals]);

  // === SMART ALERTS ===
  const alerts: SmartAlert[] = useMemo(() => {
    const result: SmartAlert[] = [];

    // Risk alerts
    if (traderScore.discipline < 40) {
      result.push({
        id: "low-discipline",
        type: "behavior",
        title: "تحذير انضباط",
        message: "مستوى الانضباط منخفض — راجع خطة التداول",
        severity: "high",
        icon: "⚠️",
      });
    }

    // Opportunity alerts
    const highConfSignals = signals.filter(s => s.confidence >= 85);
    if (highConfSignals.length > 0) {
      result.push({
        id: "high-conf",
        type: "opportunity",
        title: "فرصة ذهبية",
        message: `${highConfSignals.length} إشارة بثقة عالية (+85%) متاحة الآن`,
        severity: "medium",
        icon: "🔥",
      });
    }

    // Pattern alerts
    patterns.forEach(p => {
      result.push({
        id: `pattern-${p.name}`,
        type: "pattern",
        title: p.nameAr,
        message: `تم رصد ${p.name} في ${p.pairs.join("، ")}`,
        severity: p.confidence >= 75 ? "high" : "medium",
        icon: p.direction === "bullish" ? "📈" : "📉",
      });
    });

    // Goal progress alert
    if (stats && stats.progress >= 80) {
      result.push({
        id: "goal-near",
        type: "opportunity",
        title: "اقتربت من هدفك!",
        message: `تقدمك ${Math.round(stats.progress)}% — استمر بالانضباط`,
        severity: "low",
        icon: "🎯",
      });
    }

    return result.slice(0, 5);
  }, [traderScore, signals, patterns, stats]);

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
      score,
      label,
      color,
      factors: [
        { name: "الانضباط", value: disciplineFactor, status: disciplineFactor >= 70 ? "good" : disciplineFactor >= 40 ? "warning" : "danger" },
        { name: "التقلب", value: volatilityFactor, status: volatilityFactor >= 70 ? "good" : volatilityFactor >= 40 ? "warning" : "danger" },
        { name: "التنويع", value: diversificationFactor, status: diversificationFactor >= 60 ? "good" : diversificationFactor >= 30 ? "warning" : "danger" },
      ],
    };
  }, [traderScore, signals]);

  return { traderScore, patterns, alerts, riskScore };
}
