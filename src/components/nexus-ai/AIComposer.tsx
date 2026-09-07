import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { ImagePlus, Send, Mic } from "lucide-react";
import { toast } from "sonner";
import ChartImageAttachment from "./ChartImageAttachment";

export interface AIComposerHandle {
  pickImage: () => void;
  focus: () => void;
}

interface Props {
  disabled?: boolean;
  onSend: (payload: { text: string; image: string | null }) => void;
}

const MAX_MB = 8;

const AIComposer = forwardRef<AIComposerHandle, Props>(({ disabled, onSend }, ref) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    pickImage: () => fileRef.current?.click(),
    focus: () => inputRef.current?.focus(),
  }));

  const readFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة بصيغة PNG أو JPG");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`حجم الصورة يتجاوز ${MAX_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (disabled) return;
    const t = text.trim();
    if (!t && !image) return;
    onSend({ text: t, image });
    setText("");
    setImage(null);
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] space-y-2">
      {image && <ChartImageAttachment src={image} onRemove={() => setImage(null)} />}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="إرفاق صورة شارت"
          className="w-11 h-11 shrink-0 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ImagePlus className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="اسأل NEXUS..."
          className="flex-1 min-h-[44px] max-h-32 resize-none bg-card border border-border rounded-xl px-4 py-3 text-[16px] leading-[1.6] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
        />

        <button
          aria-label="الإدخال الصوتي (قريباً)"
          disabled
          title="قريباً"
          className="w-11 h-11 shrink-0 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground/50"
        >
          <Mic className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <button
          onClick={submit}
          disabled={disabled || (!text.trim() && !image)}
          aria-label="إرسال"
          className="w-11 h-11 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <Send className="w-5 h-5 rotate-180" strokeWidth={1.9} />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
});

AIComposer.displayName = "AIComposer";

export default AIComposer;
