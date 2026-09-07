import { X } from "lucide-react";

interface Props {
  src: string;
  onRemove?: () => void;
  compact?: boolean;
}

const ChartImageAttachment = ({ src, onRemove, compact }: Props) => (
  <div className="relative inline-block rounded-lg overflow-hidden border border-border/80 bg-secondary/40">
    <img
      src={src}
      alt="صورة الشارت المرفقة"
      className={compact ? "max-h-24 w-auto object-contain" : "max-h-40 w-auto object-contain"}
      loading="lazy"
    />
    {onRemove && (
      <button
        onClick={onRemove}
        aria-label="إزالة الصورة"
        className="absolute top-1 left-1 w-7 h-7 rounded-full bg-background/85 border border-border flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5 text-foreground" />
      </button>
    )}
  </div>
);

export default ChartImageAttachment;
