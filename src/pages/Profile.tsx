import { motion } from "framer-motion";
import { Settings, ChevronLeft, Shield, Bell, Palette, HelpCircle, LogOut, Star, Trophy, Flame, BarChart3, Target } from "lucide-react";

const stats = [
  { icon: Trophy, label: "Rank", value: "Expert", color: "text-primary" },
  { icon: Flame, label: "Streak", value: "14d", color: "text-warning" },
  { icon: Star, label: "XP", value: "3,250", color: "text-primary" },
];

const performanceMetrics = [
  { label: "Win Rate", value: "72%", sub: "Last 30 days" },
  { label: "Profit Factor", value: "2.4", sub: "Risk-adjusted" },
  { label: "Sharpe Ratio", value: "1.8", sub: "Annualized" },
  { label: "Max Drawdown", value: "-8.2%", sub: "Peak to trough" },
];

const menuItems = [
  { icon: Bell, label: "Alert Configuration" },
  { icon: Shield, label: "Security & API Keys" },
  { icon: Palette, label: "Terminal Theme" },
  { icon: HelpCircle, label: "Support & Documentation" },
];

const Profile = () => {
  return (
    <motion.div
      className="px-4 pt-10 pb-4 max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">Account</p>
          <h1 className="text-lg font-bold">Trader Profile & Analytics</h1>
        </div>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center">
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-lg p-4 text-center mb-4">
        <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-secondary border border-border/30 flex items-center justify-center text-2xl font-bold font-mono text-primary">
          T
        </div>
        <h2 className="text-base font-bold font-mono">Pro Trader</h2>
        <p className="text-[10px] text-muted-foreground font-mono mb-3">Member since Jan 2025</p>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="bg-secondary/40 rounded-lg p-2 border border-border/10">
              <s.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${s.color}`} />
              <p className="text-sm font-bold font-mono">{s.value}</p>
              <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Analytics */}
      <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
        <BarChart3 className="w-3 h-3 text-primary" />
        Performance Analytics
      </h3>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {performanceMetrics.map((m, i) => (
          <div key={i} className="glass rounded-lg p-3">
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{m.label}</p>
            <p className="text-lg font-bold font-mono">{m.value}</p>
            <p className="text-[8px] text-muted-foreground font-mono">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="glass rounded-lg divide-y divide-border/20">
        {menuItems.map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between px-3 py-3 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono">{item.label}</span>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg text-destructive text-xs font-mono font-medium hover:bg-destructive/10 transition-colors border border-destructive/10">
        <LogOut className="w-3.5 h-3.5" />
        Sign Out
      </button>
    </motion.div>
  );
};

export default Profile;
