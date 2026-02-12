import { motion } from "framer-motion";
import { BookOpen, Play, Award, Clock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  { title: "أساسيات التداول الكمّي", lessons: 12, duration: "ساعتان", progress: 75, level: "مبتدئ" },
  { title: "التحليل الفني المتقدم", lessons: 18, duration: "4 ساعات", progress: 30, level: "متوسط" },
  { title: "إدارة المخاطر وحجم المراكز", lessons: 8, duration: "1.5 ساعة", progress: 0, level: "متقدم" },
  { title: "إتقان رؤية الشارت بالذكاء الاصطناعي", lessons: 10, duration: "2.5 ساعة", progress: 0, level: "خبير" },
];

const Academy = () => {
  return (
    <motion.div
      className="px-4 pt-10 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">منصة التعلّم</p>
      <h1 className="text-lg font-bold mb-1">الأكاديمية الكمّية</h1>
      <p className="text-[10px] text-muted-foreground font-mono mb-5">أتقن منهجيات التداول المؤسسية</p>

      {/* الإحصائيات */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { icon: BookOpen, label: "الوحدات", value: "48" },
          { icon: Clock, label: "الساعات", value: "12" },
          { icon: Award, label: "الشهادات", value: "1" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-lg p-3 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-base font-bold font-mono">{s.value}</p>
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* الدورات */}
      <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono">كتالوج الدورات</h3>
      <div className="space-y-2">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-lg p-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border/20">
              <Play className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold truncate">{course.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[9px] text-muted-foreground font-mono">{course.lessons} وحدة · {course.duration}</p>
                <span className="text-[8px] font-mono bg-secondary px-1 py-0.5 rounded text-muted-foreground">{course.level}</span>
              </div>
              {course.progress > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-primary">{course.progress}%</span>
                </div>
              )}
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Academy;
