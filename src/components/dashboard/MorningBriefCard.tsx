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
      className="w-full relative overflow-hidden rounded-[14px] p-4 text-right transition-all group"
      style={{
        background: "linear-gradient(135deg, hsla(38, 100%, 50%, 0.12) 0%, hsla(43, 80%, 40%, 0.06) 60%, hsla(190, 100%, 50%, 0.04) 100%)",
        border: "1px solid hsla(38, 100%, 50%, 0.18)",
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsla(43, 100%, 50%, 0.06) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s infinite",
        }}
      />

      <div className="relative flex items-center gap-3">
        {/* Icon with pulse ring */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-[12px] bg-warning/15 flex items-center justify-center">
            <Sun className="w-6 h-6 text-warning" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-[12px] border-2 border-warning/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-warning" />
            <p className="text-[13px] font-mono font-bold text-warning">{greeting} — الملخص الصباحي</p>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
            تقرير السوق اليومي بالذكاء الاصطناعي • أبرز الفرص والتحذيرات
          </p>
        </div>

        <ChevronLeft className="w-5 h-5 text-warning/50 group-hover:text-warning transition-colors shrink-0" />
      </div>
    </motion.button>
  );
};

export default MorningBriefCard;
