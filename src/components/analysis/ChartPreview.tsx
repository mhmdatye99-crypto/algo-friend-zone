interface Props {
  src: string;
  compact?: boolean;
}

const ChartPreview = ({ src, compact }: Props) => (
  <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
    <img
      src={src}
      alt="صورة الشارت"
      className={compact ? "w-full max-h-40 object-contain" : "w-full max-h-[420px] object-contain"}
    />
  </div>
);

export default ChartPreview;
