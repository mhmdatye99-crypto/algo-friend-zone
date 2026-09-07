import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sun, Moon, Bell, Notebook, GraduationCap,
  Crown, Coins, Camera, Wrench, Eye, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useCredits } from "@/hooks/useCredits";
import { useThemeMode } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import NotificationsSheet from "@/components/notifications/NotificationsSheet";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: "/chart-analysis", icon: Camera, label: "تحليل الشارت" },
  { path: "/journal", icon: Notebook, label: "سجل الصفقات" },
  { path: "/learning", icon: GraduationCap, label: "الأكاديمية" },
  { path: "/tools", icon: Wrench, label: "الأدوات" },
  { path: "/morning-brief", icon: Eye, label: "الإحاطة الصباحية" },
];

const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { credits } = useCredits();
  const { isDark, toggle: toggleTheme } = useThemeMode();
  const auth = useAuth() as any;
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNav = (path: string) => { navigate(path); onClose(); };
  const user = auth?.user;
  const email: string = user?.email || "";
  const displayName = user?.user_metadata?.full_name || (email ? email.split("@")[0] : "زائر");
  const initial = (displayName || "N").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    try {
      await auth?.signOut?.();
      toast.success("تم تسجيل الخروج");
      onClose();
      navigate("/auth");
    } catch {
      toast.error("تعذر تسجيل الخروج");
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              className="fixed inset-y-0 right-0 z-[60] w-[84vw] max-w-[320px] flex flex-col border-l border-border overflow-hidden bg-sidebar"
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-border">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[15px] font-bold tracking-[0.28em] text-primary">NEXUS</span>
                  <button onClick={onClose} aria-label="إغلاق" className="nx-tap flex items-center justify-center rounded-xl bg-secondary border border-border">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/12 border border-primary/30 flex items-center justify-center text-[18px] font-bold text-primary">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="nx-card-title truncate">{displayName}</p>
                    <p className="nx-meta">حساب أساسي</p>
                  </div>
                </div>
              </div>

              {/* Credits */}
              <div className="mx-4 mt-4 nx-card-flat flex items-center justify-between !py-3">
                <span className="nx-label">رصيد النقاط</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[18px] font-bold text-primary tabular-nums">{credits}</span>
                  <Coins className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Menu */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button key={item.path} onClick={() => handleNav(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 h-[52px] rounded-xl transition-colors text-right border",
                        active ? "bg-primary/10 border-primary/25" : "border-transparent hover:bg-secondary"
                      )}>
                      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.8} />
                      <span className={cn("text-[16px] font-medium", active ? "text-primary" : "text-foreground")}>{item.label}</span>
                    </button>
                  );
                })}

                <button onClick={() => setShowNotifications(true)}
                  className="relative w-full flex items-center gap-3 px-4 h-[52px] rounded-xl border border-transparent hover:bg-secondary transition-colors text-right">
                  <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[16px] font-medium text-foreground">التنبيهات</span>
                  {unreadCount > 0 && (
                    <span className="mr-auto min-w-[22px] h-[22px] px-1.5 rounded-lg bg-destructive text-destructive-foreground flex items-center justify-center text-[12px] font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <button onClick={() => { toggleTheme(); }}
                  className="w-full flex items-center gap-3 px-4 h-[52px] rounded-xl border border-transparent hover:bg-secondary transition-colors text-right">
                  {isDark ? <Sun className="w-5 h-5 text-primary" strokeWidth={1.8} /> : <Moon className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />}
                  <span className="text-[16px] font-medium text-foreground">{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                </button>
              </nav>

              {/* Premium + Logout */}
              <div className="p-4 border-t border-border space-y-3">
                <button onClick={() => handleNav("/subscription")} className="nx-btn-primary w-full">
                  <Crown className="w-5 h-5" />
                  الترقية إلى NEXUS PRO
                </button>
                <button onClick={handleSignOut} className="nx-btn-ghost w-full justify-start">
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
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
