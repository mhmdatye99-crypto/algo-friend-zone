import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Award, ChevronLeft, ChevronRight, Brain, Microscope, Shield, TrendingUp,
  Loader2, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Target, GraduationCap,
  AlertTriangle, Flame, Route, Lock, Activity, BarChart3, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTradePerformance } from "@/hooks/useTradePerformance";
import { Progress } from "@/components/ui/progress";

/* ─── Types ─── */
interface LessonSection { heading: string; content: string; keyPoint: string; }
interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation: string; }
interface LessonData {
  title: string; introduction: string; sections: LessonSection[];
  practicalExample: { scenario: string; analysis: string; outcome: string; };
  quiz: QuizQuestion[]; summary: string; nextSteps: string; error?: string;
}

/* ─── Growth Journey Diagnoses ─── */
interface Diagnosis {
  id: string;
  severity: "critical" | "warning" | "info";
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  courseId: number;
  lessonIndices: number[];
  metric?: string;
}

const courses = [
  {
    id: 0, title: "أسس التحليل الكمّي للأسواق", lessons: 12, level: "أساسي", icon: Brain,
    description: "البناء الرياضي والإحصائي لفهم حركة الأسواق",
    lessonTitles: [
      "مقدمة في التحليل الكمّي", "الإحصاء التطبيقي", "التوزيعات الاحتمالية",
      "التقلب والانحراف المعياري", "مؤشر RSI", "مؤشر MACD",
      "تحليل الحجم", "نظرية الاحتمالات", "الارتباط والتنويع",
      "نموذج كمّي بسيط", "اختبار الأداء التاريخي", "مشروع تطبيقي",
    ],
  },
  {
    id: 1, title: "التحليل الفني المتقدم — أنماط وإشارات", lessons: 12, level: "متوسط", icon: TrendingUp,
    description: "الأنماط المؤسسية وهيكل السوق المتقدم",
    lessonTitles: [
      "نظرية داو", "الشموع المتقدمة", "نماذج الانعكاس",
      "نماذج الاستمرار", "فيبوناتشي", "موجات إليوت",
      "هيكل السوق", "العرض والطلب", "تحليل السيولة",
      "التقاء المؤشرات", "دفتر الأوامر", "التحليل متعدد الأطر",
    ],
  },
  {
    id: 2, title: "إدارة المخاطر المؤسسية وحجم المراكز", lessons: 8, level: "متقدم", icon: Shield,
    description: "منهجيات إدارة رأس المال والمخاطر الاحترافية",
    lessonTitles: [
      "أساسيات إدارة المخاطر", "حجم المركز الأمثل", "نسبة المخاطرة للعائد",
      "أقصى تراجع مسموح", "التنويع", "المخاطر النفسية",
      "خطة تداول مؤسسية", "تحليل أداء المحفظة",
    ],
  },
  {
    id: 3, title: "إتقان رؤية الشارت بالتعلّم العميق", lessons: 10, level: "خبير", icon: Microscope,
    description: "تحليل الشارتات بتقنيات الذكاء الاصطناعي",
    lessonTitles: [
      "رؤية الشارت بالـ AI", "كيف يرى الـ AI الأنماط", "الدعم والمقاومة الآلي",
      "اكتشاف الأنماط", "تحليل الشموع بالـ AI", "دمج المؤشرات",
      "استراتيجية Chart Vision", "تحليل شارتات حية",
      "تقييم دقة النماذج", "مشروع نهائي",
    ],
  },
];

const severityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/8", border: "border-destructive/15", badge: "خطير" },
  warning: { color: "text-warning", bg: "bg-warning/8", border: "border-warning/15", badge: "تحذير" },
  info: { color: "text-primary", bg: "bg-primary/8", border: "border-primary/15", badge: "تطوير" },
};

