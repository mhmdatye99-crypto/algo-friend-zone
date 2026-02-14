import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, MessageCircle,
  BookmarkCheck, Shield, ChevronDown, ChevronUp,
  ThumbsUp, Eye, BadgeCheck
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
      className="glass rounded-xl overflow-hidden"
      style={{ borderColor: "hsla(43, 100%, 50%, 0.06)" }}
    >
      <div className="p-4 space-y-3">
        {/* User Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/15 flex items-center justify-center text-[13px] font-bold font-mono text-primary border border-primary/15">
                {(post.display_name || "M")[0].toUpperCase()}
              </div>
              <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-mono font-bold">{post.display_name}</span>
                <span className="text-[9px] text-muted-foreground font-mono">· {timeAgo(post.created_at)}</span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">{post.timeframe}</span>
            </div>
          </div>

          <button
            onClick={() => onSave(post.id)}
            className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border",
              post.is_saved
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-secondary/60 text-muted-foreground border-border/10 hover:text-primary hover:border-primary/20"
            )}
          >
            {post.is_saved ? <><BookmarkCheck className="w-3 h-3 inline mr-1" />محفوظ</> : "+ حفظ"}
          </button>
        </div>

        {/* Analysis Text */}
        {post.analysis_summary && (
          <p className="text-[11px] font-mono text-foreground/80 leading-[1.8]">
            {post.analysis_summary}
          </p>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="rounded-lg overflow-hidden border border-border/10">
            <img src={post.image_url} alt="تحليل" className="w-full max-h-56 object-cover" loading="lazy" />
          </div>
        )}

        {/* Asset + Direction Tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border",
            post.prediction === "bullish"
              ? "text-success bg-success/5 border-success/12"
              : "text-destructive bg-destructive/5 border-destructive/12"
          )}>
            {post.prediction === "bullish" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {post.pair}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-accent/12 bg-accent/5">
            <Shield className="w-3 h-3 text-accent" />
            <span className="text-[9px] font-mono text-accent font-bold">AI {post.ai_confidence}%</span>
          </div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <ActionBtn
              icon={Eye}
              count={Math.floor(post.user_id.charCodeAt(2) * 47 + 200)}
            />
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            تفاصيل
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
              <div className="pt-2 border-t border-border/10 grid grid-cols-3 gap-2 text-center">
                <div className="bg-secondary/30 rounded-lg p-2">
                  <p className="text-[8px] font-mono text-muted-foreground">صعودي</p>
                  <p className="text-[13px] font-mono font-bold text-success">{post.bullish_count}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-2">
                  <p className="text-[8px] font-mono text-muted-foreground">هبوطي</p>
                  <p className="text-[13px] font-mono font-bold text-destructive">{post.bearish_count}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-2">
                  <p className="text-[8px] font-mono text-muted-foreground">نسبة صعود</p>
                  <p className="text-[13px] font-mono font-bold text-primary">{bullishPct}%</p>
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
}: {
  icon: React.ElementType;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 text-[10px] font-mono transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )}
  >
    <Icon className="w-3.5 h-3.5" />
    <span>{count > 999 ? `${(count / 1000).toFixed(1)}K` : count}</span>
  </button>
);

export default WarRoomPost;
