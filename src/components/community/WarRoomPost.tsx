import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, MessageCircle, Bookmark,
  BookmarkCheck, Shield, Clock, Eye, Repeat2, Flame,
  ThumbsUp, Heart, BarChart2, BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/hooks/useCommunity";

const expertTags: Record<string, { label: string; color: string }> = {
  top_forecaster: { label: "أفضل متنبئ", color: "text-primary bg-primary/10 border-primary/30" },
  chart_master: { label: "أستاذ الشارت", color: "text-accent bg-accent/10 border-accent/30" },
  whale_tracker: { label: "متتبع الحيتان", color: "text-success bg-success/10 border-success/30" },
};

const getRandomTag = (userId: string) => {
  const tags = Object.values(expertTags);
  const idx = userId.charCodeAt(0) % tags.length;
  return tags[idx];
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}دقائق`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ساعات`;
  return `${Math.floor(hrs / 24)}أيام`;
};

interface Props {
  post: CommunityPost;
  onVote: (postId: string, vote: "bullish" | "bearish") => void;
  onSave: (postId: string) => void;
  onOpenComments: (postId: string) => void;
}

const WarRoomPost = ({ post, onVote, onSave, onOpenComments }: Props) => {
  const tag = getRandomTag(post.user_id);
  const totalVotes = post.bullish_count + post.bearish_count;
  const bullishPct = totalVotes > 0 ? Math.round((post.bullish_count / totalVotes) * 100) : 50;
  const viewCount = Math.floor(post.user_id.charCodeAt(2) * 47 + 200);
  const followerCount = Math.floor(post.user_id.charCodeAt(1) * 12 + 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 space-y-3">
        {/* User Header - CMC Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-[14px] font-bold font-mono text-primary border-2 border-primary/20">
                {(post.display_name || "M")[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-background" />
              </div>
            </div>
            {/* Name & Meta */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-mono font-bold">{post.display_name}</span>
                <span className="text-[9px] text-muted-foreground font-mono">· {timeAgo(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted-foreground">
                  {followerCount.toLocaleString()} متابعون
                </span>
                <span className={cn("text-[8px] font-mono px-1.5 py-0.5 rounded-md border", tag.color)}>
                  {tag.label}
                </span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSave(post.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all",
              post.is_saved
                ? "bg-primary/15 text-primary border border-primary/25"
                : "bg-primary text-primary-foreground"
            )}
          >
            {post.is_saved ? (
              <><BookmarkCheck className="w-3 h-3" /> متابَع</>
            ) : (
              <>+ متابعة</>
            )}
          </motion.button>
        </div>

        {/* Post Content */}
        {post.analysis_summary && (
          <p className="text-[12px] font-mono text-foreground/85 leading-[1.7]">
            {post.analysis_summary}
          </p>
        )}

        {/* Asset Tag with Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border",
            post.prediction === "bullish"
              ? "text-success bg-success/8 border-success/15"
              : "text-destructive bg-destructive/8 border-destructive/15"
          )}>
            {post.prediction === "bullish" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {post.pair}
            <span className="text-[10px]">
              {post.prediction === "bullish" ? `+${bullishPct}%` : `-${100 - bullishPct}%`}
            </span>
          </div>
          {post.timeframe && (
            <span className="text-[9px] font-mono text-muted-foreground bg-secondary/60 px-2 py-1 rounded-md border border-border/10">
              {post.timeframe}
            </span>
          )}
          <div className="flex items-center gap-1 bg-accent/8 px-2 py-1 rounded-md border border-accent/15">
            <Shield className="w-3 h-3 text-accent" />
            <span className="text-[9px] font-mono text-accent font-bold">AI {post.ai_confidence}%</span>
          </div>
        </div>

        {/* Voting Bar */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-muted overflow-hidden flex">
            <motion.div
              className="h-full bg-gradient-to-r from-success to-success/70"
              initial={{ width: 0 }}
              animate={{ width: `${bullishPct}%` }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              className="h-full bg-gradient-to-l from-destructive to-destructive/70"
              initial={{ width: 0 }}
              animate={{ width: `${100 - bullishPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Reactions Row - CMC Style */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <ReactionChip
            emoji="🔥"
            count={post.bullish_count}
            active={post.user_vote === "bullish"}
            onClick={() => onVote(post.id, "bullish")}
          />
          <ReactionChip
            emoji="👍"
            count={Math.floor(post.bullish_count * 0.7)}
            active={false}
            onClick={() => onVote(post.id, "bullish")}
          />
          <ReactionChip
            emoji="❤️"
            count={Math.floor(totalVotes * 0.4)}
            active={false}
            onClick={() => {}}
          />
          <ReactionChip
            emoji="📈"
            count={post.bearish_count}
            active={post.user_vote === "bearish"}
            onClick={() => onVote(post.id, "bearish")}
          />
        </div>

        {/* Action Bar - CMC Style */}
        <div className="flex items-center justify-between pt-2 border-t border-border/10">
          <div className="flex items-center gap-4">
            <ActionBtn icon={Eye} count={viewCount} label="مشاهدة" />
            <ActionBtn
              icon={MessageCircle}
              count={post.comment_count}
              label="تعليق"
              onClick={() => onOpenComments(post.id)}
            />
            <ActionBtn icon={Repeat2} count={Math.floor(totalVotes * 0.2)} label="مشاركة" />
          </div>
          <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <span className="text-sm">•••</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Reaction Chip Component
const ReactionChip = ({
  emoji,
  count,
  active,
  onClick,
}: {
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.9 }}
    className={cn(
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium border transition-all",
      active
        ? "bg-primary/10 border-primary/25 text-foreground"
        : "bg-secondary/40 border-border/10 text-muted-foreground hover:bg-secondary/60"
    )}
  >
    <span className="text-[13px]">{emoji}</span>
    {count > 0 && <span>{count}</span>}
  </motion.button>
);

// Action Button Component
const ActionBtn = ({
  icon: Icon,
  count,
  label,
  onClick,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon className="w-3.5 h-3.5" />
    <span>{count > 999 ? `${(count / 1000).toFixed(1)}K` : count}</span>
  </button>
);

export default WarRoomPost;
