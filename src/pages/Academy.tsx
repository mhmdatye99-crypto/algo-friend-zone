import { motion } from "framer-motion";
import { BookOpen, Play, Award, Clock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  { title: "أساسيات التداول", lessons: 12, duration: "2 ساعة", progress: 75, color: "from-cyan-500 to-blue-600" },
  { title: "التحليل الفني المتقدم", lessons: 18, duration: "4 ساعة", progress: 30, color: "from-purple-500 to-pink-600" },
  { title: "إدارة المخاطر", lessons: 8, duration: "1.5 ساعة", progress: 0, color: "from-emerald-500 to-green-600" },
  { title: "إتقان Chart Vision", lessons: 10, duration: "2.5 ساعة", progress: 0, color: "from-primary to-orange-500" },
];

const Academy = () => {
  return (
    <motion.div
      className="px-4 pt-12 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-xl font-bold mb-1">الأكاديمية</h1>
      <p className="text-xs text-muted-foreground mb-6">تعلم وطور مهاراتك في التداول</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: BookOpen, label: "الدروس", value: "48" },
          { icon: Clock, label: "ساعات التعلم", value: "12" },
          { icon: Award, label: "الشهادات", value: "1" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-3 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold font-mono">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Courses */}
      <h3 className="text-sm font-semibold mb-3">الدورات</h3>
      <div className="space-y-3">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-4 flex items-center gap-3"
          >
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0", course.color)}>
              <Play className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{course.title}</h4>
              <p className="text-[10px] text-muted-foreground">{course.lessons} درس · {course.duration}</p>
              {course.progress > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-primary">{course.progress}%</span>
                </div>
              )}
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Academy;
