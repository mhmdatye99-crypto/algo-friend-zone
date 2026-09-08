import { Clock, Image as ImageIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { SavedChartAnalysis } from "@/hooks/useChartAnalyses";

const NA = "—";

const ChartSignalCard = ({ item }: { item: SavedChartAnalysis }) => {
  const navigate = useNavigate();
  const isLong = item.direction === "صعودي";
  const isShort = item.direction === "هبوطي";
  const entry = item.analysis?.entry || (item.price ? String(item.price) : NA);

  return (
    <button
      onClick={() => navigate(`/chart-analysis/result/${item.id}`)}
      className="w-full text-right rounded-xl border border-border bg-card/40 p-3 space-y-2 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="font-mono font-bold text-[14px] truncate nx-ltr text-right">{item.pair}</p>
            <p className="nx-meta flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(item.created_at), "d MMM yyyy · HH:mm", { locale: ar })}
              {item.timeframe && item.timeframe !== "—" && <span>· {item.timeframe}</span>}
            </p>
          </div>
        </div>
        <span className={cn(isLong ? "nx-badge-long" : isShort ? "nx-badge-short" : "nx-chip")}>
          {isLong ? <TrendingUp className="w-3 h-3" /> : isShort ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {isLong ? "LONG" : isShort ? "SHORT" : "WAIT"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 font-mono text-[11px] tabular-nums nx-ltr">
        <div className="rounded-md bg-secondary/40 px-2 py-1">
          <p className="text-[9px] text-muted-foreground">Entry</p>
          <p className="font-bold truncate">{entry}</p>
        </div>
        <div className="rounded-md bg-secondary/40 px-2 py-1">
          <p className="text-[9px] text-muted-foreground">SL</p>
          <p className="font-bold text-destructive truncate">{item.stop_loss || NA}</p>
        </div>
        <div className="rounded-md bg-secondary/40 px-2 py-1">
          <p className="text-[9px] text-muted-foreground">TP1</p>
          <p className="font-bold text-success truncate">{item.take_profit1 || NA}</p>
        </div>
        <div className="rounded-md bg-secondary/40 px-2 py-1">
          <p className="text-[9px] text-muted-foreground">TP2</p>
          <p className="font-bold text-success truncate">{item.take_profit2 || NA}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="nx-meta">مستوى الثقة</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full", item.confidence >= 70 ? "bg-success" : item.confidence >= 50 ? "bg-primary" : "bg-destructive")}
            style={{ width: `${Math.min(100, Math.max(0, item.confidence))}%` }}
          />
        </div>
        <span className="font-mono font-bold text-[12px] tabular-nums">{item.confidence}%</span>
      </div>
    </button>
  );
};

export default ChartSignalCard;
