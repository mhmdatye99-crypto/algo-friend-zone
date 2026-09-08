import { Check, X } from "lucide-react";

const GOOD = [
  "لقطة شاشة كاملة للشارت بدون قص",
  "اسم الزوج والإطار الزمني ظاهران",
  "محور السعر على الجانب واضح",
];

const BAD = [
  "صورة ملتقطة بالكاميرا من الشاشة",
  "تكبير شديد على شمعة واحدة",
  "نوافذ أو قوائم تغطي الشارت",
];

const ChartTips = () => (
  <section className="nx-card space-y-3">
    <h2 className="nx-card-title">لأفضل نتيجة</h2>

    <ul className="space-y-2">
      {GOOD.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-md bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 text-success" />
          </span>
          <p className="nx-body">{t}</p>
        </li>
      ))}
    </ul>

    <div className="border-t border-border/60 pt-3 space-y-2">
      {BAD.map((t) => (
        <div key={t} className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-md bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5 text-destructive" />
          </span>
          <p className="nx-body text-muted-foreground">{t}</p>
        </div>
      ))}
    </div>
  </section>
);

export default ChartTips;
