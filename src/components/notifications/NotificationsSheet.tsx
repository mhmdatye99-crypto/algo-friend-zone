import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, CheckCheck, Trash2, TrendingUp, MessageCircle, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  return `منذ ${Math.floor(hrs / 24)} ي`;
};

const typeIcon = (type: string) => {
  switch (type) {
    case "vote": return <ThumbsUp className="w-3.5 h-3.5 text-primary" />;
    case "comment": return <MessageCircle className="w-3.5 h-3.5 text-accent" />;
    case "reply": return <MessageCircle className="w-3.5 h-3.5 text-blue-400" />;
    default: return <Bell className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationsSheet = ({ open, onClose }: Props) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  const handleTap = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.post_id) {
      onClose();
      navigate("/community");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute top-0 inset-x-0 max-h-[75vh] bg-background border-b border-border/30 rounded-b-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-mono font-bold">الإشعارات</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-destructive text-[13px] font-mono font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="قراءة الكل"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                  title="مسح الكل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-[13px] font-mono text-muted-foreground">
                  لا توجد إشعارات بعد
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleTap(n)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-right border-b border-border/10 transition-colors hover:bg-secondary/40",
                    !n.is_read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/20">
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13px] font-mono leading-relaxed",
                      n.is_read ? "text-muted-foreground" : "text-foreground font-medium"
                    )}>
                      {n.message}
                    </p>
                    <span className="text-[13px] font-mono text-muted-foreground/60">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationsSheet;
