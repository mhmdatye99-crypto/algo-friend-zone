import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface Props {
  src: string;
  compact?: boolean;
}

const ChartPreview = ({ src, compact }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
        <img
          src={src}
          alt="صورة الشارت المرفوعة"
          className={compact ? "block w-full max-h-44 object-contain" : "block w-full max-h-[420px] object-contain"}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="فتح معاينة أكبر"
          title="فتح معاينة أكبر"
          onClick={() => setOpen(true)}
          className="absolute left-2 bottom-2 border border-border bg-background/85 backdrop-blur-sm"
        >
          <Maximize2 />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-5xl p-2 bg-background border-border">
          <DialogTitle className="sr-only">معاينة صورة الشارت</DialogTitle>
          <DialogDescription className="sr-only">عرض الصورة المرفوعة بحجم أكبر</DialogDescription>
          <img src={src} alt="معاينة مكبرة لصورة الشارت" className="block w-full max-h-[82vh] object-contain rounded-lg" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChartPreview;
