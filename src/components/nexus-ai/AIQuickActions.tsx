import { ImageIcon, Activity, Zap, Search } from "lucide-react";

export type QuickActionId = "chart" | "market" | "signal" | "asset";

const actions: { id: QuickActionId; label: string; hint: string; icon: typeof ImageIcon }[] = [
  { id: "chart", label: "تحليل صورة شارت", hint: "ارفع صورة ودع NEXUS يقرأها", icon: ImageIcon },
  { id: "market", label: "تحليل السوق", hint: "نظرة على الاتجاه العام", icon: Activity },
  { id: "signal", label: "شرح إشارة", hint: "فهم منطق الدخول والخروج", icon: Zap },
  { id: "asset", label: "اشرح لي هذا الأصل", hint: "تفكيك سلوك الأصل الحالي", icon: Search },
];

const AIQuickActions = ({ onSelect }: { onSelect: (id: QuickActionId) => void }) => (
  <div className="grid grid-cols-2 gap-3">
    {actions.map(({ id, label, hint, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className="nx-card text-right space-y-2 hover:border-primary/40 transition-colors active:scale-[0.99]"
      >
        <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        <p className="text-[15px] font-semibold text-foreground leading-snug">{label}</p>
        <p className="nx-meta leading-snug">{hint}</p>
      </button>
    ))}
  </div>
);

export default AIQuickActions;