const Academy = () => {
  const { data: perf, isLoading: perfLoading } = useTradePerformance();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "example" | "quiz">("content");
  const [viewMode, setViewMode] = useState<"journey" | "catalog">("journey");

  /* ─── Smart Diagnoses based on real trading data ─── */
  const diagnoses: Diagnosis[] = useMemo(() => {
    if (!perf || perf.closedTrades === 0) return [];
    const d: Diagnosis[] = [];

    // Low win rate
    if (perf.winRate < 40) {
      d.push({
        id: "low-winrate", severity: "critical", icon: AlertTriangle,
        title: "نسبة فوز منخفضة",
        description: `نسبة فوزك ${perf.winRate.toFixed(0)}% — تحتاج لتحسين دقة نقاط الدخول وقراءة الأنماط`,
        courseId: 1, lessonIndices: [1, 2, 3, 9],
        metric: `${perf.winRate.toFixed(0)}%`,
      });
    }

    // Bad risk management (profit factor < 1)
    if (perf.profitFactor < 1 && perf.closedTrades >= 3) {
      d.push({
        id: "neg-pf", severity: "critical", icon: Shield,
        title: "عامل الربح سلبي",
        description: `عامل الربح ${perf.profitFactor.toFixed(2)} — خسائرك أكبر من أرباحك. أولوية قصوى لإدارة المخاطر`,
        courseId: 2, lessonIndices: [0, 1, 2, 3],
        metric: perf.profitFactor.toFixed(2),
      });
    }

    // High drawdown
    if (perf.maxDrawdown > 0 && perf.totalPnl !== 0 && (perf.maxDrawdown / Math.abs(perf.totalPnl)) > 0.5) {
      d.push({
        id: "high-dd", severity: "warning", icon: Activity,
        title: "تراجع كبير في رأس المال",
        description: `أقصى تراجع $${perf.maxDrawdown.toFixed(0)} — تحتاج لتحديد سقف خسارة يومي وأسبوعي`,
        courseId: 2, lessonIndices: [3, 4, 6],
        metric: `$${perf.maxDrawdown.toFixed(0)}`,
      });
    }

    // Average loss > average win
    if (perf.avgLoss > perf.avgWin && perf.avgWin > 0) {
      d.push({
        id: "bad-rr", severity: "warning", icon: BarChart3,
        title: "نسبة المخاطرة/العائد ضعيفة",
        description: `متوسط خسارتك ($${perf.avgLoss.toFixed(0)}) أكبر من متوسط ربحك ($${perf.avgWin.toFixed(0)})`,
        courseId: 2, lessonIndices: [2, 1],
        metric: `1:${(perf.avgLoss / perf.avgWin).toFixed(1)}`,
      });
    }

    // Few trades — needs more practice
    if (perf.closedTrades < 10) {
      d.push({
        id: "low-volume", severity: "info", icon: Flame,
        title: "عدد صفقات محدود",
        description: `لديك ${perf.closedTrades} صفقات مغلقة فقط — ابنِ أساساً كمياً قبل التوسع`,
        courseId: 0, lessonIndices: [0, 1, 7],
        metric: `${perf.closedTrades}`,
      });
    }

    // Low pair diversity
    if (perf.pairBreakdown.length <= 1 && perf.closedTrades >= 5) {
      d.push({
        id: "no-diversity", severity: "info", icon: Target,
        title: "تركّز على زوج واحد",
        description: "التنويع يقلل المخاطر — تعلّم كيف توزّع تعرّضك بين أصول مختلفة",
        courseId: 0, lessonIndices: [8],
      });
    }

    // Good performance — suggest advanced
    if (perf.winRate >= 55 && perf.profitFactor >= 1.5) {
      d.push({
        id: "ready-advanced", severity: "info", icon: Zap,
        title: "جاهز للمرحلة المتقدمة",
        description: "أداءك ممتاز — حان وقت إتقان تقنيات AI المتقدمة في التحليل",
        courseId: 3, lessonIndices: [0, 1, 6],
        metric: "⭐",
      });
    }

    return d;
  }, [perf]);

  const growthScore = useMemo(() => {
    if (!perf || perf.closedTrades === 0) return 0;
    let score = 20; // base for having trades
    if (perf.winRate >= 40) score += 15;
    if (perf.winRate >= 55) score += 10;
    if (perf.profitFactor >= 1) score += 15;
    if (perf.profitFactor >= 1.5) score += 10;
    if (perf.closedTrades >= 10) score += 10;
    if (perf.closedTrades >= 30) score += 10;
    if (perf.pairBreakdown.length >= 3) score += 10;
    return Math.min(score, 100);
  }, [perf]);

  const loadLesson = async (courseId: number, lessonIndex: number) => {
    setSelectedLesson(lessonIndex);
    setLessonData(null);
    setLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveTab("content");
    try {
      const { data, error } = await supabase.functions.invoke("academy-lesson", { body: { courseId, lessonIndex } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setLessonData(data);
    } catch (e) {
      console.error("Failed to load lesson:", e);
      setLessonData({
        title: "خطأ", introduction: "", sections: [],
        practicalExample: { scenario: "", analysis: "", outcome: "" },
        quiz: [], summary: "", nextSteps: "",
        error: e instanceof Error ? e.message : "حدث خطأ في تحميل الدرس",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const quizScore = lessonData?.quiz
    ? lessonData.quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length
    : 0;

  /* ═══ LESSON VIEW ═══ */
  if (selectedCourse !== null && selectedLesson !== null) {
    const course = courses[selectedCourse];
    return (
      <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => { setSelectedLesson(null); setLessonData(null); }}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-mono mb-3 hover:text-primary transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
          العودة
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-lg border border-border/20 bg-secondary/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">جاري توليد الدرس...</p>
          </div>
        ) : lessonData?.error ? (
          <div className="rounded-lg border border-border/20 bg-secondary/30 p-6 text-center">
            <XCircle className="w-8 h-8 mx-auto mb-3 text-destructive" />
            <p className="text-xs text-destructive font-mono mb-3">{lessonData.error}</p>
            <button onClick={() => loadLesson(selectedCourse, selectedLesson)} className="text-[13px] font-mono text-primary flex items-center gap-1 mx-auto hover:underline">
              <RotateCcw className="w-3 h-3" /> إعادة المحاولة
            </button>
          </div>
        ) : lessonData ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg">الدرس {selectedLesson + 1}</span>
                <span className="text-[13px] font-mono text-muted-foreground">{course.title}</span>
              </div>
              <h1 className="text-sm font-bold">{lessonData.title}</h1>
              <p className="text-[13px] text-muted-foreground font-mono mt-1">{lessonData.introduction}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5 border border-border/10">
              {[
                { key: "content" as const, label: "المحتوى", icon: BookOpen },
                { key: "example" as const, label: "تطبيق", icon: Target },
                { key: "quiz" as const, label: "اختبار", icon: GraduationCap },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={cn("flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[13px] font-mono transition-all",
                    activeTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-3 h-3" />{tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "content" && (
                <motion.div key="content" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                  {lessonData.sections.map((section, i) => (
                    <div key={i} className="rounded-lg border border-border/15 bg-secondary/20 p-4">
                      <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[13px] font-mono shrink-0">{i + 1}</span>
                        {section.heading}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-line">{section.content}</p>
                      <div className="mt-3 flex items-start gap-1.5 bg-primary/5 rounded-lg p-2 border border-primary/10">
                        <Lightbulb className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <p className="text-[13px] font-mono text-primary">{section.keyPoint}</p>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                    <h3 className="text-[13px] font-bold mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" />ملخص</h3>
                    <p className="text-[13px] text-muted-foreground font-mono leading-relaxed whitespace-pre-line">{lessonData.summary}</p>
                  </div>
                </motion.div>
              )}
              {activeTab === "example" && (
                <motion.div key="example" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                  <div className="rounded-lg border border-border/15 bg-secondary/20 p-4">
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-accent" />السيناريو</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{lessonData.practicalExample.scenario}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-secondary/20 p-4">
                    <h3 className="text-xs font-bold mb-2">التحليل خطوة بخطوة</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{lessonData.practicalExample.analysis}</p>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" />النتيجة</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{lessonData.practicalExample.outcome}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-secondary/20 p-4">
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-primary" />الخطوات التالية</h3>
                    <p className="text-[13px] text-muted-foreground font-mono leading-relaxed">{lessonData.nextSteps}</p>
                  </div>
                </motion.div>
              )}
              {activeTab === "quiz" && (
                <motion.div key="quiz" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                  {lessonData.quiz.map((q, qi) => (
                    <div key={qi} className="rounded-lg border border-border/15 bg-secondary/20 p-4">
                      <p className="text-[13px] font-semibold mb-2"><span className="text-primary font-mono ml-1">س{qi + 1}.</span>{q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const isSelected = quizAnswers[qi] === oi;
                          const isCorrect = q.correctIndex === oi;
                          let optClass = "bg-secondary/30 border-border/20 hover:bg-secondary/60";
                          if (quizSubmitted) {
                            if (isCorrect) optClass = "bg-success/10 border-success/30 text-success";
                            else if (isSelected && !isCorrect) optClass = "bg-destructive/10 border-destructive/30 text-destructive";
                          } else if (isSelected) {
                            optClass = "bg-primary/10 border-primary/30 text-primary";
                          }
                          return (
                            <button key={oi} onClick={() => handleQuizAnswer(qi, oi)}
                              className={cn("w-full text-right text-[13px] font-mono p-2.5 rounded-lg border transition-all", optClass)}
                            >{opt}</button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] text-muted-foreground font-mono mt-2 bg-secondary/20 rounded-lg p-2">{q.explanation}</motion.p>
                      )}
                    </div>
                  ))}
                  {!quizSubmitted ? (
                    <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < (lessonData.quiz?.length || 0)}
                      className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold disabled:opacity-40 transition-opacity"
                    >تحقق من إجاباتك</button>
                  ) : (
                    <div className="rounded-lg border border-border/15 bg-secondary/20 p-4 text-center">
                      <p className="text-lg font-bold font-mono text-primary">{quizScore}/{lessonData.quiz.length}</p>
                      <p className="text-[13px] text-muted-foreground font-mono">
                        {quizScore === lessonData.quiz.length ? "ممتاز! أتقنت هذا الدرس 🏆" : quizScore >= Math.ceil(lessonData.quiz.length / 2) ? "أداء جيد — راجع النقاط المذكورة" : "أعد قراءة المحتوى وحاول مرة أخرى"}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </motion.div>
    );
  }

  /* ═══ COURSE LESSONS LIST ═══ */
  if (selectedCourse !== null) {
    const course = courses[selectedCourse];
    return (
      <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-mono mb-3 hover:text-primary transition-colors">
          <ChevronRight className="w-3 h-3" />العودة
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/15">
            <course.icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold">{course.title}</h1>
            <p className="text-[13px] text-muted-foreground font-mono">{course.lessons} وحدة · {course.level}</p>
          </div>
        </div>
        <div className="space-y-1">
          {course.lessonTitles.map((title, i) => (
            <motion.button key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
              onClick={() => loadLesson(selectedCourse, i)}
              className="w-full rounded-lg border border-border/10 bg-secondary/15 p-3 flex items-center gap-3 hover:bg-secondary/30 hover:border-primary/15 transition-all text-right"
            >
              <span className="w-6 h-6 rounded-lg bg-secondary/50 text-[13px] font-mono text-muted-foreground flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-[13px] font-mono flex-1">{title}</span>
              <ChevronLeft className="w-3 h-3 text-muted-foreground shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  /* ═══ MAIN: GROWTH JOURNEY ═══ */
  return (
    <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] uppercase tracking-[0.25em] text-accent font-mono font-bold">GROWTH JOURNEY</p>
          <h1 className="text-base font-bold mt-0.5">مسار النمو</h1>
        </div>
        <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5 border border-border/10">
          <button onClick={() => setViewMode("journey")}
            className={cn("px-2.5 py-1.5 rounded-lg text-[13px] font-mono transition-all",
              viewMode === "journey" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          ><Route className="w-3 h-3 inline mr-1" />تشخيص</button>
          <button onClick={() => setViewMode("catalog")}
            className={cn("px-2.5 py-1.5 rounded-lg text-[13px] font-mono transition-all",
              viewMode === "catalog" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          ><BookOpen className="w-3 h-3 inline mr-1" />المنهج</button>
        </div>
      </div>

      {viewMode === "journey" ? (
        <div className="space-y-4">
          {/* Growth Score */}
          <div className="rounded-lg border border-border/15 bg-secondary/15 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-[13px] font-mono text-muted-foreground uppercase tracking-wider">مؤشر النمو</p>
                  <p className="text-lg font-bold font-mono text-accent">{growthScore}<span className="text-[13px] text-muted-foreground">/100</span></p>
                </div>
              </div>
              {perf && perf.closedTrades > 0 && (
                <div className="text-left">
                  <p className="text-[13px] font-mono text-muted-foreground">{perf.closedTrades} صفقة</p>
                  <p className={cn("text-[13px] font-mono font-bold", perf.totalPnl >= 0 ? "text-success" : "text-destructive")}>
                    {perf.totalPnl >= 0 ? "+" : ""}{perf.totalPnl.toFixed(0)}$
                  </p>
                </div>
              )}
            </div>
            <Progress value={growthScore} className="h-1.5 bg-secondary/40" />
            <div className="flex justify-between mt-1.5">
              <span className="text-[13px] font-mono text-muted-foreground">مبتدئ</span>
              <span className="text-[13px] font-mono text-muted-foreground">محترف</span>
            </div>
          </div>

          {/* Diagnoses */}
          {perfLoading ? (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-[13px] font-mono text-muted-foreground">جاري تحليل أدائك...</span>
            </div>
          ) : diagnoses.length === 0 ? (
            <div className="rounded-lg border border-border/15 bg-secondary/15 p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border/15 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-bold mb-1">ابدأ التداول أولاً</p>
              <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
                سجّل صفقاتك في دفتر التداول وسيُحلّل النظام أداءك ويقترح دروساً مخصصة لنقاط ضعفك
              </p>
              <button onClick={() => setViewMode("catalog")} className="mt-3 text-[13px] font-mono text-primary hover:underline flex items-center gap-1 mx-auto">
                <BookOpen className="w-3 h-3" /> أو تصفّح المنهج الكامل
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] font-mono text-muted-foreground flex items-center gap-1.5">
                <Brain className="w-3 h-3 text-primary" />
                تم تحليل <span className="text-foreground font-bold">{perf?.closedTrades}</span> صفقة — إليك خطة تطويرك المخصصة
              </p>

              <div className="space-y-2">
                {diagnoses.map((d, i) => {
                  const sev = severityConfig[d.severity];
                  const Icon = d.icon;
                  const course = courses[d.courseId];
                  return (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className={cn("rounded-lg border p-4", sev.border, sev.bg)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", sev.border, sev.bg)}>
                          <Icon className={cn("w-4 h-4", sev.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[13px] font-bold">{d.title}</h3>
                            <span className={cn("text-[13px] font-mono px-1.5 py-0.5 rounded-lg uppercase tracking-wider", sev.color, sev.bg, "border", sev.border)}>{sev.badge}</span>
                            {d.metric && <span className={cn("text-[13px] font-mono font-bold mr-auto", sev.color)}>{d.metric}</span>}
                          </div>
                          <p className="text-[13px] text-muted-foreground font-mono leading-relaxed">{d.description}</p>

                          {/* Recommended lessons */}
                          <div className="mt-3 space-y-1">
                            <p className="text-[13px] font-mono text-muted-foreground uppercase tracking-wider mb-1">الدروس الموصى بها</p>
                            {d.lessonIndices.map(li => (
                              <button key={li} onClick={() => { setSelectedCourse(d.courseId); loadLesson(d.courseId, li); }}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/10 bg-background/40 hover:bg-secondary/30 hover:border-primary/15 transition-all text-right"
                              >
                                <span className="w-5 h-5 rounded-lg bg-secondary/50 text-[13px] font-mono text-muted-foreground flex items-center justify-center shrink-0">{li + 1}</span>
                                <span className="text-[13px] font-mono flex-1">{course.lessonTitles[li]}</span>
                                <ChevronLeft className="w-3 h-3 text-muted-foreground shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ═══ CATALOG VIEW ═══ */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: BookOpen, label: "الوحدات", value: "42" },
              { icon: Sparkles, label: "AI مولّد", value: "100%" },
              { icon: Award, label: "اختبارات", value: "42" },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-border/15 bg-secondary/15 p-3 text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-sm font-bold font-mono">{s.value}</p>
                <p className="text-[13px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {courses.map((course, i) => (
              <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedCourse(i)}
                className="w-full rounded-lg border border-border/15 bg-secondary/15 p-4 flex items-center gap-3 hover:bg-secondary/25 hover:border-primary/15 transition-all text-right"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/40 flex items-center justify-center shrink-0 border border-border/15">
                  <course.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold truncate">{course.title}</h4>
                  <p className="text-[13px] text-muted-foreground font-mono mt-0.5">{course.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-mono bg-secondary/50 px-1.5 py-0.5 rounded-lg text-muted-foreground">{course.level}</span>
                    <span className="text-[13px] font-mono text-muted-foreground">{course.lessons} درس</span>
                  </div>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Academy;
