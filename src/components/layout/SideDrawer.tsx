import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sun, Moon, Bell, Notebook, GraduationCap,
  Crown, Coins, Camera, Wrench, Eye
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

const menuItems = [
  { path: "/journal", icon: Notebook, label: "سجل الصفقات", desc: "تتبع وتحليل" },
  { path: "/chart-analysis", icon: Camera, label: "تحليل الشارت", desc: "AI Chart Scanner" },
  { path: "/learning", icon: GraduationCap, label: "الأكاديمية", desc: "مسار النمو والمُرشد" },
  { path: "/tools", icon: Wrench, label: "الأدوات", desc: "حاسبة المخاطر" },
  { path: "/morning-brief", icon: Eye, label: "الإحاطة الصباحية", desc: "X Daily Brief" },
  { path: "/subscription", icon: Crown, label: "الاشتراك", desc: "ترقية الحساب" },
];

const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { credits } = useCredits();
  const { isDark, toggle: toggleTheme } = useThemeMode();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNav = (path: string) => { navigate(path); onClose(); };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 450, damping: 42 }}
              className="fixed inset-y-0 right-0 z-[60] w-[72vw] max-w-[260px] flex flex-col border-l border-border/8 overflow-hidden"
              style={{ backgroundColor: "hsl(var(--background))" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/8">
                <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-secondary/30 border border-border/10" style={{ borderRadius: '3px' }}>
                  <X className="w-3 h-3 text-muted-foreground/50" />
                </button>
                <span className="text-[10px] font-mono font-black tracking-[0.3em] text-primary/70">NEXUS</span>
              </div>

              {/* Credits */}
              <div className="mx-3 mt-3 p-2.5 bg-primary/4 border border-primary/8 flex items-center justify-between" style={{ borderRadius: '4px' }}>
                <button onClick={() => handleNav("/subscription")} className="text-[8px] font-mono text-primary/60 font-bold hover:text-primary transition-colors">ترقية</button>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-mono font-bold text-primary tabular-nums">{credits}</span>
                  <Coins className="w-3 h-3 text-primary/50" />
                </div>
              </div>

              {/* Menu */}
              <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button key={item.path} onClick={() => handleNav(item.path)}
                      className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 transition-all text-right border",
                        active ? "bg-primary/6 border-primary/12" : "hover:bg-secondary/15 border-transparent"
                      )}
                      style={{ borderRadius: '4px' }}>
                      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-muted-foreground/35")} strokeWidth={active ? 2 : 1.4} />
                      <div className="flex-1 min-w-0 text-right">
                        <p className={cn("text-[10px] font-mono", active ? "font-bold text-primary" : "text-foreground/60")}>{item.label}</p>
                        <p className="text-[7px] font-mono text-muted-foreground/25 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom */}
              <div className="px-3 pb-4 pt-2 border-t border-border/8">
                <div className="flex gap-1.5">
                  <button onClick={() => setShowNotifications(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-secondary/15 transition-colors relative border border-border/8" style={{ borderRadius: '3px' }}>
                    <Bell className="w-3.5 h-3.5 text-muted-foreground/35" />
                    <span className="text-[8px] font-mono text-muted-foreground/40">تنبيهات</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-2 min-w-[12px] h-3 px-0.5 bg-destructive text-white flex items-center justify-center text-[6px] font-mono font-bold" style={{ borderRadius: '2px' }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                  </button>
                  <button onClick={() => { toggleTheme(); toast.success(isDark ? "☀️" : "🌙"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-secondary/15 transition-colors border border-border/8" style={{ borderRadius: '3px' }}>
                    {isDark ? <Sun className="w-3.5 h-3.5 text-primary/40" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground/35" />}
                    <span className="text-[8px] font-mono text-muted-foreground/40">{isDark ? "فاتح" : "داكن"}</span>
                  </button>
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
