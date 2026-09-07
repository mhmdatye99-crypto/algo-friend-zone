import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  active?: boolean;
  className?: string;
}

/** Lightweight CSS/SVG NEXUS orb — breathing gold glow, respects reduced motion. */
const AIOrb = ({ size = 96, active = false, className }: Props) => (
  <div
    className={cn("relative shrink-0", className)}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <span
      className={cn(
        "absolute inset-0 rounded-full bg-primary/10 blur-xl motion-safe:animate-pulse",
        active && "bg-primary/20"
      )}
    />
    <span
      className={cn(
        "absolute inset-[10%] rounded-full border border-primary/40",
        "motion-safe:animate-[spin_9s_linear_infinite]"
      )}
      style={{ borderStyle: "dashed" }}
    />
    <span className="absolute inset-[22%] rounded-full border border-primary/25" />
    <div className="absolute inset-[30%] rounded-full bg-gradient-to-b from-primary/25 to-transparent border border-primary/50 flex items-center justify-center">
      <svg viewBox="0 0 24 24" width={size * 0.22} height={size * 0.22} fill="none">
        <path
          d="M5 19V5l14 14V5"
          stroke="hsl(var(--primary))"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

export default AIOrb;
