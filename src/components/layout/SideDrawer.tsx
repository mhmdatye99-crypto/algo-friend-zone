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
  { path: "/journal", icon: Notebook, label: "سجل الصفقات", desc: "تتبع صفقاتك وتحليلاتك" },
  { path: "/chart-analysis", icon: Camera, label: "تحليل الشارت", desc: "حلل صورة شارت بالذكاء الاصطناعي" },
  { path: "/learning", icon: GraduationCap, label: "الأكاديمية والمُرشد", desc: "تعلّم واسأل المُرشد AI" },
  { path: "/tools", icon: Wrench, label: "الأدوات المالية", desc: "حاسبة المخاطر ومسار النمو" },
  { path: "/morning-brief", icon: Eye, label: "الإحاطة الصباحية", desc: "تقرير X اليومي" },
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 right-0 z-[60] w-[78vw] max-w-[280px] flex flex-col shadow-2xl border-l border-border/10 overflow-hidden"
              style={{ backgroundColor: "hsl(var(--background))" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/10">
                <button onClick={onClose} className="w-7 h-7 rounded-md bg-secondary/40 flex items-center justify-center border border-border/10">
                  <X className="w-3.5 h-3.5 text-muted-foreground/60" />
                </button>
                <span className="text-[11px] font-mono font-black tracking-wider text-primary">NEXUS</span>
              </div>

              {/* Credits */}
              <div className="mx-3 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <button onClick={() => handleNav("/subscription")} className="text-[10px] font-mono text-primary font-bold hover:underline">ترقية</button>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-mono font-bold text-primary tabular-nums">{credits}</span>
                  <Coins className="w-3.5 h-3.5 text-primary/70" />
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button key={item.path} onClick={() => handleNav(item.path)}
                      className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-right",
                        active ? "bg-primary/8 border border-primary/15" : "hover:bg-secondary/30 border border-transparent"
                      )}>
                      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground/50")} strokeWidth={active ? 2 : 1.5} />
                      <div className="flex-1 min-w-0 text-right">
                        <p className={cn("text-[11px] font-mono", active ? "font-bold text-primary" : "text-foreground/70")}>{item.label}</p>
                        <p className="text-[8px] font-mono text-muted-foreground/40 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="px-3 pb-4 pt-2 border-t border-border/10">
                <div className="flex gap-2">
                  <button onClick={() => { setShowNotifications(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-secondary/30 transition-colors relative border border-border/10">
                    <Bell className="w-4 h-4 text-muted-foreground/50" />
                    <span className="text-[10px] font-mono text-muted-foreground/60">تنبيهات</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-3 min-w-[14px] h-3.5 px-1 rounded-full bg-destructive text-white flex items-center justify-center text-[7px] font-mono font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                  </button>
                  <button onClick={() => { toggleTheme(); toast.success(isDark ? "☀️" : "🌙"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-secondary/30 transition-colors border border-border/10">
                    {isDark ? <Sun className="w-4 h-4 text-primary/50" /> : <Moon className="w-4 h-4 text-muted-foreground/50" />}
                    <span className="text-[10px] font-mono text-muted-foreground/60">{isDark ? "فاتح" : "داكن"}</span>
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
