import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Award, Clock, ChevronLeft, ChevronRight, Brain, Microscope, Shield, TrendingUp,
  Loader2, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Target, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LessonSection {
  heading: string;
  content: string;
  keyPoint: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonData {
  title: string;
  introduction: string;
  sections: LessonSection[];
  practicalExample: {
    scenario: string;
    analysis: string;
    outcome: string;
  };
  quiz: QuizQuestion[];
  summary: string;
  nextSteps: string;
  error?: string;
}

const courses = [
  {
    id: 0,
    title: "أسس التحليل الكمّي للأسواق",
    lessons: 12,
    level: "أساسي",
    icon: Brain,
    description: "البناء الرياضي والإحصائي لفهم حركة الأسواق",
    lessonTitles: [
      "مقدمة في التحليل الكمّي", "الإحصاء التطبيقي", "التوزيعات الاحتمالية",
      "التقلب والانحراف المعياري", "مؤشر RSI", "مؤشر MACD",
      "تحليل الحجم", "نظرية الاحتمالات", "الارتباط والتنويع",
      "نموذج كمّي بسيط", "اختبار الأداء التاريخي", "مشروع تطبيقي",
    ],
  },
  {
    id: 1,
    title: "التحليل الفني المتقدم — أنماط وإشارات",
    lessons: 12,
    level: "متوسط",
    icon: TrendingUp,
    description: "الأنماط المؤسسية وهيكل السوق المتقدم",
    lessonTitles: [
      "نظرية داو", "الشموع المتقدمة", "نماذج الانعكاس",
      "نماذج الاستمرار", "فيبوناتشي", "موجات إليوت",
      "هيكل السوق", "العرض والطلب", "تحليل السيولة",
      "التقاء المؤشرات", "دفتر الأوامر", "التحليل متعدد الأطر",
    ],
  },
  {
    id: 2,
    title: "إدارة المخاطر المؤسسية وحجم المراكز",
    lessons: 8,
    level: "متقدم",
    icon: Shield,
    description: "منهجيات إدارة رأس المال والمخاطر الاحترافية",
    lessonTitles: [
      "أساسيات إدارة المخاطر", "حجم المركز الأمثل", "نسبة المخاطرة للعائد",
      "أقصى تراجع مسموح", "التنويع", "المخاطر النفسية",
      "خطة تداول مؤسسية", "تحليل أداء المحفظة",
    ],
  },
  {
    id: 3,
    title: "إتقان رؤية الشارت بالتعلّم العميق",
    lessons: 10,
    level: "خبير",
    icon: Microscope,
    description: "تحليل الشارتات بتقنيات الذكاء الاصطناعي",
    lessonTitles: [
      "رؤية الشارت بالـ AI", "كيف يرى الـ AI الأنماط", "الدعم والمقاومة الآلي",
      "اكتشاف الأنماط", "تحليل الشموع بالـ AI", "دمج المؤشرات",
      "استراتيجية Chart Vision", "تحليل شارتات حية",
      "تقييم دقة النماذج", "مشروع نهائي",
    ],
  },
];

const Academy = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "example" | "quiz">("content");

  const loadLesson = async (courseId: number, lessonIndex: number) => {
    setSelectedLesson(lessonIndex);
    setLessonData(null);
    setLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveTab("content");

    try {
      const { data, error } = await supabase.functions.invoke("academy-lesson", {
        body: { courseId, lessonIndex },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setLessonData(data);
    } catch (e) {
      console.error("Failed to load lesson:", e);
      setLessonData({
        title: "خطأ",
        introduction: "",
        sections: [],
        practicalExample: { scenario: "", analysis: "", outcome: "" },
        quiz: [],
        summary: "",
        nextSteps: "",
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

  // === LESSON VIEW ===
  if (selectedCourse !== null && selectedLesson !== null) {
    const course = courses[selectedCourse];
    return (
      <motion.div
        className="px-4 pt-8 pb-28 max-w-lg mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <button
          onClick={() => { setSelectedLesson(null); setLessonData(null); }}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mb-3 hover:text-primary transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
          العودة للوحدات
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">جاري توليد الدرس بالذكاء الاصطناعي...</p>
            <div className="flex items-center gap-1 text-[9px] text-primary/60 font-mono">
              <Sparkles className="w-3 h-3" />
              يتم إنشاء محتوى مخصص لك
            </div>
          </div>
        ) : lessonData?.error ? (
          <div className="glass rounded-xl p-6 text-center">
            <XCircle className="w-8 h-8 mx-auto mb-3 text-destructive" />
            <p className="text-xs text-destructive font-mono mb-3">{lessonData.error}</p>
            <button
              onClick={() => loadLesson(selectedCourse, selectedLesson)}
              className="text-[10px] font-mono text-primary flex items-center gap-1 mx-auto hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              إعادة المحاولة
            </button>
          </div>
        ) : lessonData ? (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  الدرس {selectedLesson + 1}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground">{course.title}</span>
              </div>
              <h1 className="text-base font-bold">{lessonData.title}</h1>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">{lessonData.introduction}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5">
              {[
                { key: "content" as const, label: "المحتوى", icon: BookOpen },
                { key: "example" as const, label: "تطبيق عملي", icon: Target },
                { key: "quiz" as const, label: "اختبار", icon: GraduationCap },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-[10px] font-mono transition-all",
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* CONTENT TAB */}
              {activeTab === "content" && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {lessonData.sections.map((section, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[9px] font-mono flex-shrink-0">
                          {i + 1}
                        </span>
                        {section.heading}
                      </h3>
                      <p className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-line">
                        {section.content}
                      </p>
                      <div className="mt-3 flex items-start gap-1.5 bg-primary/5 rounded-lg p-2 border border-primary/10">
                        <Lightbulb className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-[9px] font-mono text-primary">{section.keyPoint}</p>
                      </div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div className="glass rounded-xl p-4 border-primary/20">
                    <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      ملخص الدرس
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed whitespace-pre-line">
                      {lessonData.summary}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* EXAMPLE TAB */}
              {activeTab === "example" && (
                <motion.div
                  key="example"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-accent" />
                      السيناريو
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                      {lessonData.practicalExample.scenario}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-xs font-bold mb-2">التحليل خطوة بخطوة</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                      {lessonData.practicalExample.analysis}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4 border-primary/20">
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      النتيجة والدروس المستفادة
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                      {lessonData.practicalExample.outcome}
                    </p>
                  </div>

                  <div className="glass rounded-xl p-4">
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      الخطوات التالية
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                      {lessonData.nextSteps}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* QUIZ TAB */}
              {activeTab === "quiz" && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {lessonData.quiz.map((q, qi) => (
                    <div key={qi} className="glass rounded-xl p-4">
                      <p className="text-[11px] font-semibold mb-2">
                        <span className="text-primary font-mono ml-1">س{qi + 1}.</span>
                        {q.question}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const isSelected = quizAnswers[qi] === oi;
                          const isCorrect = q.correctIndex === oi;
                          let optClass = "bg-secondary/30 border-border/20 hover:bg-secondary/60";
                          if (quizSubmitted) {
                            if (isCorrect) optClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                            else if (isSelected && !isCorrect) optClass = "bg-destructive/10 border-destructive/30 text-destructive";
                          } else if (isSelected) {
                            optClass = "bg-primary/10 border-primary/30 text-primary";
                          }
                          return (
                            <button
                              key={oi}
                              onClick={() => handleQuizAnswer(qi, oi)}
                              className={cn(
                                "w-full text-right text-[10px] font-mono p-2.5 rounded-lg border transition-all",
                                optClass
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-[9px] text-muted-foreground font-mono mt-2 bg-secondary/20 rounded-lg p-2"
                        >
                          {q.explanation}
                        </motion.p>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < (lessonData.quiz?.length || 0)}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold disabled:opacity-40 transition-opacity"
                    >
                      تحقق من إجاباتك
                    </button>
                  ) : (
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-lg font-bold font-mono text-primary">
                        {quizScore}/{lessonData.quiz.length}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {quizScore === lessonData.quiz.length
                          ? "ممتاز! أتقنت هذا الدرس 🏆"
                          : quizScore >= Math.ceil(lessonData.quiz.length / 2)
                          ? "أداء جيد — راجع النقاط المذكورة"
                          : "أعد قراءة المحتوى وحاول مرة أخرى"}
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

  // === COURSE LESSONS LIST ===
  if (selectedCourse !== null) {
    const course = courses[selectedCourse];
    return (
      <motion.div
        className="px-4 pt-8 pb-28 max-w-lg mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mb-3 hover:text-primary transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
          العودة للمنهج
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border/20">
            <course.icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold">{course.title}</h1>
            <p className="text-[9px] text-muted-foreground font-mono">{course.lessons} وحدة · {course.level}</p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground font-mono mb-4 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          كل درس يُولّد بالكامل بالذكاء الاصطناعي عند فتحه
        </p>

        <div className="space-y-1.5">
          {course.lessonTitles.map((title, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => loadLesson(selectedCourse, i)}
              className="w-full glass rounded-lg p-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-right"
            >
              <span className="w-6 h-6 rounded bg-secondary text-[10px] font-mono text-muted-foreground flex items-center justify-center flex-shrink-0 border border-border/10">
                {i + 1}
              </span>
              <span className="text-[11px] font-mono flex-1">{title}</span>
              <ChevronLeft className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // === MAIN CATALOG ===
  return (
    <motion.div
      className="px-4 pt-10 pb-28 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">منصة المعرفة المؤسسية</p>
      <h1 className="text-xl font-bold mb-1">الأكاديمية الكمّية</h1>
      <p className="text-[11px] text-muted-foreground font-mono mb-1">أتقن منهجيات التداول المؤسسية وأُطر التحليل الاحترافية</p>
      <p className="text-[10px] text-primary/70 font-mono mb-5 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        كل المحتوى يُولّد فورياً بالذكاء الاصطناعي — بدون فيديوهات أو ملفات
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { icon: BookOpen, label: "الوحدات", value: "42" },
          { icon: Sparkles, label: "مولّد بالـ AI", value: "100%" },
          { icon: Award, label: "اختبارات", value: "42" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
            <p className="text-lg font-bold font-mono">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Courses */}
      <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3 font-mono">كتالوج المنهج الكمّي</h3>
      <div className="space-y-2.5">
        {courses.map((course, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedCourse(i)}
            className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-right"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border/20">
              <course.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{course.title}</h4>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{course.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded-md text-muted-foreground">{course.level}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{course.lessons} درس</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Academy;
