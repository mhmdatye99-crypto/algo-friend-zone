import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: number[];
  up: boolean;
  width?: number;
  height?: number;
  className?: string;
}

const MiniChart = ({ data, up, width = 60, height = 24, className }: MiniChartProps) => {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={`grad-${up ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${up ? "up" : "down"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={up ? "hsl(155 100% 45%)" : "hsl(350 100% 50%)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MiniChart;
