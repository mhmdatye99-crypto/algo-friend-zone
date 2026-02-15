import { useState } from "react";
import { Home, TrendingUp, Users, User, Plus, ScanLine, BookOpen, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

const tabs = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/trade-center", icon: TrendingUp, label: "التوصيات" },
  { path: "action", icon: Plus, label: "إجراء", center: true },
  { path: "/community", icon: Users, label: "الساحة", hasBadge: true },
  { path: "/profile", icon: User, label: "الملف" },
];

const quickActions = [
  { icon: ScanLine, label: "مسح السوق — AI Scan", path: "/trade-center", color: "text-primary", bg: "bg-primary/15 border-primary/25" },
  { icon: BookOpen, label: "سجّل صفقة", path: "/trade-journal", color: "text-accent", bg: "bg-accent/15 border-accent/25" },
  { icon: TrendingUp, label: "تحليل شارت", path: "/chart-vision", color: "text-success", bg: "bg-success/15 border-success/25" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const { unreadCount } = useNotifications();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setShowActions(false)}
            />
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.path}
                    initial={{ opacity: 0, y: 16, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.9 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => { setShowActions(false); navigate(action.path); }}
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
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16 rounded-[10px] px-2 bg-card/90 backdrop-blur-[30px] border border-border/30 shadow-lg dark:shadow-[0_-4px_30px_hsla(0,0%,0%,0.4)]">
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {tabs.map((tab) => {
            const Icon = tab.icon;

            if (tab.center) {
              return (
                <button
                  key={tab.path}
                  onClick={() => setShowActions(!showActions)}
                  className="relative flex flex-col items-center justify-center -mt-7"
                >
                  <div
                    className="absolute w-[72px] h-[72px] rounded-full animate-pulse-slow pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, hsla(135, 100%, 55%, 0.12) 0%, transparent 70%)",
                    }}
                  />
                  <motion.div
                    className={cn(
                      "w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 border-2",
                      showActions
                        ? "bg-destructive text-white border-destructive/40"
                        : "bg-primary text-primary-foreground border-primary/40"
                    )}
                    style={{
                      boxShadow: "0 0 28px hsl(135 100% 55% / 0.35)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ rotate: showActions ? 45 : 0 }}
                  >
                    {showActions ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                  </motion.div>
                  <span className="text-[9px] font-mono font-bold mt-1 text-muted-foreground">
                    {showActions ? "إغلاق" : "AI Scan"}
                  </span>
                </button>
              );
            }

            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-[10px] transition-all duration-300"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-[10px] bg-primary/8 border border-primary/15"
                    style={{ boxShadow: "0 0 16px hsl(135 100% 55% / 0.08)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon className={cn(
                    "w-5 h-5 relative z-10 transition-colors duration-300",
                    active ? "text-primary" : "text-muted-foreground"
                  )} />
                  {tab.hasBadge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-destructive flex items-center justify-center text-[8px] font-mono font-bold text-white z-20">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-mono font-medium relative z-10 transition-colors duration-300",
                  active ? "text-primary" : "text-muted-foreground"
                )}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
