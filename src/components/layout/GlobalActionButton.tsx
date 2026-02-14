import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, BookOpen, Brain, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  { icon: ScanLine, label: "مسح شارت", path: "/chart-vision", color: "text-primary", bg: "bg-primary/15 border-primary/25" },
  { icon: BookOpen, label: "سجّل صفقة", path: "/trade-journal", color: "text-success", bg: "bg-success/15 border-success/25" },
  { icon: Brain, label: "اسأل الذكاء", path: "/nexus-brain", color: "text-accent", bg: "bg-accent/15 border-accent/25" },
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
      {/* Backdrop */}
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

      {/* Action Items — appear above bottom nav */}
      <AnimatePresence>
        {open && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.9 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => handleAction(action.path)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-lg",
                    action.bg
                  )}
                >
                  <Icon className={cn("w-5 h-5", action.color)} />
                  <span className={cn("text-[13px] font-mono font-bold", action.color)}>{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Export the open state setter for BottomNav integration
export { GlobalActionButton };
export default GlobalActionButton;
