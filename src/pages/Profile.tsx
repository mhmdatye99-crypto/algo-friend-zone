import { motion } from "framer-motion";
import {
  Settings, ChevronLeft, Shield, Bell, Palette, HelpCircle, LogOut,
  Star, Trophy, Flame, BarChart3, Pen, Brain, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const journalEntries = [
  { date: "12 فبراير", mood: "منضبط", note: "التزمت بالخطة — لم أدخل صفقة عاطفية", profitable: true },
  { date: "11 فبراير", mood: "متردد", note: "ضيّعت فرصة BTC بسبب التردد في نقطة الدخول", profitable: false },
  { date: "10 فبراير", mood: "واثق", note: "تحليل GOLD كان دقيقاً — الأهداف تحققت", profitable: true },
];

const menuItems = [
  { icon: Bell, label: "إعدادات التنبيهات" },
  { icon: Shield, label: "الأمان ومفاتيح API" },
  { icon: Palette, label: "سمة المحطة" },
  { icon: HelpCircle, label: "الدعم والتوثيق" },
];

const Profile = () => {
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
          <h1 className="text-lg font-bold">تحليلات الأداء والنفسية</h1>
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

      {/* تحليلات الأداء */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3 text-primary" />
          تحليلات الأداء
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
      </div>

      {/* يوميات نفسية المتداول */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-accent" />
            يوميات نفسية المتداول
          </h3>
          <button className="text-[9px] text-primary font-mono flex items-center gap-0.5">
            <Pen className="w-3 h-3" />
            إضافة
          </button>
        </div>
        <div className="space-y-1.5">
          {journalEntries.map((entry, i) => (
            <div key={i} className="glass rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-muted-foreground">{entry.date}</span>
                  <span className={cn(
                    "text-[8px] font-mono px-1.5 py-0.5 rounded",
                    entry.mood === "منضبط" ? "bg-success/10 text-success" :
                    entry.mood === "واثق" ? "bg-primary/10 text-primary" :
                    "bg-warning/10 text-warning"
                  )}>
                    {entry.mood}
                  </span>
                </div>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  entry.profitable ? "bg-success" : "bg-destructive"
                )} />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">{entry.note}</p>
            </div>
          ))}
        </div>
      </div>

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
