import { useRef, useState } from "react";
import { ImageIcon, Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (dataUrl: string) => void;
  onError: (msg: string) => void;
}

const ChartUploader = ({ onSelect, onError }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const read = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("يرجى اختيار صورة بصيغة PNG أو JPG");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onSelect(ev.target?.result as string);
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
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
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
        className={cn(
          "rounded-xl border border-dashed px-5 py-10 text-center space-y-3 transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card/40"
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto">
          <ImageIcon className="w-6 h-6 text-primary" strokeWidth={1.8} />
        </div>
        <p className="nx-card-title">ارفع صورة الشارت</p>
        <p className="nx-meta nx-ltr">PNG • JPG • JPEG</p>
        <button onClick={() => fileRef.current?.click()} className="nx-btn-primary w-full max-w-[240px] mx-auto">
          <Upload className="w-5 h-5" /> اختيار صورة
        </button>
      </div>

      <button onClick={() => cameraRef.current?.click()} className="nx-btn-secondary w-full">
        <Camera className="w-5 h-5" /> التقاط بالكاميرا
      </button>
    </div>
  );
};

export default ChartUploader;
