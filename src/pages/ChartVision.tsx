import { motion } from "framer-motion";
import { Camera, Upload, Sparkles, TrendingUp, Shield, Target, BarChart3 } from "lucide-react";

const capabilities = [
  { icon: Target, label: "50+ نمط فني", color: "from-primary to-orange-500" },
  { icon: BarChart3, label: "دعم ومقاومة", color: "from-cyan-500 to-blue-500" },
  { icon: TrendingUp, label: "توقع الاتجاه", color: "from-emerald-500 to-green-500" },
  { icon: Shield, label: "حساب المخاطرة", color: "from-purple-500 to-pink-500" },
  { icon: Sparkles, label: "استراتيجية ذكية", color: "from-amber-500 to-yellow-400" },
  { icon: Camera, label: "مقارنة مباشرة", color: "from-rose-500 to-red-500" },
];

const ChartVision = () => {
  return (
    <motion.div
      className="px-4 pt-12 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Hero */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center glow-gold"
        >
          <Camera className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">📸 Chart Vision AI</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          صور شارتك واحصل على تحليل ذكي فوري
          <br />
          يكتشف الأنماط ويحدد الفرص ويقترح الاستراتيجية
        </p>
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="glass rounded-2xl p-6 flex flex-col items-center gap-3 border border-primary/20 glow-gold hover:border-primary/40 transition-all"
        >
          <Camera className="w-8 h-8 text-primary" />
          <span className="text-sm font-semibold">التقط صورة</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="glass rounded-2xl p-6 flex flex-col items-center gap-3 border border-border/30 hover:border-accent/40 transition-all"
        >
          <Upload className="w-8 h-8 text-accent" />
          <span className="text-sm font-semibold">ارفع من المعرض</span>
        </motion.button>
      </div>

      {/* Capabilities */}
      <h3 className="text-sm font-semibold mb-3">ماذا يمكنه أن يفعل؟</h3>
      <div className="grid grid-cols-3 gap-2 mb-8">
        {capabilities.map((cap, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-xl p-3 flex flex-col items-center gap-2 text-center"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cap.color} flex items-center justify-center`}>
              <cap.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">{cap.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Recent Analyses Empty State */}
      <div className="glass rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-muted-foreground animate-pulse-slow" />
        </div>
        <h4 className="text-sm font-semibold mb-1">ابدأ بأول تحليل!</h4>
        <p className="text-xs text-muted-foreground">
          التقط صورة لأي شارت وسيقوم AI بتحليله خلال ثوانٍ
        </p>
      </div>
    </motion.div>
  );
};

export default ChartVision;
