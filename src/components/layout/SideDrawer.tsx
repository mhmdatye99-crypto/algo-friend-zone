import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Wrench,
  Users, X, Crown, Sun, Coins, Bell, Shield,
  Moon, Settings, Lightbulb, Notebook, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useCredits } from "@/hooks/useCredits";
import { useThemeMode } from "@/hooks/useTheme";
import { toast } from "sonner";
import { useState } from "react";
import NotificationsSheet from "@/components/notifications/NotificationsSheet";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: "القيادة",
    items: [
      { path: "/", icon: LayoutDashboard, label: "المحور" },
      { path: "/trade-center", icon: BarChart3, label: "المحطة" },
      { path: "/profile", icon: Shield, label: "الخزنة" },
    ],
  },
  {
    title: "أدوات",
    items: [
      { path: "/journal", icon: Notebook, label: "اليومية" },
      { path: "/tools", icon: Wrench, label: "الأدوات" },
      { path: "/morning-brief", icon: Sun, label: "الملخص الصباحي" },
    ],
  },
  {
    title: "مجتمع",
    items: [
      { path: "/learning", icon: Lightbulb, label: "الأكاديمية" },
      { path: "/community", icon: Users, label: "الساحة", badge: "community" as const },
    ],
  },
  {
    title: "الحساب",
    items: [
      { path: "/subscription", icon: Crown, label: "الاشتراك" },
    ],
  },
];

const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { credits } = useCredits();
  const { isDark, toggle: toggleTheme } = useThemeMode();
  const [showNotifications, setShowNotifications] = useState(false);

  const getBadge = (badge?: string) => {
    if (badge === "community" && unreadCount > 0) return unreadCount;
    return null;
  };

  const handleNav = (path: string) => { navigate(path); onClose(); };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 right-0 z-[60] w-[78vw] max-w-[280px] flex flex-col shadow-2xl border-l border-border/10 overflow-hidden"
              style={{ backgroundColor: "hsl(var(--background))" }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border/10">
                <button onClick={onClose} className="w-7 h-7 rounded-md bg-secondary/40 flex items-center justify-center border border-border/10">
                  <X className="w-3.5 h-3.5 text-muted-foreground/60" />
                </button>
                <span className="text-[11px] font-mono font-black tracking-wider text-accent">NEXUS</span>
              </div>

              {/* Credits */}
              <div className="mx-3 mt-2 mb-1 p-2.5 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-between">
                <button onClick={() => handleNav("/subscription")} className="text-[9px] font-mono text-accent font-bold hover:underline">ترقية</button>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-mono font-bold text-accent tabular-nums">{credits}</span>
                  <Coins className="w-3.5 h-3.5 text-accent/70" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-2">
                {menuSections.map((section, sIdx) => (
                  <div key={section.title}>
                    <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.15em] px-2 mb-1 text-right">{section.title}</p>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = location.pathname === item.path;
                      const badge = getBadge(item.badge);
                      return (
                        <button key={item.path} onClick={() => handleNav(item.path)}
                          className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-right",
                            active ? "bg-accent/8 border border-accent/15" : "hover:bg-secondary/30 border border-transparent"
                          )}>
                          {badge && <span className="min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white flex items-center justify-center text-[8px] font-mono font-bold">{badge > 9 ? "9+" : badge}</span>}
                          <span className={cn("text-[11px] font-mono flex-1 text-right", active ? "font-bold text-accent" : "text-foreground/60")}>{item.label}</span>
                          <Icon className={cn("w-4 h-4", active ? "text-accent" : "text-muted-foreground/40")} strokeWidth={active ? 2 : 1.5} />
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Settings */}
                <div className="pt-1 border-t border-border/10">
                  <div className="flex gap-1">
                    <button onClick={() => { setShowNotifications(true); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <Bell className="w-3.5 h-3.5 text-muted-foreground/40" />
                      <span className="text-[9px] font-mono text-muted-foreground/50">تنبيهات</span>
                    </button>
                    <button onClick={() => { toggleTheme(); toast.success(isDark ? "☀️" : "🌙"); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      {isDark ? <Sun className="w-3.5 h-3.5 text-accent/50" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground/40" />}
                      <span className="text-[9px] font-mono text-muted-foreground/50">{isDark ? "فاتح" : "داكن"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <NotificationsSheet open={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

export default SideDrawer;
