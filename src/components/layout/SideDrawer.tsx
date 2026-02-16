import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Zap, Target, BookOpen,
  Users, MessageSquare, GraduationCap, Calculator, Trophy,
  BarChart3, FileText, Settings, X, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useSignals } from "@/hooks/useSignals";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: "الرئيسية",
    items: [
      { path: "/", icon: LayoutDashboard, label: "لوحة التحكم" },
      { path: "/markets", icon: TrendingUp, label: "الأسواق" },
      { path: "/trade-center", icon: Zap, label: "توصيات AI", badge: "signals" as const },
      { path: "/goal-planner", icon: Target, label: "مسار النمو" },
      { path: "/trade-journal", icon: BookOpen, label: "سجل الصفقات" },
    ],
  },
  {
    title: "اجتماعي",
    items: [
      { path: "/community", icon: Users, label: "المجتمع", badge: "community" as const },
      { path: "/nexus-brain", icon: MessageSquare, label: "مركز الذكاء AI" },
    ],
  },
  {
    title: "تعلم",
    items: [
      { path: "/academy", icon: GraduationCap, label: "الأكاديمية" },
      { path: "/risk-calculator", icon: Calculator, label: "الحاسبات" },
      { path: "/challenges", icon: Trophy, label: "التحديات" },
      { path: "/my-analyses", icon: FileText, label: "سجل التحليلات" },
    ],
  },
];

const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const getBadge = (badge?: string) => {
    if (badge === "community" && unreadCount > 0) return unreadCount;
    return null;
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-card border-l border-border/30 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/20">
              <h2 className="text-[14px] font-display font-bold text-foreground">
                <span className="text-gradient-gold">NEXUS</span> القائمة
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = location.pathname === item.path;
                      const badge = getBadge(item.badge);

                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNav(item.path)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-right",
                            active
                              ? "bg-primary/10 border border-primary/25 text-primary"
                              : "hover:bg-secondary/60 text-foreground/80"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                          <span className={cn("text-[13px] font-mono flex-1", active && "font-bold")}>{item.label}</span>
                          {badge && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-mono font-bold">
                              {badge > 9 ? "9+" : badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/20 px-3 py-3">
              <button
                onClick={() => handleNav("/hub")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="text-[13px] font-mono text-foreground/80">الإعدادات والمقر</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;
