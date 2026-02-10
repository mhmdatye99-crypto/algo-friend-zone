import { motion } from "framer-motion";
import { Settings, ChevronLeft, Shield, Bell, Palette, HelpCircle, LogOut, Star, Trophy, Flame } from "lucide-react";

const stats = [
  { icon: Trophy, label: "المستوى", value: "خبير", color: "text-primary" },
  { icon: Flame, label: "الأيام المتتالية", value: "14", color: "text-orange-400" },
  { icon: Star, label: "النقاط", value: "3,250", color: "text-yellow-400" },
];

const menuItems = [
  { icon: Bell, label: "الإشعارات" },
  { icon: Shield, label: "الأمان والخصوصية" },
  { icon: Palette, label: "المظهر" },
  { icon: HelpCircle, label: "المساعدة والدعم" },
];

const Profile = () => {
  return (
    <motion.div
      className="px-4 pt-12 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">حسابي</h1>
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-5 text-center mb-6 glow-gold">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-3xl font-bold text-primary-foreground">
          م
        </div>
        <h2 className="text-lg font-bold">متداول محترف</h2>
        <p className="text-xs text-muted-foreground mb-4">عضو منذ يناير 2025</p>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-secondary/50 rounded-xl p-2">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-sm font-bold font-mono">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="glass rounded-xl divide-y divide-border/30">
        {menuItems.map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{item.label}</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </motion.div>
  );
};

export default Profile;
