import { motion } from "framer-motion";
import { Sun, ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MorningBriefCard = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  return (
    <motion.button
      onClick={() => navigate("/morning-brief")}
      className="nx-card-premium w-full text-right transition-all"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-warning/15 flex items-center justify-center shrink-0">
          <Sun className="w-6 h-6 text-warning" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-warning" />
            <p className="nx-card-title text-warning">{greeting} — الملخص الصباحي</p>
          </div>
          <p className="nx-meta leading-relaxed">
            تقرير السوق اليومي بالذكاء الاصطناعي • أبرز الفرص والتحذيرات
          </p>
        </div>

        <ChevronLeft className="w-5 h-5 text-warning shrink-0" />
      </div>
    </motion.button>
  );
};

export default MorningBriefCard;
