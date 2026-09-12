import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, MessageCircle,
  BookmarkCheck, Shield, ChevronDown, ChevronUp,
  ThumbsUp, BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/hooks/useCommunity";

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}س`;
  return `${Math.floor(hrs / 24)}ي`;
};

interface Props {
  post: CommunityPost;
  onVote: (postId: string, vote: "bullish" | "bearish") => void;
  onSave: (postId: string) => void;
  onOpenComments: (postId: string) => void;
}

const WarRoomPost = ({ post, onVote, onSave, onOpenComments }: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const totalVotes = post.bullish_count + post.bearish_count;
  const bullishPct = totalVotes > 0 ? Math.round((post.bullish_count / totalVotes) * 100) : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="nx-card overflow-hidden"
    >
       <div className="space-y-3.5">
        {/* User Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[14px] font-bold font-mono text-primary border border-primary/20">
                {(post.display_name || "M")[0].toUpperCase()}
              </div>
              <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold">{post.display_name}</span>
                <span className="nx-meta nx-ltr">· {timeAgo(post.created_at)}</span>
              </div>
              <span className="nx-meta">{post.timeframe}</span>
            </div>
          </div>

          <button
            onClick={() => onSave(post.id)}
            className={cn(
              "w-11 h-11 rounded-lg transition-colors border flex items-center justify-center",
              post.is_saved
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/20"
            )}
          >
            <BookmarkCheck className={cn("w-[18px] h-[18px]", post.is_saved && "fill-current")} />
          </button>
        </div>

        {/* Asset + Direction Tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={post.prediction === "bullish" ? "nx-badge-long" : "nx-badge-short"}>
            {post.prediction === "bullish" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span className="nx-ltr font-mono">{post.pair}</span>
          </span>
          <span className="nx-badge-neutral nx-ltr">{post.timeframe}</span>
        </div>

        {/* Analysis Text */}
        {post.analysis_summary && (
          <div>
            <p className={cn("text-[16px] leading-[1.85] text-foreground/90", !showDetails && "nx-line-clamp")}>
              {post.analysis_summary}
            </p>
            {post.analysis_summary.length > 220 && (
              <button onClick={() => setShowDetails(!showDetails)} className="nx-btn-text min-h-[40px] mt-1">
                {showDetails ? "عرض أقل" : "قراءة المزيد"}
              </button>
            )}
          </div>
        )}

        {/* Image */}
        {post.image_url && (
           <div className="rounded-xl overflow-hidden border border-border">
            <img src={post.image_url} alt="تحليل" className="w-full max-h-56 object-cover" loading="lazy" />
          </div>
        )}

        {/* Intelligence + Outcome */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="nx-badge-gold">
            <Shield className="w-3.5 h-3.5" />
            AI {post.ai_confidence}%
          </span>
          {/* Outcome Badge */}
          {post.outcome === "correct" && (
            <span className="nx-badge bg-success/12 text-success">🎯 صحيح</span>
          )}
          {post.outcome === "incorrect" && (
            <span className="nx-badge bg-destructive/12 text-destructive">✗ خاطئ</span>
          )}
          {post.outcome === "pending" && post.price_at_post && (
            <span className="nx-badge-wait">⏳ قيد التحقق</span>
          )}
        </div>

        {/* Sentiment Bar — thin */}
        <div className="h-1 rounded-full bg-muted overflow-hidden flex">
          <motion.div
            className="h-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${bullishPct}%` }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="h-full bg-destructive"
            initial={{ width: 0 }}
            animate={{ width: `${100 - bullishPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Actions — Clean, minimal */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <ActionBtn
              icon={ThumbsUp}
              count={post.bullish_count + post.bearish_count}
              active={!!post.user_vote}
              onClick={() => onVote(post.id, "bullish")}
            />
            <ActionBtn
              icon={MessageCircle}
              count={post.comment_count}
              onClick={() => onOpenComments(post.id)}
            />
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="nx-tap flex items-center gap-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            تفاصيل
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div className="nx-card-flat p-2">
                   <p className="text-[13px] text-muted-foreground mb-0.5">صعودي</p>
                  <p className="nx-num text-success">{post.bullish_count}</p>
                </div>
                <div className="nx-card-flat p-2">
                   <p className="text-[13px] text-muted-foreground mb-0.5">هبوطي</p>
                  <p className="nx-num text-destructive">{post.bearish_count}</p>
                </div>
                <div className="nx-card-flat p-2">
                   <p className="text-[13px] text-muted-foreground mb-0.5">نسبة صعود</p>
                  <p className="nx-num text-primary">{bullishPct}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const ActionBtn = ({
  icon: Icon,
  count,
  active,
  onClick,
  label,
}: {
  icon: React.ElementType;
  count: number;
  active?: boolean;
  onClick?: () => void;
  label?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "nx-tap flex items-center gap-1.5 text-[13px] font-semibold transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="nx-num text-[13px]">{count > 999 ? `${(count / 1000).toFixed(1)}K` : count}</span>
  </button>
);

export default WarRoomPost;
