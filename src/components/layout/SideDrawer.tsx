import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Zap, Target, BookOpen,
  Users, MessageSquare, GraduationCap, Calculator, Trophy,
  BarChart3, FileText, Settings, X, Crown, Brain, Sun,
  ChevronLeft, Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useCredits } from "@/hooks/useCredits";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: "الرئيسية",
    items: [
      { path: "/", icon: LayoutDashboard, label: "لوحة التحكم", color: "text-primary", bg: "bg-primary/10" },
      { path: "/markets", icon: TrendingUp, label: "الأسواق", color: "text-success", bg: "bg-success/10" },
      { path: "/trade-center", icon: Zap, label: "توصيات AI", badge: "signals" as const, color: "text-warning", bg: "bg-warning/10" },
      { path: "/goal-planner", icon: Target, label: "مسار النمو", color: "text-accent", bg: "bg-accent/10" },
      { path: "/trade-journal", icon: BookOpen, label: "سجل الصفقات", color: "text-primary", bg: "bg-primary/10" },
    ],
  },
  {
    title: "اجتماعي",
    items: [
      { path: "/community", icon: Users, label: "المجتمع", badge: "community" as const, color: "text-accent", bg: "bg-accent/10" },
      { path: "/nexus-brain", icon: MessageSquare, label: "مركز الذكاء AI", color: "text-primary", bg: "bg-primary/10" },
    ],
  },
  {
    title: "تعلم وتطوير",
    items: [
      { path: "/academy", icon: GraduationCap, label: "الأكاديمية", color: "text-warning", bg: "bg-warning/10" },
      { path: "/risk-calculator", icon: Calculator, label: "الحاسبات", color: "text-success", bg: "bg-success/10" },
      { path: "/challenges", icon: Trophy, label: "التحديات", color: "text-destructive", bg: "bg-destructive/10" },
      { path: "/my-analyses", icon: FileText, label: "سجل التحليلات", color: "text-primary", bg: "bg-primary/10" },
      { path: "/morning-brief", icon: Sun, label: "الملخص الصباحي", color: "text-warning", bg: "bg-warning/10" },
    ],
  },
  {
    title: "الحساب",
    items: [
      { path: "/subscription", icon: Crown, label: "الاشتراك", color: "text-primary", bg: "bg-primary/10" },
      { path: "/hub", icon: Settings, label: "المقر والإعدادات", color: "text-muted-foreground", bg: "bg-secondary/60" },
    ],
  },
];

const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { credits } = useCredits();

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
            className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-card flex flex-col shadow-2xl border-l border-border/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/20">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center border border-border/20 hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="text-[14px] font-display font-bold text-foreground">
                القائمة <span className="text-gradient-gold">NEXUS</span>
              </h2>
            </div>

            {/* Credits Quick Card */}
            <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleNav("/subscription")}
                  className="text-[10px] font-mono text-primary font-bold hover:underline"
                >
                  ترقية ←
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono font-bold text-primary">{credits}</span>
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground">رصيدك</span>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-3">
              {menuSections.map((section, sIdx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sIdx * 0.05 }}
                >
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5 text-right">
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
                              ? "bg-primary/10 border border-primary/25"
                              : "hover:bg-secondary/60 border border-transparent"
                          )}
                        >
                          {badge && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] font-mono font-bold">
                              {badge > 9 ? "9+" : badge}
                            </span>
                          )}
                          <span className={cn(
                            "text-[12px] font-mono flex-1 text-right",
                            active ? "font-bold text-primary" : "text-foreground/80"
                          )}>
                            {item.label}
                          </span>
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            active ? "bg-primary/15" : item.bg
                          )}>
                            <Icon className={cn("w-4 h-4", active ? "text-primary" : item.color)} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;
