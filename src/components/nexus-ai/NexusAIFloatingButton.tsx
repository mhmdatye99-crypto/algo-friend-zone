import { useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useNexusAI } from "@/contexts/NexusAIContext";

const STORAGE_KEY = "nexus-ai-fab-top";
const SIZE = 56;
const MIN_TOP = 96;

const sourceForPath = (path: string) => {
  if (path === "/") return "الرئيسية";
  if (path.startsWith("/markets")) return "الأسواق";
  if (path.startsWith("/signals")) return "الإشارات";
  if (path.startsWith("/community")) return "المجتمع";
  if (path.startsWith("/asset")) return "تفاصيل أصل";
  if (path.startsWith("/chart-analysis")) return "تحليل الشارت";
  return "التطبيق";
};

/** Small draggable (vertical) NEXUS AI orb button. Position persists for the session. */
const NexusAIFloatingButton = () => {
  const { openAI, open } = useNexusAI();
  const location = useLocation();
  const [top, setTop] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const n = saved ? Number(saved) : NaN;
    return Number.isFinite(n) ? n : Math.max(MIN_TOP, window.innerHeight - 240);
  });
  const dragging = useRef(false);
  const moved = useRef(false);

  const clamp = useCallback((y: number) => {
    const max = window.innerHeight - 110 - SIZE;
    return Math.min(Math.max(y, MIN_TOP), Math.max(MIN_TOP, max));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    moved.current = true;
    setTop(clamp(e.clientY - SIZE / 2));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    sessionStorage.setItem(STORAGE_KEY, String(top));
  };

  if (open) return null;

  const asset = location.pathname.startsWith("/asset")
    ? decodeURIComponent(location.pathname.replace("/asset/", "")).toUpperCase()
    : undefined;

  return (
    <button
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => {
        if (moved.current) return;
        openAI({ source: sourceForPath(location.pathname), asset });
      }}
      aria-label="فتح NEXUS AI"
      style={{ top, touchAction: "none" }}
      className="fixed left-4 z-[60] rounded-full bg-card border border-primary/40 shadow-[0_0_18px_-6px_hsl(var(--primary))] flex items-center justify-center active:scale-95 transition-transform"
    >
      <span
        className="absolute inset-0 rounded-full bg-primary/10 motion-safe:animate-pulse"
        aria-hidden="true"
      />
      <span className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M5 19V5l14 14V5"
            stroke="hsl(var(--primary))"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
};

export default NexusAIFloatingButton;
