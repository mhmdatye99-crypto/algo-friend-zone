import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, BookOpen, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  { icon: ScanLine, label: "مسح شارت", path: "/chart-analysis", classes: "text-primary bg-primary/10 border-primary/25" },
  { icon: BookOpen, label: "سجّل صفقة", path: "/journal", classes: "text-success bg-success/10 border-success/25" },
  { icon: Brain, label: "اسأل الذكاء", path: "/learning", classes: "text-accent bg-accent/10 border-accent/25" },
];

const GlobalActionButton = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.95 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => handleAction(action.path)}
                  className={cn(
                    "nx-tap flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-lg",
                    action.classes
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[14px] font-semibold">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export { GlobalActionButton };
export default GlobalActionButton;
