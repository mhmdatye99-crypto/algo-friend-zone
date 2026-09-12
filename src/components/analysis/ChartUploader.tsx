import { useRef, useState } from "react";
import { ScanLine, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (dataUrl: string) => void;
  onError: (msg: string) => void;
}

const ChartUploader = ({ onSelect, onError }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const read = (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      onError("يرجى اختيار صورة بصيغة PNG أو JPG");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onError("حجم الصورة كبير جداً. الحد الأقصى 8 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => onError("تعذر قراءة الصورة. حاول اختيار ملف آخر");
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== "string") {
        onError("تعذر قراءة الصورة. حاول اختيار ملف آخر");
        return;
      }
      const probe = new Image();
      probe.onload = () => onSelect(result);
      probe.onerror = () => onError("ملف الصورة تالف أو غير مدعوم");
      probe.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={(e) => {
          read(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          read(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="اختيار صورة شارت"
        className={cn(
          "min-h-[330px] rounded-xl border border-dashed px-5 py-10 text-center flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "border-primary bg-primary/10" : "border-primary/40 bg-card hover:border-primary/65 hover:bg-primary/[0.04]"
        )}
      >
        <div className="relative w-16 h-16 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center gold-glow">
          <ScanLine className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="nx-section">ارفع صورة الشارت</p>
          <p className="nx-meta nx-ltr">PNG · JPG · JPEG</p>
          <p className="nx-meta">الحد الأقصى 8 ميجابايت</p>
        </div>
        <Button type="button" className="nx-btn-primary w-full max-w-[240px]" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
          <Upload className="w-5 h-5" /> اختيار صورة
        </Button>
      </div>
    </div>
  );
};

export default ChartUploader;
