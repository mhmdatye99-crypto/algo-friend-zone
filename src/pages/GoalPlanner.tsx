import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, TrendingUp, Clock, Flame, Shield, Zap,
  Plus, Trophy, AlertTriangle, ChevronLeft, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoalPlanner, type RiskAppetite } from "@/hooks/useGoalPlanner";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart
} from "recharts";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── SETUP WIZARD ───
const SetupWizard = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [capital, setCapital] = useState("");
  const [target, setTarget] = useState("");
  const [risk, setRisk] = useState<RiskAppetite>("conservative");
  const [months, setMonths] = useState("6");

  const capitalNum = parseFloat(capital) || 0;
  const targetNum = parseFloat(target) || 0;
  const monthsNum = parseInt(months) || 6;
  const isValid = capitalNum > 0 && targetNum > capitalNum;

  // Preview projection
  const projectionData = isValid
    ? Array.from({ length: monthsNum }, (_, i) => {
        const t = (i + 1) / monthsNum;
        const aggressive = risk === "aggressive";
        const projected = capitalNum + (targetNum - capitalNum) * (aggressive ? Math.pow(t, 0.7) : t);
        return { month: i + 1, value: Math.round(projected) };
      })
    : [];

  const handleSubmit = () => {
    if (!isValid) return;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNum);
    onComplete({
      initial_capital: capitalNum,
      target_goal: targetNum,
      risk_appetite: risk,
      target_date: targetDate.toISOString(),
    });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="px-4 pt-10 pb-28 space-y-5 max-w-lg mx-auto">
      <motion.div variants={fadeUp}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">إعداد الأوديسة</p>
        <h1 className="text-xl font-bold text-foreground">الأوديسة المالية</h1>
        <p className="text-[12px] text-muted-foreground font-mono mt-1">صمّم خريطة رحلتك نحو الحرية المالية</p>
      </motion.div>

      {/* Capital Input */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-5 space-y-4">
        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">رأس المال الابتدائي ($)</span>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(e.target.value)}
            placeholder="10,000"
            className="mt-2 w-full bg-secondary/60 border border-border/30 rounded-xl px-4 py-3 text-lg font-mono font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">الهدف المالي ($)</span>
          <input
            type="number"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="100,000"
            className="mt-2 w-full bg-secondary/60 border border-border/30 rounded-xl px-4 py-3 text-lg font-mono font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">الإطار الزمني (أشهر)</span>
          <input
            type="number"
            value={months}
            onChange={e => setMonths(e.target.value)}
            placeholder="6"
            className="mt-2 w-full bg-secondary/60 border border-border/30 rounded-xl px-4 py-3 text-lg font-mono font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </label>

        {/* Risk Appetite */}
        <div>
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">شهية المخاطر</span>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "conservative" as const, label: "محافظ", icon: Shield, desc: "نمو ثابت ومتدرج" },
              { value: "aggressive" as const, label: "مغامر", icon: Flame, desc: "نمو متسارع وعدواني" },
            ]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setRisk(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
                  risk === opt.value
                    ? "border-primary bg-primary/10 glow-gold"
                    : "border-border/30 bg-secondary/40 hover:bg-secondary/60"
                )}
              >
                <opt.icon className={cn("w-6 h-6", risk === opt.value ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[12px] font-mono font-bold", risk === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Growth Path Preview */}
      {isValid && projectionData.length > 0 && (
        <motion.div variants={fadeUp} className="glass rounded-xl p-5">
          <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            مسار النمو المتوقع
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43 100% 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(43 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215 15% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 50%)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(240 12% 4%)", border: "1px solid hsl(240 10% 10%)", borderRadius: 12, fontSize: 11, fontFamily: "JetBrains Mono" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "المتوقع"]}
                  labelFormatter={l => `شهر ${l}`}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(43 100% 50%)" strokeWidth={2} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-mono text-muted-foreground">
            <span>${capitalNum.toLocaleString()}</span>
            <span className="text-primary font-bold">${targetNum.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <motion.div variants={fadeUp}>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={cn(
            "w-full py-4 rounded-xl font-mono font-bold text-sm transition-all duration-300",
            isValid
              ? "bg-primary text-primary-foreground glow-gold hover:brightness-110"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          <Target className="w-4 h-4 inline-block ml-2" />
          ابدأ الأوديسة المالية
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── PROGRESS TRACKER ───
const ProgressTracker = () => {
  const { goal, entries, stats, addEntry, EXPERT_TITLES } = useGoalPlanner();
  const [profitInput, setProfitInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showAddEntry, setShowAddEntry] = useState(false);

  if (!goal || !stats) return null;

  const handleAddEntry = () => {
    const amount = parseFloat(profitInput);
    if (isNaN(amount)) return;
    addEntry.mutate({ amount, note: noteInput || undefined });
    setProfitInput("");
    setNoteInput("");
    setShowAddEntry(false);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="px-4 pt-10 pb-28 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">الأوديسة المالية</p>
          <h1 className="text-xl font-bold text-foreground">لوحة التقدم</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/15 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
            <span className="text-[11px] font-mono font-bold">{stats.title}</span>
          </div>
        </div>
      </motion.div>

      {/* Smart Notification: Not logged today */}
      {!stats.todayLogged && (
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-xl border border-warning/30"
        >
          <motion.div
            className="absolute inset-0 bg-warning/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-mono font-bold text-warning">لم تسجّل أرباح اليوم بعد!</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {stats.missedDays > 0
                  ? `فاتتك ${stats.missedDays} أيام — المسار يحتاج $${stats.dailyRequired.toFixed(0)}/يوم للتعويض`
                  : `سجّل الآن للبقاء على مسار الهدف — المطلوب: $${stats.dailyRequired.toFixed(0)}`}
              </p>
            </div>
            <button
              onClick={() => setShowAddEntry(true)}
              className="shrink-0 px-3 py-2 rounded-lg bg-warning text-warning-foreground text-[10px] font-mono font-bold hover:brightness-110 transition-all"
            >
              سجّل الآن
            </button>
          </div>
        </motion.div>
      )}

      {/* Missed Days Alert */}
      {stats.missedDays >= 3 && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <Flame className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-[12px] font-mono font-bold text-destructive">تنبيه حرج: {stats.missedDays} أيام بدون تسجيل</p>
            <p className="text-[10px] font-mono text-muted-foreground">الانتظام في التسجيل أساسي لنجاح الأوديسة — المدرب الذكي يعيد حساب المسار تلقائياً</p>
          </div>
        </motion.div>
      )}

      {/* Level Progress */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">المستوى {stats.level}/10</span>
          </div>
          <span className="text-[13px] font-mono font-bold text-primary">{stats.progress.toFixed(1)}%</span>
        </div>

        {/* Neon gold progress bar */}
        <div className="h-3 rounded-full bg-muted overflow-hidden relative">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%), hsl(38 100% 50%))",
              boxShadow: "0 0 12px hsl(43 100% 50% / 0.5), 0 0 30px hsl(43 100% 50% / 0.2)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>

        {/* Level milestones */}
        <div className="flex justify-between mt-3">
          {EXPERT_TITLES.map((title, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                i < stats.level ? "bg-primary glow-gold" : "bg-muted-foreground/20"
              )} />
              {(i === 0 || i === 4 || i === 9) && (
                <span className="text-[8px] font-mono text-muted-foreground mt-1">{title}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">الرصيد الحالي</p>
          <p className="text-lg font-mono font-bold text-foreground">${goal.current_balance.toLocaleString()}</p>
          <p className={cn("text-[10px] font-mono mt-1", stats.achieved >= 0 ? "text-success" : "text-destructive")}>
            {stats.achieved >= 0 ? "+" : ""}${stats.achieved.toLocaleString()}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">المتبقي للهدف</p>
          <p className="text-lg font-mono font-bold text-foreground">${stats.remaining.toLocaleString()}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">{stats.daysRemaining} يوم متبقي</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">الربح اليومي المطلوب</p>
          <p className="text-lg font-mono font-bold text-warning">${stats.dailyRequired.toFixed(0)}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">للبقاء على المسار</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">أيام التداول</p>
          <p className="text-lg font-mono font-bold text-foreground">{stats.daysPassed}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">{entries.length} تسجيل</p>
        </div>
      </motion.div>

      {/* Losing Streak Warning */}
      {stats.losingStreak && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-[12px] font-mono font-bold text-destructive">تحذير: سلسلة خسائر مكتشفة</p>
            <p className="text-[10px] font-mono text-muted-foreground">المدرب الذكي يقترح فترة تهدئة لحماية هدفك طويل المدى</p>
          </div>
        </motion.div>
      )}

      {/* Growth Path Chart */}
      {stats.growthPath.length > 0 && (
        <motion.div variants={fadeUp} className="glass rounded-xl p-5">
          <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            مسار النمو — الواقعي vs المطلوب
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.growthPath}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(215 15% 50%)" }} axisLine={false} tickLine={false} interval={Math.floor(stats.growthPath.length / 5)} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215 15% 50%)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(240 12% 4%)", border: "1px solid hsl(240 10% 10%)", borderRadius: 12, fontSize: 11, fontFamily: "JetBrains Mono" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                />
                <Line type="monotone" dataKey="projected" stroke="hsl(43 100% 50%)" strokeWidth={2} dot={false} name="الأداء المتوقع" />
                <Line type="monotone" dataKey="target" stroke="hsl(215 15% 50%)" strokeWidth={1} strokeDasharray="4 4" dot={false} name="المسار المطلوب" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Add Entry */}
      <motion.div variants={fadeUp}>
        <AnimatePresence>
          {showAddEntry ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-5 space-y-3"
            >
              <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                تسجيل أرباح / خسائر اليوم
              </h3>
              <input
                type="number"
                value={profitInput}
                onChange={e => setProfitInput(e.target.value)}
                placeholder="المبلغ (- للخسارة)"
                className="w-full bg-secondary/60 border border-border/30 rounded-xl px-4 py-3 text-base font-mono font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50"
              />
              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="ملاحظة (اختياري)"
                className="w-full bg-secondary/60 border border-border/30 rounded-xl px-4 py-3 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddEntry}
                  disabled={!profitInput || addEntry.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-[12px] glow-gold disabled:opacity-50"
                >
                  تسجيل
                </button>
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="px-4 py-3 rounded-xl bg-secondary text-muted-foreground font-mono text-[12px]"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAddEntry(true)}
              className="w-full py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm hover:bg-primary/15 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              تسجيل أرباح اليوم
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <motion.div variants={fadeUp} className="glass rounded-xl p-4">
          <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3">آخر التسجيلات</h3>
          <div className="space-y-2">
            {entries.slice(-7).reverse().map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground">{new Date(entry.entry_date).toLocaleDateString("ar")}</span>
                  {entry.note && <span className="text-[10px] font-mono text-muted-foreground/60 mr-2">· {entry.note}</span>}
                </div>
                <span className={cn("text-[13px] font-mono font-bold", entry.amount >= 0 ? "text-success" : "text-destructive")}>
                  {entry.amount >= 0 ? "+" : ""}${Math.abs(entry.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Psychology Link */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/5 border border-accent/20">
        <Zap className="w-4 h-4 text-accent shrink-0" />
        <p className="text-[10px] text-muted-foreground font-mono">
          يرتبط تقدمك بقسم سيكولوجية المتداول — سجّل حالتك النفسية لتحليل أعمق
        </p>
      </motion.div>
    </motion.div>
  );
};

// ─── MAIN PAGE ───
const GoalPlanner = () => {
  const { goal, loading, createGoal } = useGoalPlanner();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!goal) {
    return <SetupWizard onComplete={(data) => createGoal.mutate(data)} />;
  }

  return <ProgressTracker />;
};

export default GoalPlanner;
