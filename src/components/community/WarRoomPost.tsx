import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, MessageCircle, Bookmark,
  BookmarkCheck, Shield, Award, Eye, Clock
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
  if (mins < 60) return `منذ ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  return `منذ ${Math.floor(hrs / 24)} ي`;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[11px] font-bold font-mono text-muted-foreground border border-border/20">
            {(post.display_name || "M")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-mono font-medium">{post.display_name}</span>
              <span className={cn("text-[8px] font-mono px-1.5 py-0.5 rounded-md border", tag.color)}>
                {tag.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border",
          post.prediction === "bullish"
            ? "text-success bg-success/10 border-success/20"
            : "text-destructive bg-destructive/10 border-destructive/20"
        )}>
          {post.prediction === "bullish" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {post.prediction === "bullish" ? "صعودي" : "هبوطي"}
        </div>
      </div>

      {/* Pair & Confidence */}
      <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2.5 border border-border/10">
        <div>
          <span className="text-[14px] font-mono font-bold">{post.pair}</span>
          <span className="text-[10px] font-mono text-muted-foreground mr-2">· {post.timeframe}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-mono text-accent">ثقة AI: <span className="font-bold">{post.ai_confidence}%</span></span>
        </div>
      </div>

      {/* Analysis Summary */}
      {post.analysis_summary && (
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed px-1">
          {post.analysis_summary}
        </p>
      )}

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
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-success">{bullishPct}% صعودي ({post.bullish_count})</span>
          <span className="text-destructive">{100 - bullishPct}% هبوطي ({post.bearish_count})</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-border/10">
        <div className="flex items-center gap-1.5">
          {/* Bullish Vote */}
          <button
            onClick={() => onVote(post.id, "bullish")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all",
              post.user_vote === "bullish"
                ? "bg-success/20 text-success glow-success border border-success/30"
                : "bg-secondary text-muted-foreground hover:bg-success/10 hover:text-success border border-border/10"
            )}
          >
            <TrendingUp className="w-3 h-3" /> صعودي
          </button>
          {/* Bearish Vote */}
          <button
            onClick={() => onVote(post.id, "bearish")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all",
              post.user_vote === "bearish"
                ? "bg-destructive/20 text-destructive glow-danger border border-destructive/30"
                : "bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-border/10"
            )}
          >
            <TrendingDown className="w-3 h-3" /> هبوطي
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Comments */}
          <button
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors border border-border/10"
          >
            <MessageCircle className="w-3 h-3" /> {post.comment_count}
          </button>
          {/* Save Strategy */}
          <button
            onClick={() => onSave(post.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all border border-border/10",
              post.is_saved
                ? "bg-primary/15 text-primary glow-gold"
                : "bg-secondary text-muted-foreground hover:text-primary"
            )}
          >
            {post.is_saved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            {post.is_saved ? "محفوظ" : "نسخ"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WarRoomPost;
