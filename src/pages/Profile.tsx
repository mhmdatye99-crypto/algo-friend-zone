import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, ChevronLeft, Shield, Bell, Palette, HelpCircle, LogOut,
  Star, Trophy, Flame, BarChart3, Pen, Brain, Plus,
  Calculator, BookOpen, TrendingUp, TrendingDown, Target, X, Check,
  Wallet, Activity, Award, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---
interface Trade {
  id: number;
  pair: string;
  direction: "long" | "short";
  entry: string;
  exit: string;
  sl: string;
  tp: string;
  size: string;
  pnl: string;
  mood: string;
  note: string;
  date: string;
}

const demoTrades: Trade[] = [
  { id: 1, pair: "BTC/USDT", direction: "long", entry: "96,450", exit: "98,200", sl: "95,800", tp: "99,000", size: "0.5", pnl: "+1,750", mood: "منضبط", note: "التزمت بالخطة — الأهداف تحققت", date: "12 فبراير" },
  { id: 2, pair: "XAU/USD", direction: "short", entry: "2,925", exit: "2,890", sl: "2,945", tp: "2,880", size: "1.0", pnl: "+35", mood: "واثق", note: "تحليل Gold كان دقيقاً", date: "11 فبراير" },
  { id: 3, pair: "EUR/USD", direction: "long", entry: "1.0780", exit: "1.0750", sl: "1.0760", tp: "1.0820", size: "2.0", pnl: "-60 pip", mood: "متردد", note: "دخلت متأخراً — ضُرب الوقف", date: "10 فبراير" },
];

const stats = [
  { icon: Trophy, label: "الرتبة", value: "محلل أول", color: "text-primary" },
  { icon: Flame, label: "سلسلة التحليل", value: "14 يوم", color: "text-warning" },
  { icon: Star, label: "نقاط XP", value: "3,250", color: "text-primary" },
];

const performanceMetrics = [
  { label: "دقة التحليل", value: "72%", sub: "آخر 30 يوم", icon: Target },
  { label: "عامل الربح", value: "2.4", sub: "معدّل للمخاطر", icon: Activity },
  { label: "نسبة شارب", value: "1.8", sub: "سنوية", icon: Award },
  { label: "أقصى تراجع", value: "-8.2%", sub: "من القمة للقاع", icon: TrendingDown },
];

const menuItems = [
  { icon: Bell, label: "إعدادات التنبيهات", desc: "إشعارات الإشارات والتحليلات" },
  { icon: Shield, label: "الأمان ومفاتيح API", desc: "إدارة كلمات المرور والمفاتيح" },
  { icon: Palette, label: "سمة المحطة", desc: "تخصيص الألوان والمظهر" },
  { icon: HelpCircle, label: "الدعم والتوثيق", desc: "مركز المساعدة والأسئلة" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }),
};

