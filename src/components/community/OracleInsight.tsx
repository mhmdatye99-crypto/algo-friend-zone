import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/hooks/useCommunity";

interface Props {
  posts: CommunityPost[];
}

const OracleInsight = ({ posts }: Props) => {
  if (posts.length < 3) return null;

  const bullishCount = posts.filter(p => p.prediction === "bullish").length;
  const bearishCount = posts.filter(p => p.prediction === "bearish").length;
  const totalVotes = posts.reduce((s, p) => s + p.bullish_count + p.bearish_count, 0);
  const dominantSentiment = bullishCount > bearishCount ? "bullish" : "bearish";
  const sentimentPct = Math.round(
    (Math.max(bullishCount, bearishCount) / posts.length) * 100
  );

  // Find the most discussed pair
  const pairCounts = new Map<string, number>();
  posts.forEach(p => pairCounts.set(p.pair, (pairCounts.get(p.pair) || 0) + 1));
  const topPair = [...pairCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "BTC/USDT";

  // High confidence posts
  const highConfPosts = posts.filter(p => p.ai_confidence >= 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-accent/20 bg-gradient-to-l from-accent/8 via-accent/4 to-transparent"
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-mono font-bold text-accent">Nexus Oracle</span>
              <Zap className="w-3 h-3 text-warning" />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">تحليل آلي للاتجاهات</span>
          </div>
        </div>

        {/* Insight Content */}
        <div className="space-y-2">
          <p className="text-[11px] font-mono text-foreground/90 leading-relaxed">
            <span className="text-accent font-bold">📡 نبض المجتمع:</span>{" "}
            {sentimentPct}% من المحللين يتوقعون اتجاهاً{" "}
            <span className={cn(
              "font-bold",
              dominantSentiment === "bullish" ? "text-success" : "text-destructive"
            )}>
              {dominantSentiment === "bullish" ? "صعودياً 📈" : "هبوطياً 📉"}
            </span>{" "}
            على <span className="text-primary font-bold">{topPair}</span>.
          </p>

          {highConfPosts.length > 0 && (
            <p className="text-[10px] font-mono text-muted-foreground">
              ⚡ {highConfPosts.length} تحليل بثقة AI فوق 80% — {totalVotes} تصويت إجمالي هذا الأسبوع.
            </p>
          )}
        </div>

        {/* Sentiment Mini-bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-mono text-success">
            <TrendingUp className="w-3 h-3" />
            {bullishCount}
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-full bg-success"
              style={{ width: `${(bullishCount / posts.length) * 100}%` }}
            />
            <div
              className="h-full bg-destructive"
              style={{ width: `${(bearishCount / posts.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-destructive">
            <TrendingDown className="w-3 h-3" />
            {bearishCount}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OracleInsight;
