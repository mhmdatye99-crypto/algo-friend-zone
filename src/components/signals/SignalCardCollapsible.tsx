import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, ChevronDown, Lock, Layers, Zap, Eye,
  BookOpen, Calculator, AlertTriangle, Target, Shield, ArrowDownUp,
  Clock, Crosshair, Loader2, MapPin, Route, BarChart3, Save, MessageCircle,
  X as XIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useAuth } from "@/contexts/AuthContext";
import { InsufficientCreditsPopup, BuyCreditsModal } from "@/components/credits/CreditModals";
import { toast } from "sonner";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import AskXChat from "./AskXChat";

interface Signal {
  pair: string;
  direction: string;
  icon?: string;
  confidence: number;
  entry: string;
  target1: string;
  target2: string;
  sl: string;
  rr: string;
  timeFrame: string;
  alphaScore: number;
  rsi: number;
  rsiSignal: string;
  macd: string;
  macdHist: string;
  bbPosition: string;
  volume: string;
  sentiment: number;
  liquidity: string;
  convergence: number;
  reasons: string[];
  risk: string;
  category?: string;
}

interface AIAnalysis {
  entryZone?: { from: string; to: string; type: string };
  exitZones?: { target: string; label: string; probability: number }[];
  stopLoss?: { price: string; reason: string };
  entryReasons?: string[];
  scenarios?: { title: string; probability: number; description: string; targets: string[] }[];
  riskReward?: string;
  strategy?: string;
  keyLevels?: { support: string[]; resistance: string[] };
  timeHorizon?: string;
  verdict?: string;
  error?: string;
}

interface Props {
  signal: Signal;
};

