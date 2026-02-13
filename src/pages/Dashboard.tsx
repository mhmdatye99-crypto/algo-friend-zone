import { motion } from "framer-motion";
import {
  Gauge, Target, AlertTriangle, Settings,
  TrendingUp, TrendingDown, Star, ChevronLeft, GripVertical, Lock, Unlock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import MiniChart from "@/components/MiniChart";
import { useFavorites } from "@/hooks/useFavorites";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";
import GaugeChart from "@/components/dashboard/GaugeChart";
import MorningBriefCard from "@/components/dashboard/MorningBriefCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const marketPulse = {
  index: 73,
  label: "صعودي معتدل",
  subMetrics: [
    { label: "تدفق المؤسسات", value: 81, color: "text-success" },
    { label: "زخم التقنيات", value: 68, color: "text-primary" },
    { label: "معنويات التجزئة", value: 55, color: "text-warning" },
    { label: "تقلّب المخاطر", value: 42, color: "text-accent" },
  ],
};

type SectionId = "morning" | "ticker" | "pulse" | "wealth" | "favorites";

const SECTION_LABELS: Record<SectionId, string> = {
  morning: "الملخص الصباحي",
  ticker: "شريط الأسعار",
  pulse: "نبض السوق",
  wealth: "مسار الثروة",
  favorites: "المفضلة",
};

const DEFAULT_ORDER: SectionId[] = ["morning", "ticker", "pulse", "wealth", "favorites"];
const STORAGE_KEY = "dashboard-section-order";

function loadOrder(): SectionId[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SectionId[];
      if (parsed.length === DEFAULT_ORDER.length && DEFAULT_ORDER.every(id => parsed.includes(id))) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_ORDER;
}

/* ─── Sortable wrapper ─── */
const SortableSection = ({ id, editMode, children }: { id: string; editMode: boolean; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {editMode && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-3.5 h-3.5 text-primary" />
        </button>
      )}
      <div className={cn(editMode && "mr-8 transition-all duration-200", isDragging && "rounded-xl ring-2 ring-primary/30")}>
        {children}
      </div>
    </div>
  );
};

/* ─── Dashboard ─── */
const Dashboard = () => {
  const navigate = useNavigate();
  const assets = useLivePrices();
  const { favorites, isLoggedIn } = useFavorites();
  const { goal, stats } = useGoalPlanner();

  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(loadOrder);
  const [editMode, setEditMode] = useState(false);

  const favoriteAssets = assets.filter(a => favorites.has(a.pair));
  const trendingAssets = assets.slice(0, 8);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder(prev => {
        const oldIndex = prev.indexOf(active.id as SectionId);
        const newIndex = prev.indexOf(over.id as SectionId);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  }, []);

  /* ─── Section renderers ─── */
  const sections: Record<SectionId, React.ReactNode> = useMemo(() => ({
    morning: (
      <motion.div variants={fadeUp}>
        <MorningBriefCard />
      </motion.div>
    ),

    ticker: (
      <motion.div variants={fadeUp} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {trendingAssets.map((asset, i) => (
            <div
              key={i}
              onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
              className="flex items-center gap-2 bg-secondary/40 rounded-[10px] px-3 py-2 border border-border/10 cursor-pointer hover:bg-secondary/60 transition-colors"
            >
              <span className="text-sm font-bold">{asset.icon}</span>
              <span className="text-[11px] font-mono font-bold">{asset.pair}</span>
              <MiniChart data={asset.sparkline} up={asset.up} width={40} height={16} />
              <span className={cn("text-[10px] font-mono font-medium price-flash", asset.up ? "text-success" : "text-destructive")}>
                {asset.up ? "+" : ""}{asset.change}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    ),

    pulse: (
      <motion.div variants={fadeUp} className="glass rounded-[14px] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">نبض الذكاء السوقي</p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            مباشر
          </span>
        </div>
        <GaugeChart value={marketPulse.index} label={marketPulse.label} />
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {marketPulse.subMetrics.map((m, i) => (
            <div key={i} className="bg-secondary/40 rounded-[10px] px-2 py-1.5 text-center border border-border/10">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider leading-tight mb-0.5">{m.label}</p>
              <p className={cn("text-sm font-bold font-mono", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    ),

    wealth: goal && stats ? (
      <motion.div variants={fadeUp}>
        <div
          onClick={() => navigate("/goal-planner")}
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer transition-all hover:brightness-110"
          style={{ background: "hsla(240, 15%, 3.5%, 0.5)", border: "1px solid hsla(43, 100%, 50%, 0.1)" }}
        >
          <Target className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">مسار الثروة</span>
              <span className="text-[11px] font-mono font-bold text-primary">{stats.progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(43 100% 40%), hsl(43 100% 55%))", boxShadow: "0 0 8px hsl(43 100% 50% / 0.4)" }}
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 1.5 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] font-mono text-muted-foreground">
              <span>${goal.current_balance.toLocaleString()}</span>
              <span>${goal.target_goal.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/goal-planner"); }}
            className="w-7 h-7 rounded-[10px] bg-secondary/60 flex items-center justify-center shrink-0 hover:bg-secondary transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        {!stats.todayLogged && (
          <motion.div
            className="mt-2 flex items-center gap-2 px-3 py-2 rounded-[10px] bg-warning/10 border border-warning/20"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
            <span className="text-[10px] font-mono text-warning font-bold">
              {stats.missedDays > 0 ? `⚠ فاتتك ${stats.missedDays} أيام — سجّل أرباحك` : "لم تسجّل أرباح اليوم"}
            </span>
          </motion.div>
        )}
      </motion.div>
    ) : null,

    favorites: isLoggedIn && favoriteAssets.length > 0 ? (
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" /> المفضلة
          </p>
          <button onClick={() => navigate("/markets")} className="text-[10px] font-mono text-primary flex items-center gap-1">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        <div className="glass rounded-[12px] divide-y divide-border/10">
          {favoriteAssets.slice(0, 5).map((asset) => (
            <div
              key={asset.pair}
              onClick={() => navigate(`/asset/${encodeURIComponent(asset.pair)}`)}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border/20">
                  <span className="text-sm">{asset.icon}</span>
                </div>
                <span className="text-[12px] font-mono font-medium">{asset.pair}</span>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={asset.sparkline} up={asset.up} width={40} height={16} />
                <span className="text-[11px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</span>
                <span className={cn("text-[10px] font-mono font-medium tabular-nums price-flash", asset.up ? "text-success" : "text-destructive")}>
                  {asset.up ? "+" : ""}{asset.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    ) : null,
  }), [trendingAssets, favoriteAssets, isLoggedIn, goal, stats, navigate]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="px-4 pt-4 pb-28 space-y-5 max-w-lg mx-auto"
    >
      {/* Edit mode toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditMode(prev => !prev)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all",
            editMode
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-secondary/50 text-muted-foreground border border-border/10 hover:text-foreground"
          )}
        >
          {editMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {editMode ? "تم الترتيب" : "تخصيص الترتيب"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map(id => {
            const content = sections[id];
            if (!content) return null;
            return (
              <SortableSection key={id} id={id} editMode={editMode}>
                {content}
              </SortableSection>
            );
          })}
        </SortableContext>
      </DndContext>
    </motion.div>
  );
};

export default Dashboard;
