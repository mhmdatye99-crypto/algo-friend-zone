import { useState } from "react";
import { motion } from "framer-motion";
import {
  Network, Plus, Swords, Globe, Trophy, BarChart3,
  MessageCircle, Filter, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/hooks/useCommunity";
import GlobalPulseMap from "@/components/community/GlobalPulseMap";
import WarRoomPost from "@/components/community/WarRoomPost";
import HallOfFame from "@/components/community/HallOfFame";
import CommunitySuccessRate from "@/components/community/CommunitySuccessRate";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import CommentsSheet from "@/components/community/CommentsSheet";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Tab = "war-room" | "hall-of-fame" | "stats";

const Community = () => {
  const { posts, loading, vote, saveStrategy, createPost } = useCommunity();
  const [activeTab, setActiveTab] = useState<Tab>("war-room");
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const tabs = [
    { id: "war-room" as Tab, label: "غرفة العمليات", icon: Swords },
    { id: "hall-of-fame" as Tab, label: "قاعة المجد", icon: Trophy },
    { id: "stats" as Tab, label: "الإحصائيات", icon: BarChart3 },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-10 pb-28 space-y-5 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
            مجتمع الاستخبارات
          </p>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-accent" />
            The Intelligence Community
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">
              <span className="font-bold text-foreground">3,847</span> محلل
            </span>
          </span>
        </div>
      </motion.div>

      {/* Global Pulse Map */}
      <motion.div variants={fadeUp}>
        <GlobalPulseMap />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-mono font-medium transition-all border",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border-primary/30 glow-gold"
                  : "bg-secondary text-muted-foreground border-border/10 hover:bg-secondary/80"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      {activeTab === "war-room" && (
        <motion.div variants={fadeUp} className="space-y-3">
          {/* Create Post FAB */}
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-[12px] font-mono font-bold text-primary hover:from-primary/30 hover:to-accent/30 transition-all glow-gold"
          >
            <Plus className="w-4 h-4" />
            نشر تحليل في غرفة العمليات
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
              <p className="text-[13px] font-mono font-bold">غرفة العمليات فارغة</p>
              <p className="text-[11px] font-mono text-muted-foreground">كن أول من ينشر تحليلاً ويبدأ النقاش!</p>
            </div>
          ) : (
            posts.map(post => (
              <WarRoomPost
                key={post.id}
                post={post}
                onVote={vote}
                onSave={saveStrategy}
                onOpenComments={setCommentPostId}
              />
            ))
          )}
        </motion.div>
      )}

      {activeTab === "hall-of-fame" && (
        <motion.div variants={fadeUp}>
          <HallOfFame />
        </motion.div>
      )}

      {activeTab === "stats" && (
        <motion.div variants={fadeUp}>
          <CommunitySuccessRate />
        </motion.div>
      )}

      <CreatePostDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createPost}
      />

      <CommentsSheet
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
      />
    </motion.div>
  );
};

export default Community;