// --- Risk Calculator ---
const RiskCalculator = () => {
  const [capital, setCapital] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  const riskAmount = (parseFloat(capital || "0") * parseFloat(riskPercent || "0")) / 100;
  const priceDiff = Math.abs(parseFloat(entry || "0") - parseFloat(stopLoss || "0"));
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const rr1 = entry && stopLoss ? parseFloat(entry) + priceDiff : 0;
  const rr2 = entry && stopLoss ? parseFloat(entry) + priceDiff * 2 : 0;
  const rr3 = entry && stopLoss ? parseFloat(entry) + priceDiff * 3 : 0;

  const inputClass = "w-full glass rounded-xl px-3 py-2.5 text-sm font-mono bg-secondary/40 border border-border/20 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/30";

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      <motion.div className="grid grid-cols-2 gap-3" variants={fadeUp} custom={0}>
        <div>
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block mb-1.5 font-medium">رأس المال ($)</label>
          <input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block mb-1.5 font-medium">نسبة المخاطرة (%)</label>
          <input type="number" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block mb-1.5 font-medium">سعر الدخول</label>
          <input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block mb-1.5 font-medium">وقف الخسارة</label>
          <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="0.00" className={inputClass} />
        </div>
      </motion.div>

      <motion.div className="glass rounded-xl p-4 space-y-3" variants={fadeUp} custom={1}>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider font-medium">مبلغ المخاطرة</span>
          <span className="text-base font-bold font-mono text-destructive">${riskAmount.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gradient-to-l from-transparent via-border/40 to-transparent" />
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider font-medium">حجم المركز</span>
          <span className="text-base font-bold font-mono text-primary">{positionSize > 0 ? positionSize.toFixed(4) : "—"}</span>
        </div>
        {priceDiff > 0 && (
          <>
            <div className="h-px bg-gradient-to-l from-transparent via-border/40 to-transparent" />
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider font-medium">أهداف جني الأرباح</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "1:1", value: rr1 },
                { label: "2:1", value: rr2 },
                { label: "3:1", value: rr3 },
              ].map((t, i) => (
                <motion.div
                  key={t.label}
                  className="bg-success/5 border border-success/15 rounded-xl p-2.5 text-center"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[9px] font-mono text-muted-foreground mb-0.5">{t.label}</p>
                  <p className="text-xs font-bold font-mono text-success">{t.value.toFixed(2)}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Trade Form ---
const TradeForm = ({ onClose }: { onClose: () => void }) => {
  const [direction, setDirection] = useState<"long" | "short">("long");
  const inputClass = "w-full bg-secondary/40 rounded-xl px-3 py-2 text-xs font-mono border border-border/20 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/30";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden"
    >
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider">تسجيل صفقة جديدة</h4>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => setDirection("long")}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-1.5",
              direction === "long" ? "bg-success/15 text-success border border-success/30 shadow-[0_0_12px_hsl(155_100%_45%/0.1)]" : "bg-secondary/30 text-muted-foreground border border-border/10"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />LONG
          </motion.button>
          <motion.button
            onClick={() => setDirection("short")}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-1.5",
              direction === "short" ? "bg-destructive/15 text-destructive border border-destructive/30 shadow-[0_0_12px_hsl(350_100%_50%/0.1)]" : "bg-secondary/30 text-muted-foreground border border-border/10"
            )}
          >
            <TrendingDown className="w-3.5 h-3.5" />SHORT
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "الزوج / الأصل", placeholder: "BTC/USDT" },
            { label: "حجم المركز", placeholder: "0.00" },
            { label: "سعر الدخول", placeholder: "0.00" },
            { label: "وقف الخسارة", placeholder: "0.00" },
            { label: "جني الأرباح", placeholder: "0.00" },
          ].map((f, i) => (
            <div key={f.label}>
              <label className="text-[9px] text-muted-foreground font-mono uppercase block mb-1 tracking-wider font-medium">{f.label}</label>
              <input placeholder={f.placeholder} className={inputClass} />
            </div>
          ))}
          <div>
            <label className="text-[9px] text-muted-foreground font-mono uppercase block mb-1 tracking-wider font-medium">الحالة النفسية</label>
            <select className={inputClass}>
              <option value="منضبط">منضبط</option>
              <option value="واثق">واثق</option>
              <option value="متردد">متردد</option>
              <option value="خائف">خائف</option>
              <option value="طماع">طماع</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground font-mono uppercase block mb-1 tracking-wider font-medium">ملاحظات التحليل</label>
          <textarea placeholder="ما سبب دخولك هذه الصفقة؟" rows={2} className={cn(inputClass, "resize-none min-h-[56px]")} />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className="w-full py-2.5 rounded-xl bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/25 hover:bg-primary/25 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_16px_hsl(43_100%_50%/0.08)]"
        >
          <Check className="w-3.5 h-3.5" />
          حفظ الصفقة
        </motion.button>
      </div>
    </motion.div>
  );
};

