import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Reply, Clock, ChevronDown, ChevronUp,
  MessageCircle, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  display_name: string;
  replies: Comment[];
}

interface Props {
  postId: string | null;
  onClose: () => void;
}

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  return `منذ ${Math.floor(hrs / 24)} ي`;
};

const CommentItem = ({
  comment,
  depth,
  onReply,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: string, displayName: string) => void;
}) => {
  const [showReplies, setShowReplies] = useState(depth < 2);

  return (
    <div className={cn("relative", depth > 0 && "mr-4 pr-3 border-r border-border/20")}>
      <div className="py-2.5 space-y-1.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-[9px] font-bold font-mono text-muted-foreground border border-border/20">
              {(comment.display_name || "M")[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-mono font-medium text-foreground">
              {comment.display_name}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {timeAgo(comment.created_at)}
            </span>
          </div>
          <button
            onClick={() => onReply(comment.id, comment.display_name)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Reply className="w-3 h-3" /> رد
          </button>
        </div>

        {/* Content */}
        <p className="text-[11px] font-mono text-foreground/80 leading-relaxed pr-1">
          {comment.content}
        </p>
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-[9px] font-mono text-accent hover:text-accent/80 mb-1"
          >
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {comment.replies.length} {comment.replies.length === 1 ? "رد" : "ردود"}
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onReply={onReply}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const CommentsSheet = ({ postId, onClose }: Props) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);

    const { data: raw } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!raw) {
      setLoading(false);
      return;
    }

    const userIds = [...new Set(raw.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const profileMap = new Map(
      profiles?.map((p) => [p.user_id, p.display_name]) || []
    );

    // Build tree
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    for (const c of raw) {
      const comment: Comment = {
        ...c,
        display_name: profileMap.get(c.user_id) || "محلل مجهول",
        replies: [],
      };
      map.set(c.id, comment);
    }

    for (const c of raw) {
      const comment = map.get(c.id)!;
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.replies.push(comment);
      } else {
        roots.push(comment);
      }
    }

    setComments(roots);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  const handleSend = async () => {
    if (!user || !postId || !newComment.trim()) return;
    setSending(true);

    const { error } = await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
      parent_id: replyTo?.id || null,
    });

    if (error) {
      toast({ title: "خطأ في إرسال التعليق", variant: "destructive" });
    } else {
      // Send notification to post author or parent comment author
      try {
        if (replyTo) {
          // Notify the parent comment author
          const { data: parentComment } = await supabase
            .from("community_comments")
            .select("user_id")
            .eq("id", replyTo.id)
            .maybeSingle();
          if (parentComment && parentComment.user_id !== user.id) {
            await supabase.from("notifications").insert({
              user_id: parentComment.user_id,
              from_user_id: user.id,
              type: "reply",
              message: `ردّ أحدهم على تعليقك: "${newComment.trim().slice(0, 50)}..."`,
              post_id: postId,
            });
          }
        } else {
          // Notify the post author
          const { data: post } = await supabase
            .from("community_posts")
            .select("user_id, pair")
            .eq("id", postId)
            .maybeSingle();
          if (post && post.user_id !== user.id) {
            await supabase.from("notifications").insert({
              user_id: post.user_id,
              from_user_id: user.id,
              type: "comment",
              message: `علّق أحدهم على تحليلك لـ ${post.pair}`,
              post_id: postId,
            });
          }
        }
      } catch {}
      setNewComment("");
      setReplyTo(null);
      fetchComments();
    }
    setSending(false);
  };

  const handleReply = (parentId: string, displayName: string) => {
    setReplyTo({ id: parentId, name: displayName });
  };

  if (!postId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute bottom-0 inset-x-0 max-h-[80vh] bg-background border-t border-border/30 rounded-t-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent" />
              <span className="text-[12px] font-mono font-bold">
                النقاشات المترابطة
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})
              </span>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Shield className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-[11px] font-mono text-muted-foreground">
                  لا توجد نقاشات بعد. كن أول من يبدأ!
                </p>
              </div>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  depth={0}
                  onReply={handleReply}
                />
              ))
            )}
          </div>

          {/* Reply Indicator */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-1.5 bg-accent/5 border-t border-accent/20 flex items-center justify-between"
              >
                <span className="text-[10px] font-mono text-accent">
                  رد على <span className="font-bold">{replyTo.name}</span>
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border/20 flex items-center gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={replyTo ? `رد على ${replyTo.name}...` : "اكتب تعليقك..."}
              className="flex-1 bg-secondary border border-border/20 rounded-xl px-3 py-2.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40"
              dir="rtl"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newComment.trim()}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                newComment.trim()
                  ? "bg-accent text-background hover:bg-accent/80"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentsSheet;
