import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, ChevronLeft, Shield, Bell, Palette, HelpCircle, LogOut,
  Star, Trophy, Flame, BarChart3, Pen, Brain, AlertTriangle, Plus,
  Calculator, BookOpen, TrendingUp, TrendingDown, Target, X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Trade Journal Types & State ---
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
  { label: "دقة التحليل", value: "72%", sub: "آخر 30 يوم" },
  { label: "عامل الربح", value: "2.4", sub: "معدّل للمخاطر" },
  { label: "نسبة شارب", value: "1.8", sub: "سنوية" },
  { label: "أقصى تراجع", value: "-8.2%", sub: "من القمة للقاع" },
];

const menuItems = [
  { icon: Bell, label: "إعدادات التنبيهات" },
  { icon: Shield, label: "الأمان ومفاتيح API" },
  { icon: Palette, label: "سمة المحطة" },
  { icon: HelpCircle, label: "الدعم والتوثيق" },
];

// --- Risk Calculator Component ---
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

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">رأس المال ($)</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="w-full glass rounded-lg px-2.5 py-2 text-xs font-mono bg-secondary/40 border border-border/20 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">نسبة المخاطرة (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full glass rounded-lg px-2.5 py-2 text-xs font-mono bg-secondary/40 border border-border/20 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">سعر الدخول</label>
          <input
            type="number"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="0.00"
            className="w-full glass rounded-lg px-2.5 py-2 text-xs font-mono bg-secondary/40 border border-border/20 focus:border-primary/50 focus:outline-none placeholder:text-muted-foreground/30"
          />
        </div>
        <div>
          <label className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">وقف الخسارة</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="0.00"
            className="w-full glass rounded-lg px-2.5 py-2 text-xs font-mono bg-secondary/40 border border-border/20 focus:border-primary/50 focus:outline-none placeholder:text-muted-foreground/30"
          />
        </div>
      </div>

      {/* Results */}
      <div className="glass rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-muted-foreground font-mono uppercase">مبلغ المخاطرة</span>
          <span className="text-sm font-bold font-mono text-destructive">${riskAmount.toFixed(2)}</span>
        </div>
        <div className="h-px bg-border/20" />
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-muted-foreground font-mono uppercase">حجم المركز</span>
          <span className="text-sm font-bold font-mono text-primary">{positionSize > 0 ? positionSize.toFixed(4) : "—"}</span>
        </div>
        <div className="h-px bg-border/20" />
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-muted-foreground font-mono uppercase">نسبة المكافأة:المخاطرة</span>
        </div>
        {priceDiff > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-success/5 border border-success/10 rounded-lg p-1.5 text-center">
              <p className="text-[7px] font-mono text-muted-foreground">1:1</p>
              <p className="text-[10px] font-bold font-mono text-success">{rr1.toFixed(2)}</p>
            </div>
            <div className="bg-success/10 border border-success/15 rounded-lg p-1.5 text-center">
              <p className="text-[7px] font-mono text-muted-foreground">2:1</p>
              <p className="text-[10px] font-bold font-mono text-success">{rr2.toFixed(2)}</p>
            </div>
            <div className="bg-success/15 border border-success/20 rounded-lg p-1.5 text-center">
              <p className="text-[7px] font-mono text-muted-foreground">3:1</p>
              <p className="text-[10px] font-bold font-mono text-success">{rr3.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Trade Entry Form ---
const TradeForm = ({ onClose }: { onClose: () => void }) => {
  const [direction, setDirection] = useState<"long" | "short">("long");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass rounded-lg p-3 space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider">تسجيل صفقة جديدة</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Direction toggle */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setDirection("long")}
          className={cn(
            "py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all",
            direction === "long" ? "bg-success/20 text-success border border-success/30" : "bg-secondary/30 text-muted-foreground border border-border/10"
          )}
        >
          <TrendingUp className="w-3 h-3 inline mr-1" />LONG
        </button>
        <button
          onClick={() => setDirection("short")}
          className={cn(
            "py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all",
            direction === "short" ? "bg-destructive/20 text-destructive border border-destructive/30" : "bg-secondary/30 text-muted-foreground border border-border/10"
          )}
        >
          <TrendingDown className="w-3 h-3 inline mr-1" />SHORT
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">الزوج / الأصل</label>
          <input placeholder="BTC/USDT" className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none" />
        </div>
        <div>
          <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">حجم المركز</label>
          <input placeholder="0.00" className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none" />
        </div>
        <div>
          <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">سعر الدخول</label>
          <input placeholder="0.00" className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none" />
        </div>
        <div>
          <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">وقف الخسارة</label>
          <input placeholder="0.00" className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none" />
        </div>
        <div>
          <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">جني الأرباح</label>
          <input placeholder="0.00" className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none" />
        </div>
        <div>
          <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">الحالة النفسية</label>
          <select className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none">
            <option value="منضبط">منضبط</option>
            <option value="واثق">واثق</option>
            <option value="متردد">متردد</option>
            <option value="خائف">خائف</option>
            <option value="طماع">طماع</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[7px] text-muted-foreground font-mono uppercase block mb-0.5">ملاحظات التحليل</label>
        <textarea placeholder="ما سبب دخولك هذه الصفقة؟ ما خطتك؟" rows={2} className="w-full bg-secondary/40 rounded-lg px-2 py-1.5 text-[10px] font-mono border border-border/20 focus:border-primary/50 focus:outline-none resize-none" />
      </div>

      <button className="w-full py-2 rounded-lg bg-primary/20 text-primary text-[10px] font-mono font-bold border border-primary/30 hover:bg-primary/30 transition-colors flex items-center justify-center gap-1.5">
        <Check className="w-3 h-3" />
        حفظ الصفقة
      </button>
    </motion.div>
  );
};

const Profile = () => {
  const [showTradeForm, setShowTradeForm] = useState(false);

  return (
    <motion.div
      className="px-4 pt-10 pb-4 max-w-lg mx-auto space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* العنوان */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">ملف المحلل</p>
          <h1 className="text-lg font-bold">مركز الأداء والتداول</h1>
        </div>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center">
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* بطاقة المحلل */}
      <div className="glass rounded-lg p-4 text-center">
        <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-secondary border border-border/30 flex items-center justify-center text-2xl font-bold font-mono text-primary">
          م
        </div>
        <h2 className="text-base font-bold font-mono">محلل أسواق أول</h2>
        <p className="text-[10px] text-muted-foreground font-mono mb-3">عضو منذ يناير 2025</p>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="bg-secondary/40 rounded-lg p-2 border border-border/10">
              <s.icon className={cn("w-3.5 h-3.5 mx-auto mb-0.5", s.color)} />
              <p className="text-sm font-bold font-mono">{s.value}</p>
              <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-secondary/30 border border-border/20 rounded-lg h-9">
          <TabsTrigger value="journal" className="text-[9px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">
            <BookOpen className="w-3 h-3 mr-1" />
            سجل الصفقات
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-[9px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">
            <Calculator className="w-3 h-3 mr-1" />
            حاسبة المخاطر
          </TabsTrigger>
          <TabsTrigger value="psychology" className="text-[9px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">
            <Brain className="w-3 h-3 mr-1" />
            النفسية
          </TabsTrigger>
        </TabsList>

        {/* سجل الصفقات */}
        <TabsContent value="journal" className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-primary" />
              سجل الصفقات
            </h3>
            <button
              onClick={() => setShowTradeForm(!showTradeForm)}
              className="text-[9px] text-primary font-mono flex items-center gap-0.5 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              صفقة جديدة
            </button>
          </div>

          <AnimatePresence>
            {showTradeForm && <TradeForm onClose={() => setShowTradeForm(false)} />}
          </AnimatePresence>

          {/* Trade entries */}
          <div className="space-y-1.5">
            {demoTrades.map((trade) => (
              <div key={trade.id} className="glass rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded",
                      trade.direction === "long" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {trade.direction === "long" ? "LONG" : "SHORT"}
                    </span>
                    <span className="text-xs font-bold font-mono">{trade.pair}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground">{trade.date}</span>
                    <span className={cn(
                      "text-[10px] font-bold font-mono",
                      trade.pnl.startsWith("+") ? "text-success" : "text-destructive"
                    )}>
                      {trade.pnl}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-1.5">
                  <div className="text-center">
                    <p className="text-[7px] text-muted-foreground font-mono uppercase">دخول</p>
                    <p className="text-[9px] font-mono font-bold">{trade.entry}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[7px] text-muted-foreground font-mono uppercase">خروج</p>
                    <p className="text-[9px] font-mono font-bold">{trade.exit}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[7px] text-muted-foreground font-mono uppercase">SL</p>
                    <p className="text-[9px] font-mono font-bold text-destructive">{trade.sl}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[7px] text-muted-foreground font-mono uppercase">TP</p>
                    <p className="text-[9px] font-mono font-bold text-success">{trade.tp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[8px] font-mono px-1.5 py-0.5 rounded",
                    trade.mood === "منضبط" ? "bg-success/10 text-success" :
                    trade.mood === "واثق" ? "bg-primary/10 text-primary" :
                    "bg-warning/10 text-warning"
                  )}>
                    {trade.mood}
                  </span>
                  <p className="text-[9px] font-mono text-muted-foreground truncate">{trade.note}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* حاسبة المخاطر */}
        <TabsContent value="risk" className="mt-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Calculator className="w-3 h-3 text-accent" />
            حاسبة إدارة المخاطر
          </h3>
          <RiskCalculator />
        </TabsContent>

        {/* النفسية */}
        <TabsContent value="psychology" className="mt-2 space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-accent" />
            تحليلات الأداء النفسي
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {performanceMetrics.map((m, i) => (
              <div key={i} className="glass rounded-lg p-3">
                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-bold font-mono">{m.value}</p>
                <p className="text-[8px] text-muted-foreground font-mono">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Emotion distribution */}
          <div className="glass rounded-lg p-3">
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider mb-2">توزيع الحالة النفسية — آخر 30 صفقة</p>
            <div className="space-y-1.5">
              {[
                { mood: "منضبط", pct: 45, color: "bg-success" },
                { mood: "واثق", pct: 25, color: "bg-primary" },
                { mood: "متردد", pct: 18, color: "bg-warning" },
                { mood: "خائف", pct: 8, color: "bg-destructive" },
                { mood: "طماع", pct: 4, color: "bg-destructive" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[8px] font-mono w-10 text-left text-muted-foreground">{m.mood}</span>
                  <div className="flex-1 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="text-[8px] font-mono w-6 text-left text-muted-foreground">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* القائمة */}
      <div className="glass rounded-lg divide-y divide-border/20">
        {menuItems.map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between px-3 py-3 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono">{item.label}</span>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* تسجيل الخروج */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-destructive text-xs font-mono font-medium hover:bg-destructive/10 transition-colors border border-destructive/10">
        <LogOut className="w-3.5 h-3.5" />
        تسجيل الخروج
      </button>
    </motion.div>
  );
};

export default Profile;