// --- Main Profile ---
const Profile = () => {
  const [showTradeForm, setShowTradeForm] = useState(false);

  return (
    <motion.div
      className="px-4 pt-8 pb-24 max-w-lg mx-auto space-y-5"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={fadeUp} custom={0}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono font-medium">ملف المحلل</p>
          <h1 className="text-xl font-bold tracking-tight">مركز الأداء والتداول</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-secondary/50 transition-colors duration-200"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Analyst Card */}
      <motion.div className="glass rounded-2xl p-5 text-center glow-gold" variants={fadeUp} custom={1}>
        <div className="w-18 h-18 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center w-[72px] h-[72px]">
          <span className="text-3xl font-bold font-mono text-primary">م</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight">محلل أسواق أول</h2>
        <p className="text-[11px] text-muted-foreground font-mono mb-4 tracking-wide">عضو منذ يناير 2025</p>
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="bg-secondary/40 rounded-xl p-2.5 border border-border/10"
              whileHover={{ scale: 1.03, borderColor: "hsl(43 100% 50% / 0.2)" }}
              transition={{ duration: 0.2 }}
            >
              <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
              <p className="text-sm font-bold font-mono">{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} custom={2}>
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary/30 border border-border/20 rounded-xl h-11 p-1 gap-1">
            <TabsTrigger value="journal" className="text-[10px] font-mono font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              سجل الصفقات
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-[10px] font-mono font-medium data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-sm rounded-lg transition-all duration-200 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              حاسبة المخاطر
            </TabsTrigger>
            <TabsTrigger value="psychology" className="text-[10px] font-mono font-medium data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-sm rounded-lg transition-all duration-200 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              النفسية
            </TabsTrigger>
          </TabsList>

          {/* Trade Journal */}
          <TabsContent value="journal" className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                سجل الصفقات
              </h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTradeForm(!showTradeForm)}
                className="text-[10px] text-primary font-mono font-medium flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                صفقة جديدة
              </motion.button>
            </div>

            <AnimatePresence>
              {showTradeForm && <TradeForm onClose={() => setShowTradeForm(false)} />}
            </AnimatePresence>

            <div className="space-y-2.5">
              {demoTrades.map((trade, i) => (
                <motion.div
                  key={trade.id}
                  className="glass rounded-xl p-3.5 hover:border-border/40 transition-all duration-200"
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "text-[9px] font-mono font-bold px-2 py-0.5 rounded-md",
                        trade.direction === "long" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {trade.direction === "long" ? "LONG ↑" : "SHORT ↓"}
                      </span>
                      <span className="text-sm font-bold font-mono tracking-wide">{trade.pair}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground">{trade.date}</span>
                      <span className={cn(
                        "text-sm font-bold font-mono px-2 py-0.5 rounded-md",
                        trade.pnl.startsWith("+") ? "text-success bg-success/5" : "text-destructive bg-destructive/5"
                      )}>
                        {trade.pnl}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2 bg-secondary/20 rounded-lg p-2">
                    {[
                      { label: "دخول", value: trade.entry, color: "" },
                      { label: "خروج", value: trade.exit, color: "" },
                      { label: "SL", value: trade.sl, color: "text-destructive" },
                      { label: "TP", value: trade.tp, color: "text-success" },
                    ].map((d) => (
                      <div key={d.label} className="text-center">
                        <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider font-medium">{d.label}</p>
                        <p className={cn("text-[11px] font-mono font-bold", d.color)}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-mono font-medium px-2 py-0.5 rounded-md",
                      trade.mood === "منضبط" ? "bg-success/10 text-success" :
                      trade.mood === "واثق" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    )}>
                      {trade.mood}
                    </span>
                    <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{trade.note}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Risk Calculator */}
          <TabsContent value="risk" className="mt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-accent" />
              حاسبة إدارة المخاطر
            </h3>
            <RiskCalculator />
          </TabsContent>

          {/* Psychology */}
          <TabsContent value="psychology" className="mt-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-accent" />
              تحليلات الأداء النفسي
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {performanceMetrics.map((m, i) => (
                <motion.div
                  key={i}
                  className="glass rounded-xl p-3.5"
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <m.icon className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider font-medium">{m.label}</p>
                  <p className="text-xl font-bold font-mono mt-0.5">{m.value}</p>
                  <p className="text-[9px] text-muted-foreground/70 font-mono mt-0.5">{m.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Mood chart */}
            <div className="glass rounded-xl p-4">
              <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider mb-3 font-medium">توزيع الحالة النفسية — آخر 30 صفقة</p>
              <div className="space-y-2.5">
                {[
                  { mood: "منضبط", pct: 45, color: "bg-success" },
                  { mood: "واثق", pct: 25, color: "bg-primary" },
                  { mood: "متردد", pct: 18, color: "bg-warning" },
                  { mood: "خائف", pct: 8, color: "bg-destructive" },
                  { mood: "طماع", pct: 4, color: "bg-destructive/70" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono w-12 text-left text-muted-foreground font-medium">{m.mood}</span>
                    <div className="flex-1 h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", m.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${m.pct}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-mono w-8 text-left font-bold">{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Settings Menu */}
      <motion.div variants={fadeUp} custom={3}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 font-mono flex items-center gap-2 text-muted-foreground px-1">
          <Settings className="w-3.5 h-3.5" />
          الإعدادات
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border/10">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono block font-medium">{item.label}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/60">{item.desc}</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground/40" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.button
        variants={fadeUp}
        custom={4}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-destructive text-xs font-mono font-bold hover:bg-destructive/10 transition-all duration-200 border border-destructive/10 hover:border-destructive/20"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default Profile;
