import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ScanLine, BookOpen, Brain, X } from "lucide-react";
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

      {/* Action Items */}
      <AnimatePresence>
        {open && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 25 }}
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

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full flex items-center justify-center border-2 border-primary/40 transition-colors"
        style={{
          background: open ? "hsl(var(--destructive))" : "hsl(var(--primary))",
          boxShadow: "0 4px 24px hsl(43 100% 50% / 0.3)",
        }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-primary-foreground" />}
      </motion.button>
    </>
  );
};

export default GlobalActionButton;
