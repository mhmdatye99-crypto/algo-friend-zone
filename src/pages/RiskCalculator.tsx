import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Target, AlertTriangle, TrendingUp, DollarSign, Percent, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const CAPITAL_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000];

const RiskCalculator = () => {
  const [capital, setCapital] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  const calc = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!capital || !riskPercent || !entry || !sl) return null;

    const riskAmount = capital * (riskPercent / 100);
    const slDistance = Math.abs(entry - sl);
    const slPercent = (slDistance / entry) * 100;

    if (slDistance === 0) return null;

    const positionSize = riskAmount / slDistance;
    const positionValue = positionSize * entry;
    const leverage = positionValue / capital;

    let rrRatio = 0;
    let tpAmount = 0;
    let tpPercent = 0;
    if (tp) {
      const tpDistance = Math.abs(tp - entry);
      tpPercent = (tpDistance / entry) * 100;
      rrRatio = tpDistance / slDistance;
      tpAmount = positionSize * tpDistance;
    }

    const breakEvenWinRate = rrRatio > 0 ? (1 / (1 + rrRatio)) * 100 : 0;

    return {
      riskAmount,
      positionSize,
      positionValue,
      leverage,
      slDistance,
      slPercent,
      rrRatio,
      tpAmount,
      tpPercent,
      breakEvenWinRate,
    };
  }, [capital, riskPercent, entryPrice, stopLoss, takeProfit]);

  const isLong = parseFloat(entryPrice) > parseFloat(stopLoss);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-4 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* Capital Slider */}
      <motion.div variants={fadeUp} className="glass rounded-[12px] p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-primary" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">رأس المال</p>
        </div>

        <div className="text-center">
          <motion.p
            key={capital}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-mono font-bold text-foreground tabular-nums"
          >
            ${capital.toLocaleString()}
          </motion.p>
        </div>

        <Slider
          value={[capital]}
          onValueChange={([v]) => setCapital(v)}
          min={100}
          max={200000}
          step={100}
          className="w-full"
        />

        <div className="flex gap-1.5 flex-wrap justify-center">
          {CAPITAL_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setCapital(p)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all",
                capital === p
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary/50 text-muted-foreground border border-border/10 hover:text-foreground"
              )}
            >
              ${p >= 1000 ? `${p / 1000}K` : p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Risk % Slider */}
      <motion.div variants={fadeUp} className="glass rounded-[12px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-warning" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">نسبة المخاطرة</p>
          </div>
          <motion.span
            key={riskPercent}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-lg font-mono font-bold tabular-nums",
              riskPercent <= 1 ? "text-success" : riskPercent <= 3 ? "text-warning" : "text-destructive"
            )}
          >
            {riskPercent}%
          </motion.span>
        </div>

        <Slider
          value={[riskPercent]}
          onValueChange={([v]) => setRiskPercent(v)}
          min={0.5}
          max={10}
          step={0.5}
          className="w-full"
        />

        <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
          <span className="text-success">محافظ 0.5%</span>
          <span className="text-warning">معتدل 2%</span>
          <span className="text-destructive">عدواني 10%</span>
        </div>

        {/* Live risk amount */}
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] bg-secondary/40 border border-border/10">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-mono text-muted-foreground">المبلغ المُعرّض:</span>
          <motion.span
            key={`${capital}-${riskPercent}`}
            initial={{ opacity: 0.5, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[14px] font-mono font-bold text-primary tabular-nums"
          >
            ${(capital * riskPercent / 100).toFixed(2)}
          </motion.span>
        </div>
      </motion.div>

      {/* Price Inputs */}
      <motion.div variants={fadeUp} className="glass rounded-[12px] p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-accent" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">مستويات الأسعار</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <InputField
            label="سعر الدخول"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            value={entryPrice}
            onChange={setEntryPrice}
            placeholder="67000"
          />
          <InputField
            label="وقف الخسارة"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            value={stopLoss}
            onChange={setStopLoss}
            placeholder="65500"
          />
          <InputField
            label="هدف الربح"
            icon={<Target className="w-3.5 h-3.5" />}
            value={takeProfit}
            onChange={setTakeProfit}
            placeholder="70000"
          />
        </div>
      </motion.div>

      {/* Results */}
      {calc && (
        <>
          {/* Direction badge */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className={cn(
              "px-4 py-1.5 rounded-[10px] text-[12px] font-mono font-bold border",
              isLong
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
              {isLong ? "📈 صفقة شراء (Long)" : "📉 صفقة بيع (Short)"}
            </span>
          </motion.div>

          {/* Core metrics */}
          <motion.div variants={fadeUp} className="glass rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-accent" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">نتائج التحليل</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ResultCard
                label="المبلغ المُعرّض"
                value={`$${calc.riskAmount.toFixed(2)}`}
                sub={`${riskPercent}% من رأس المال`}
                color="text-warning"
              />
              <ResultCard
                label="حجم الصفقة"
                value={calc.positionSize.toFixed(4)}
                sub="وحدة / لوت"
                color="text-foreground"
              />
              <ResultCard
                label="قيمة المركز"
                value={`$${calc.positionValue.toFixed(2)}`}
                sub={`رافعة ${calc.leverage.toFixed(1)}x`}
                color="text-accent"
              />
              <ResultCard
                label="مسافة الوقف"
                value={calc.slDistance.toFixed(2)}
                sub={`${calc.slPercent.toFixed(2)}% من الدخول`}
                color="text-destructive"
              />
            </div>
          </motion.div>

          {/* Risk/Reward */}
          {calc.rrRatio > 0 && (
            <motion.div variants={fadeUp} className="glass rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">نسبة المخاطرة للعائد</p>
              </div>

              {/* RR visual bar */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-8 rounded-[10px] overflow-hidden flex bg-muted">
                  <div
                    className="h-full bg-destructive/60 flex items-center justify-center"
                    style={{ width: `${(1 / (1 + calc.rrRatio)) * 100}%` }}
                  >
                    <span className="text-[10px] font-mono font-bold text-destructive-foreground">1</span>
                  </div>
                  <div
                    className="h-full bg-success/60 flex items-center justify-center"
                    style={{ width: `${(calc.rrRatio / (1 + calc.rrRatio)) * 100}%` }}
                  >
                    <span className="text-[10px] font-mono font-bold text-success-foreground">{calc.rrRatio.toFixed(1)}</span>
                  </div>
                </div>
                <span className={cn(
                  "text-lg font-mono font-bold shrink-0",
                  calc.rrRatio >= 2 ? "text-success" : calc.rrRatio >= 1 ? "text-warning" : "text-destructive"
                )}>
                  1:{calc.rrRatio.toFixed(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ResultCard
                  label="الربح المتوقع"
                  value={`$${calc.tpAmount.toFixed(2)}`}
                  sub={`${calc.tpPercent.toFixed(2)}% من الدخول`}
                  color="text-success"
                />
                <ResultCard
                  label="نقطة التعادل"
                  value={`${calc.breakEvenWinRate.toFixed(0)}%`}
                  sub="معدل الفوز المطلوب"
                  color="text-accent"
                />
              </div>

              {/* Quality assessment */}
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-[10px]" style={{
                background: calc.rrRatio >= 2
                  ? "hsla(155, 100%, 45%, 0.08)"
                  : calc.rrRatio >= 1
                  ? "hsla(38, 100%, 50%, 0.08)"
                  : "hsla(350, 100%, 50%, 0.08)",
                border: `1px solid ${calc.rrRatio >= 2
                  ? "hsla(155, 100%, 45%, 0.15)"
                  : calc.rrRatio >= 1
                  ? "hsla(38, 100%, 50%, 0.15)"
                  : "hsla(350, 100%, 50%, 0.15)"}`,
              }}>
                <span className="text-sm">{calc.rrRatio >= 2 ? "✅" : calc.rrRatio >= 1 ? "⚠️" : "❌"}</span>
                <span className={cn("text-[11px] font-mono font-bold", calc.rrRatio >= 2 ? "text-success" : calc.rrRatio >= 1 ? "text-warning" : "text-destructive")}>
                  {calc.rrRatio >= 3 ? "صفقة ممتازة — إدارة مخاطر مؤسسية" : calc.rrRatio >= 2 ? "صفقة جيدة — نسبة مقبولة مؤسسياً" : calc.rrRatio >= 1 ? "صفقة متوسطة — احذر" : "صفقة ضعيفة — غير مُوصى بها"}
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {!calc && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-[12px] font-mono text-muted-foreground">أدخل مستويات الأسعار لحساب المخاطر</p>
        </motion.div>
      )}
    </motion.div>
  );
};

const InputField = ({ label, icon, value, onChange, placeholder }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
    <div className="relative">
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary/60 border border-border/30 rounded-[10px] pr-7 pl-2 py-2.5 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all tabular-nums"
      />
    </div>
  </div>
);

const ResultCard = ({ label, value, sub, color }: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) => (
  <div className="bg-secondary/40 rounded-[10px] px-3 py-2.5 border border-border/10">
    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
    <p className={cn("text-[15px] font-mono font-bold tabular-nums", color)}>{value}</p>
    <p className="text-[9px] font-mono text-muted-foreground">{sub}</p>
  </div>
);

export default RiskCalculator;
