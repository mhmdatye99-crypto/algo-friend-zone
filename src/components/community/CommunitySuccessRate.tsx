import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle, XCircle, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Thin circular progress component
const CircularProgress = ({ value, size = 72, strokeWidth = 3, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-[15px] font-mono font-bold", color)}>{value}%</span>
      </div>
    </div>
  );
};

const CommunitySuccessRate = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    correctCount: 0,
    incorrectCount: 0,
    pendingCount: 0,
    successRate: 0,
    todayCount: 0,
    totalVotes: 0,
    breakdown: [] as { label: string; rate: number; total: number; color: string }[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ data: posts }, { data: votes }, { data: todayPosts }] = await Promise.all([
        supabase.from("community_posts").select("id, prediction, pair, outcome"),
        supabase.from("community_votes").select("id"),
        supabase.from("community_posts").select("id").gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      ]);

      if (!posts) { setLoading(false); return; }

      const total = posts.length;
      const checked = posts.filter(p => p.outcome === "correct" || p.outcome === "incorrect");
      const correctCount = posts.filter(p => p.outcome === "correct").length;
      const incorrectCount = posts.filter(p => p.outcome === "incorrect").length;
      const pendingCount = total - checked.length;
      const successRate = checked.length > 0 ? Math.round((correctCount / checked.length) * 100) : 0;
      const bullish = posts.filter(p => p.prediction === "bullish").length;

      // Unique analysts
      const uniqueUsers = new Set<string>();
      // We can't get user_id from select above without changing query, estimate from posts
      const activeAnalysts = new Set(posts.map(p => p.id)).size; // approximate

      // Breakdown by category
      const cryptoPairs = ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "DOT", "DOGE", "AVAX", "LINK"];
      const forexPairs = ["EUR", "GBP", "USD", "JPY", "CHF", "AUD", "CAD", "NZD"];

      const cryptoPosts = posts.filter(p => cryptoPairs.some(c => p.pair.toUpperCase().includes(c)));
      const forexPosts = posts.filter(p => forexPairs.some(f => p.pair.toUpperCase().includes(f)));
      const commodityPosts = posts.filter(p => {
        const pair = p.pair.toUpperCase();
        return pair.includes("GOLD") || pair.includes("XAU") || pair.includes("OIL") || pair.includes("SILVER");
      });

      const calcRate = (arr: typeof posts) => {
        const c = arr.filter(p => p.outcome === "correct" || p.outcome === "incorrect");
        if (c.length === 0) return 0;
        return Math.round((c.filter(p => p.outcome === "correct").length / c.length) * 100);
      };

      setStats({
        totalPredictions: total,
        correctCount,
        incorrectCount,
        pendingCount,
        successRate,
        todayCount: todayPosts?.length || 0,
        totalVotes: votes?.length || 0,
        breakdown: [
          { label: "كريبتو", rate: calcRate(cryptoPosts), total: cryptoPosts.length, color: "text-primary" },
          { label: "فوركس", rate: calcRate(forexPosts), total: forexPosts.length, color: "text-accent" },
          { label: "سلع", rate: calcRate(commodityPosts), total: commodityPosts.length, color: "text-success" },
        ],
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Rate Card */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">إحصائيات المجتمع</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border text-primary bg-primary/5 border-primary/15">
            {stats.totalPredictions} تحليل
          </span>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <CircularProgress value={stats.successRate} size={88} strokeWidth={4} color="text-success" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">معدل النجاح الفعلي</p>
              <p className="text-2xl font-mono font-bold text-success">{stats.successRate}%</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="w-3 h-3" /> {stats.correctCount} صحيح
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="w-3 h-3" /> {stats.incorrectCount} خاطئ
              </span>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground">
              {stats.pendingCount} قيد التحقق · {stats.totalPredictions} إجمالي
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2">
        {stats.breakdown.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-3 flex flex-col items-center gap-2"
          >
            <CircularProgress value={cat.rate} size={56} strokeWidth={2.5} color={cat.color} />
            <div className="text-center">
              <p className="text-[10px] font-mono font-medium">{cat.label}</p>
              <p className="text-[8px] font-mono text-muted-foreground">{cat.total} تحليل</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terminal-style data strip */}
      <div className="glass rounded-xl p-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "اليوم", value: String(stats.todayCount), sub: "تحليل" },
            { label: "إجمالي", value: String(stats.totalPredictions), sub: "منشور" },
            { label: "نجاح", value: `${stats.successRate}%`, sub: "فعلي" },
            { label: "تصويتات", value: stats.totalVotes > 999 ? `${(stats.totalVotes / 1000).toFixed(1)}K` : String(stats.totalVotes), sub: "إجمالي" },
          ].map((item, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-[14px] font-mono font-bold text-foreground">{item.value}</p>
              <p className="text-[7px] font-mono text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySuccessRate;