/* ─── Intelligence Modules ─── */
const IntelligenceModules = ({ aiAnalysis, signal }: { aiAnalysis: AIAnalysis; signal: Signal }) => {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const toggle = (id: string) => setOpenModule(prev => prev === id ? null : id);

  const modules: { id: string; icon: React.ReactNode; label: string; available: boolean }[] = [
    { id: "entry", icon: <Crosshair className="w-4 h-4" />, label: "منطقة الدخول", available: !!aiAnalysis.entryZone },
    { id: "exits", icon: <Target className="w-4 h-4" />, label: "أهداف الخروج", available: !!(aiAnalysis.exitZones && aiAnalysis.exitZones.length > 0) },
    { id: "stoploss", icon: <Shield className="w-4 h-4" />, label: "وقف الخسارة", available: !!aiAnalysis.stopLoss },
    { id: "reasons", icon: <BookOpen className="w-4 h-4" />, label: "أسباب الدخول", available: !!(aiAnalysis.entryReasons && aiAnalysis.entryReasons.length > 0) },
    { id: "scenarios", icon: <Route className="w-4 h-4" />, label: "السيناريوهات", available: !!(aiAnalysis.scenarios && aiAnalysis.scenarios.length > 0) },
    { id: "strategy", icon: <MapPin className="w-4 h-4" />, label: "الاستراتيجية", available: !!aiAnalysis.strategy },
    { id: "levels", icon: <BarChart3 className="w-4 h-4" />, label: "المستويات", available: !!aiAnalysis.keyLevels },
  ];

  const activeModules = modules.filter(m => m.available);

  // R:R & Time always visible as compact stats
  const stats = (
    <div className="grid grid-cols-2 gap-2">
      {aiAnalysis.riskReward && (
        <div className="nx-card-flat text-center">
          <p className="nx-label flex items-center justify-center gap-1 mb-1"><ArrowDownUp className="w-3.5 h-3.5" /> R:R</p>
          <p className="text-[18px] font-mono font-bold text-primary nx-ltr">{aiAnalysis.riskReward}</p>
        </div>
      )}
      {aiAnalysis.timeHorizon && (
        <div className="nx-card-flat text-center">
          <p className="nx-label flex items-center justify-center gap-1 mb-1"><Clock className="w-3.5 h-3.5" /> المدة</p>
          <p className="text-[15px] font-semibold">{aiAnalysis.timeHorizon}</p>
        </div>
      )}
    </div>
  );

  const renderModuleContent = (id: string) => {
    switch (id) {
      case "entry":
        return aiAnalysis.entryZone && (
          <div className="space-y-2">
            <span className="nx-badge-gold">{aiAnalysis.entryZone.type}</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="nx-card-flat text-center">
                <p className="nx-label mb-1">من</p>
                <p className="text-[16px] font-mono font-bold nx-ltr">{aiAnalysis.entryZone.from}</p>
              </div>
              <div className="nx-card-flat text-center">
                <p className="nx-label mb-1">إلى</p>
                <p className="text-[16px] font-mono font-bold nx-ltr">{aiAnalysis.entryZone.to}</p>
              </div>
            </div>
          </div>
        );
      case "exits":
        return aiAnalysis.exitZones && (
          <div className="space-y-3">
            {aiAnalysis.exitZones.map((zone, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-primary">{zone.label}</span>
                  <span className="text-[14px] font-mono font-bold nx-ltr">{zone.target}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }} animate={{ width: `${zone.probability}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                  />
                </div>
                <p className="nx-meta text-left nx-ltr">احتمالية: {zone.probability}%</p>
              </div>
            ))}
          </div>
        );
      case "stoploss":
        return aiAnalysis.stopLoss && (
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-destructive/10 border border-destructive/15 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="nx-label">سعر الوقف</p>
                <p className="text-[16px] font-mono font-bold text-destructive nx-ltr">{aiAnalysis.stopLoss.price}</p>
              </div>
            </div>
            <p className="nx-meta mt-2 leading-relaxed border-t border-border pt-2">{aiAnalysis.stopLoss.reason}</p>
          </div>
        );
      case "reasons":
        return aiAnalysis.entryReasons && (
          <div className="space-y-2">
            {aiAnalysis.entryReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2.5 nx-card-flat">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-mono font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="nx-body">{reason}</p>
              </div>
            ))}
          </div>
        );
      case "scenarios":
        return aiAnalysis.scenarios && (
          <div className="space-y-2.5">
            {aiAnalysis.scenarios.map((scenario, i) => {
              const isPositive = scenario.title.includes("إيجابي") || scenario.title.includes("صعود");
              const isNegative = scenario.title.includes("سلبي") || scenario.title.includes("هبوط");
              return (
                <div key={i} className={cn("rounded-xl p-3 border space-y-2", isPositive ? "bg-success/5 border-success/15" : isNegative ? "bg-destructive/5 border-destructive/15" : "bg-warning/5 border-warning/15")}>
                  <div className="flex items-center justify-between">
                    <p className={cn("text-[14px] font-bold flex items-center gap-1.5", isPositive ? "text-success" : isNegative ? "text-destructive" : "text-warning")}>
                      {scenario.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full", isPositive ? "bg-success" : isNegative ? "bg-destructive" : "bg-warning")} style={{ width: `${scenario.probability}%` }} />
                      </div>
                      <span className={cn("text-[13px] font-mono font-bold nx-ltr", isPositive ? "text-success" : isNegative ? "text-destructive" : "text-warning")}>{scenario.probability}%</span>
                    </div>
                  </div>
                  <p className="nx-body">{scenario.description}</p>
                  {scenario.targets?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.targets.map((t, ti) => (
                        <span key={ti} className="text-[13px] font-mono bg-secondary px-2 py-1 rounded-md border border-border nx-ltr">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      case "strategy":
        return aiAnalysis.strategy && (
          <p className="nx-body">{aiAnalysis.strategy}</p>
        );
      case "levels":
        return aiAnalysis.keyLevels && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-success/5 rounded-xl p-3 border border-success/15">
              <p className="nx-label mb-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-success" /> دعم</p>
              {aiAnalysis.keyLevels.support?.map((s, i) => (
                <p key={i} className="text-[14px] font-mono font-bold text-success nx-ltr">{s}</p>
              ))}
            </div>
            <div className="bg-destructive/5 rounded-xl p-3 border border-destructive/15">
              <p className="nx-label mb-2 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-destructive" /> مقاومة</p>
              {aiAnalysis.keyLevels.resistance?.map((r, i) => (
                <p key={i} className="text-[14px] font-mono font-bold text-destructive nx-ltr">{r}</p>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-2.5">
      {stats}

      {/* Module Grid — compact clickable boxes */}
      <div className="grid grid-cols-3 gap-2">
        {activeModules.map((mod) => (
          <motion.button
            key={mod.id}
            onClick={() => toggle(mod.id)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all text-center min-h-[44px]",
              openModule === mod.id
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary hover:border-primary/20"
            )}
          >
            {mod.icon}
            <span className="text-[13px] font-semibold leading-tight">
              {mod.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Expanded Module Content */}
      <AnimatePresence mode="wait">
        {openModule && (
          <motion.div
            key={openModule}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="nx-card-flat">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold text-primary flex items-center gap-1.5">
                  {modules.find(m => m.id === openModule)?.icon}
                  {modules.find(m => m.id === openModule)?.label}
                </span>
                <button onClick={() => setOpenModule(null)} className="text-muted-foreground hover:text-foreground transition-colors nx-tap flex items-center justify-center">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              {renderModuleContent(openModule)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const stop = (e: React.MouseEvent | React.PointerEvent) => e.stopPropagation();

// X-Ray Badge component
const XBadge = ({ label, value, variant = "default" }: { label: string; value: string; variant?: "success" | "danger" | "warning" | "default" }) => {
  const colors = {
    success: "bg-success/10 text-success",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
    default: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={cn("nx-badge nx-ltr", colors[variant])}>
      <span className="opacity-70">{label}:</span> {value}
    </span>
  );
};

const SignalCardCollapsible = ({ signal }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const [showAskX, setShowAskX] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, spendCredits, canAfford, isFounder } = useCredits();

  const status = signal.confidence >= 80 ? "Active" : "Pending";

  // X-Ray badge data
  const trendVariant = signal.direction === "صعودي" ? "success" : "danger";
  const riskVariant = signal.risk === "منخفض" ? "success" : signal.risk === "متوسط" ? "warning" : "danger";
  const volVariant = Math.abs(parseFloat(signal.volume)) > 30 ? "warning" : "default";

  // X Strategic Brief
  const xBrief = signal.direction === "صعودي"
    ? `X يرصد زخم ${signal.macd === "صعودي" ? "إيجابي" : "محايد"} على ${signal.pair} مع RSI عند ${signal.rsi}. ${signal.rsi < 40 ? "منطقة تشبع بيعي — فرصة ارتداد محتملة." : signal.rsi > 60 ? "استمرار الاتجاه الصاعد مع مراقبة مستويات التشبع." : "منطقة محايدة — انتظر تأكيد الاختراق."}`
    : `X يكشف ضغط بيعي على ${signal.pair} مع RSI عند ${signal.rsi}. ${signal.rsi > 60 ? "منطقة تشبع شرائي — احتمال تصحيح هبوطي." : signal.rsi < 40 ? "استمرار الاتجاه الهابط مع مراقبة مستويات الدعم." : "سيولة متراجعة — ترقب حركة حاسمة."}`;

  const handleSaveAnalysis = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !aiAnalysis || saving) return;
    setSaving(true);
    try {
      const notes = [
        aiAnalysis.verdict,
        aiAnalysis.strategy && `الاستراتيجية: ${aiAnalysis.strategy}`,
        aiAnalysis.entryZone && `دخول: ${aiAnalysis.entryZone.from} - ${aiAnalysis.entryZone.to}`,
        aiAnalysis.stopLoss && `وقف: ${aiAnalysis.stopLoss.price}`,
        aiAnalysis.exitZones?.map(z => `${z.label}: ${z.target}`).join(" | "),
        aiAnalysis.riskReward && `R:R ${aiAnalysis.riskReward}`,
      ].filter(Boolean).join("\n");

      const { error } = await supabase.from("saved_analyses").insert({
        user_id: user.id,
        pair: signal.pair,
        direction: signal.direction,
        price: parseFloat(signal.entry.replace(/,/g, "")) || 0,
        confidence: signal.confidence,
        timeframe: signal.timeFrame,
        rsi: signal.rsi,
        macd: signal.macd,
        icon: signal.icon || null,
        notes,
      });
      if (error) throw error;
      toast.success("تم حفظ التحليل ✅");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("تعذر حفظ التحليل");
    } finally {
      setSaving(false);
    }
  }, [user, aiAnalysis, saving, signal]);

  const handleAnalyze = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analyzing) return;
    if (!isFounder && !canAfford(CREDIT_COSTS.reveal_signal)) {
      setShowInsufficient(true);
      return;
    }
    setAnalyzing(true);
    setExpanded(true);
    try {
      if (!isFounder) {
        const success = await spendCredits(CREDIT_COSTS.reveal_signal, "reveal_signal", `تحليل X لـ ${signal.pair}`);
        if (!success) { setShowInsufficient(true); setAnalyzing(false); return; }
      }
      const { data, error } = await supabase.functions.invoke("signal-analysis", {
        body: {
          pair: signal.pair, direction: signal.direction, timeFrame: signal.timeFrame,
          price: signal.entry, rsi: signal.rsi, macd: signal.macd,
          confidence: signal.confidence, reasons: signal.reasons,
        },
      });
      if (error) throw error;
      if (data?.error) toast.error(data.error);
      else { setAiAnalysis(data); toast.success("تحليل X جاهز ✨"); }
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("تعذر التحليل. حاول مرة أخرى.");
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing, isFounder, canAfford, spendCredits, signal]);

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  }, []);

  const RiskCalcInline = () => {
    const [capital, setCapital] = useState("10000");
    const [riskPct, setRiskPct] = useState("2");
    const entryNum = parseFloat(signal.entry.replace(/,/g, "")) || 0;
    const slNum = parseFloat(signal.sl.replace(/,/g, "")) || 0;
    const riskAmount = (parseFloat(capital) * parseFloat(riskPct)) / 100;
    const priceDiff = Math.abs(entryNum - slNum);
    const posSize = priceDiff > 0 ? riskAmount / priceDiff : 0;

    return (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" onClick={stop}>
        <div className="nx-card-flat space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-primary font-bold flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> حاسبة المخاطر
            </p>
            <button onClick={(e) => { stop(e); setShowRiskCalc(false); }} className="text-muted-foreground hover:text-foreground nx-tap flex items-center justify-center">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="nx-label block mb-1">رأس المال ($)</label>
              <input type="number" value={capital} onChange={e => setCapital(e.target.value)} onClick={stop}
                className="w-full h-10 bg-secondary rounded-lg px-2.5 text-[14px] font-mono nx-ltr border border-border focus:border-primary/40 focus:outline-none" />
            </div>
            <div>
              <label className="nx-label block mb-1">المخاطرة (%)</label>
              <input type="number" value={riskPct} onChange={e => setRiskPct(e.target.value)} onClick={stop}
                className="w-full h-10 bg-secondary rounded-lg px-2.5 text-[14px] font-mono nx-ltr border border-border focus:border-primary/40 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary rounded-lg p-2 text-center">
              <p className="nx-label text-[12px]">مبلغ المخاطرة</p>
              <p className="font-mono font-bold text-destructive nx-ltr">${riskAmount.toFixed(0)}</p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <p className="nx-label text-[12px]">حجم المركز</p>
              <p className="font-mono font-bold text-primary nx-ltr">{posSize > 0 ? posSize.toFixed(4) : "—"}</p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <p className="nx-label text-[12px]">R:R</p>
              <p className="font-mono font-bold nx-ltr">{signal.rr}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        className={cn(
          "nx-card overflow-hidden transition-all duration-300",
          signal.alphaScore >= 90 && "border-primary/30"
        )}
        onClick={stop}
      >
        {/* ─── Header: icon + pair + timeframe + direction + confidence ─── */}
        <div className="flex items-center justify-between gap-2 mb-3" onClick={stop}>
          <div className="flex items-center gap-3 min-w-0">
            {signal.icon && (
              <span className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
                {signal.icon}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="nx-ltr font-mono font-bold text-[16px]">{signal.pair}</span>
                <span className="nx-badge-neutral">{signal.timeFrame}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={signal.direction === "صعودي" ? "nx-badge-long" : "nx-badge-short"}>
                  {signal.direction === "صعودي" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {signal.direction === "صعودي" ? "LONG" : "SHORT"}
                </span>
                <span className={cn(
                  "nx-badge nx-ltr",
                  !aiAnalysis ? "bg-muted text-muted-foreground" :
                  signal.confidence >= 85 ? "bg-success/10 text-success" :
                  signal.confidence >= 70 ? "bg-primary/10 text-primary" :
                  "bg-warning/10 text-warning"
                )}>
                  {aiAnalysis ? `${signal.confidence}%` : (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> ثقة
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Ask X button */}
          <button
            onClick={(e) => { stop(e); setShowAskX(!showAskX); }}
            className={cn(
              "nx-tap rounded-xl flex items-center justify-center border transition-colors shrink-0",
              showAskX ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/20"
            )}
          >
            <MessageCircle className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ─── X Intelligence Brief ─── */}
        <div className="rounded-xl bg-secondary/50 border border-border p-3 mb-3" onClick={stop}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
              <span className="text-[11px] font-black text-primary">X</span>
            </div>
            <span className="text-[13px] font-bold text-primary">تحليل X الاستراتيجي</span>
          </div>
          <p className="nx-body">{xBrief}</p>
        </div>

        {/* ─── X-Ray Badges ─── */}
        <div className="flex flex-wrap gap-1.5 mb-3" onClick={stop}>
          <XBadge label="المخاطرة" value={signal.risk} variant={riskVariant as any} />
          <XBadge label="RSI" value={String(signal.rsi)} variant={signal.rsi > 70 ? "danger" : signal.rsi < 30 ? "success" : "default"} />
          <XBadge label="الحجم" value={signal.volume} variant={volVariant as any} />
          <XBadge label="تقارب" value={`${signal.convergence}/5`} variant={signal.convergence >= 4 ? "success" : signal.convergence >= 3 ? "warning" : "danger"} />
        </div>

        {/* ─── ENTRY / SL / TP1 / TP2 / R:R grid ─── */}
        <div className="mb-3" onClick={stop}>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="nx-card-flat p-2.5 text-center">
              <p className="nx-label text-[12px]">ENTRY</p>
              <p className="font-mono font-bold nx-ltr text-[14px]">{signal.entry}</p>
            </div>
            <div className="nx-card-flat p-2.5 text-center">
              <p className="nx-label text-[12px]">STOP LOSS</p>
              <p className="font-mono font-bold text-destructive nx-ltr text-[14px]">{signal.sl}</p>
            </div>
            <div className="nx-card-flat p-2.5 text-center">
              <p className="nx-label text-[12px]">R:R</p>
              <p className="font-mono font-bold text-primary nx-ltr text-[14px]">{signal.rr}</p>
            </div>
          </div>

          {/* TP Targets */}
          <div className="space-y-2">
            {[
              { label: "TP1", value: signal.target1, prob: 75 },
              { label: "TP2", value: signal.target2, prob: 45 },
            ].map((tp) => (
              <div key={tp.label} className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-success w-9">{tp.label}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full bg-success"
                    initial={{ width: 0 }}
                    animate={{ width: `${tp.prob}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <span className="font-mono font-bold nx-ltr w-16 text-left text-success text-[13px]">{tp.value}</span>
                <span className="nx-meta w-8 text-left nx-ltr">{tp.prob}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Ask X Chat ─── */}
        <AnimatePresence>
          {showAskX && (
            <div className="mb-3">
              <AskXChat
                signalContext={{
                  pair: signal.pair, direction: signal.direction, timeFrame: signal.timeFrame,
                  price: signal.entry, rsi: signal.rsi, macd: signal.macd,
                  confidence: signal.confidence, rr: signal.rr, sl: signal.sl,
                  target1: signal.target1, target2: signal.target2,
                }}
                open={showAskX}
                onClose={() => setShowAskX(false)}
                onOpenRiskCalc={() => { setShowRiskCalc(true); setExpanded(true); }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* ─── Actions: عرض التحليل / حفظ الإشارة ─── */}
        {!aiAnalysis && !analyzing && (
          <div className="flex items-center gap-2" onClick={stop}>
            <motion.button
              onClick={handleAnalyze}
              whileTap={{ scale: 0.97 }}
              className="nx-btn-secondary nx-btn-sm flex-1"
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              تحليل X العميق
            </motion.button>
          </div>
        )}

        {/* ─── Loading State ─── */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              onClick={stop}
            >
              <div className="nx-card-flat py-6 flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xl font-black text-primary">X</span>
                  </div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border border-primary/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <p className="text-[14px] font-bold text-primary">X يحلل البيانات...</p>
                <p className="nx-meta">تحديد مناطق الدخول والخروج والسيناريوهات</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Collapsed Re-expand ─── */}
        {aiAnalysis && !expanded && !analyzing && (
          <div onClick={stop}>
            <motion.button
              onClick={toggleExpand}
              whileTap={{ scale: 0.97 }}
              className="nx-btn-secondary nx-btn-sm w-full"
            >
              <Eye className="w-3.5 h-3.5" />
              عرض التحليل
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}

        {/* ─── Intelligence Modules ─── */}
        <AnimatePresence>
          {aiAnalysis && !aiAnalysis.error && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
              onClick={stop}
            >
              <div className="pt-1 space-y-3">
                <button
                  onClick={toggleExpand}
                  className="w-full flex items-center justify-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-border"
                >
                  <motion.div animate={{ rotate: 180 }}><ChevronDown className="w-3.5 h-3.5" /></motion.div>
                  إخفاء التحليل
                </button>

                {/* Verdict — always visible */}
                {aiAnalysis.verdict && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="nx-card-premium"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                        <span className="text-[11px] font-black text-primary">X</span>
                      </div>
                      <span className="text-[13px] font-bold text-primary">خلاصة X</span>
                    </div>
                    <p className="nx-body font-semibold">
                      {aiAnalysis.verdict}
                    </p>
                  </motion.div>
                )}

                {/* Intelligence Module Grid */}
                <IntelligenceModules aiAnalysis={aiAnalysis} signal={signal} />

                {/* Tools */}
                <div className="space-y-2">
                  <button
                    onClick={(e) => { stop(e); setShowRiskCalc(!showRiskCalc); }}
                    className="nx-btn-secondary nx-btn-sm w-full"
                  >
                    <Calculator className="w-3.5 h-3.5 text-primary" />
                    حاسبة المخاطر
                  </button>
                  <AnimatePresence>{showRiskCalc && <RiskCalcInline />}</AnimatePresence>

                  <Collapsible open={deepDiveOpen} onOpenChange={setDeepDiveOpen}>
                    <CollapsibleTrigger asChild>
                      <button onClick={stop}
                        className="nx-btn-ghost nx-btn-sm w-full"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {deepDiveOpen ? "إخفاء المؤشرات" : "المؤشرات الفنية"}
                        <motion.div animate={{ rotate: deepDiveOpen ? 180 : 0 }}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </motion.div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pt-3 grid grid-cols-4 gap-1.5" onClick={stop}>
                        <div className="bg-secondary rounded-lg px-2 py-2 text-center">
                          <p className="nx-label text-[11px]">RSI</p>
                          <p className={cn("font-mono font-bold nx-ltr text-[14px]",
                            signal.rsi > 70 ? "text-destructive" : signal.rsi < 30 ? "text-primary" : "text-foreground"
                          )}>{signal.rsi}</p>
                          <p className="nx-meta text-[11px]">{signal.rsiSignal}</p>
                        </div>
                        <div className="bg-secondary rounded-lg px-2 py-2 text-center">
                          <p className="nx-label text-[11px]">MACD</p>
                          <p className={cn("font-mono font-bold nx-ltr text-[14px]",
                            signal.macd === "صعودي" ? "text-primary" : signal.macd === "هبوطي" ? "text-destructive" : "text-muted-foreground"
                          )}>{signal.macdHist}</p>
                        </div>
                        <div className="bg-secondary rounded-lg px-2 py-2 text-center">
                          <p className="nx-label text-[11px]">BB</p>
                          <p className="font-mono font-bold text-[14px]">{signal.bbPosition.replace("نطاق ", "")}</p>
                        </div>
                        <div className="bg-secondary rounded-lg px-2 py-2 text-center">
                          <p className="nx-label text-[11px]">الحجم</p>
                          <p className="font-mono font-bold nx-ltr text-[14px]">{signal.volume}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      stop(e);
                      navigate("/trade-journal", {
                        state: {
                          prefill: {
                            pair: signal.pair,
                            direction: signal.direction === "صعودي" ? "buy" : "sell",
                            entry: aiAnalysis.entryZone?.from || signal.entry,
                            tp: aiAnalysis.exitZones?.[0]?.target || signal.target1,
                            sl: aiAnalysis.stopLoss?.price || signal.sl,
                            reason: aiAnalysis.entryReasons?.join(" • ") || signal.reasons.join(" • "),
                            strategy: aiAnalysis.strategy || `${signal.timeFrame} | ${signal.direction}`,
                          }
                        }
                      });
                    }}
                    className="nx-btn-secondary nx-btn-sm flex-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    سجّل في اليومية
                  </button>
                  <button
                    onClick={handleSaveAnalysis}
                    disabled={saving}
                    className="nx-btn-secondary nx-btn-sm flex-1"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    حفظ الإشارة
                  </button>
                  <button
                    onClick={(e) => { stop(e); navigate(`/asset/${encodeURIComponent(signal.pair)}`); }}
                    className="nx-btn-ghost nx-btn-sm"
                  >
                    تفاصيل
                  </button>
                </div>

                {/* Risk Warning */}
                <div className="flex items-start gap-1.5 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  <p className="nx-meta leading-relaxed">
                    تحليل X تعليمي ولا يشكل إشارة دخول مالية. التداول ينطوي على مخاطر خسارة رأس المال.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <InsufficientCreditsPopup
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        onBuyCredits={() => { setShowInsufficient(false); setShowBuyCredits(true); }}
        requiredCredits={CREDIT_COSTS.reveal_signal}
        currentCredits={credits}
      />
      <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} currentCredits={credits} />
    </>
  );
};

export default SignalCardCollapsible;
