import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, Plus, Swords, Trophy, BarChart3,
  Sparkles, Flame, TrendingUp, TrendingDown,
  Search, Radio, BookOpen, Users, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/hooks/useCommunity";
import WarRoomPost from "@/components/community/WarRoomPost";
import HallOfFame from "@/components/community/HallOfFame";
import CommunitySuccessRate from "@/components/community/CommunitySuccessRate";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import CommentsSheet from "@/components/community/CommentsSheet";
import { useLivePrices } from "@/hooks/useLivePrices";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type Tab = "trending" | "important" | "hall-of-fame" | "stats";

const trendingAlert = {
  text: "الخوف الشديد يسحب البيتكوين إلى الأسفل — إغلاق أسبوعي تحت 60K أم فوق 70K؟",
  icon: "₿",
};

const Community = () => {
  const { posts, loading, vote, saveStrategy, createPost } = useCommunity();
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const assets = useLivePrices();

  // Trending tickers from live prices
  const trendingTickers = assets
    .filter(a => a.category === "كريبتو")
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 8)
    .map(a => ({
      symbol: a.pair.split("/")[0],
      change: a.change,
      positive: a.change >= 0,
    }));

  const tabs = [
    { id: "trending" as Tab, label: "الأكثر رواجاً", icon: Flame },
    { id: "important" as Tab, label: "الأهم", icon: Star },
    { id: "hall-of-fame" as Tab, label: "قاعة المجد", icon: Trophy },
    { id: "stats" as Tab, label: "الإحصائيات", icon: BarChart3 },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="px-4 pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">المجتمع</h1>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl glass flex items-center justify-center">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">
              <span className="font-bold text-foreground">3,847</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Trending Alert Banner */}
      <motion.div variants={fadeUp} className="px-4 mb-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-l from-destructive/20 via-destructive/10 to-destructive/5 border border-destructive/20 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center shrink-0">
            <span className="text-lg">{trendingAlert.icon}</span>
          </div>
          <p className="text-[11px] font-mono text-foreground/90 leading-relaxed flex-1">
            {trendingAlert.text}
          </p>
        </div>
      </motion.div>

      {/* Tabs - Horizontal scroll */}
      <motion.div variants={fadeUp} className="px-4 mb-3">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-border/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-mono font-medium whitespace-nowrap transition-all relative",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="community-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Trending Tickers Strip */}
      <motion.div variants={fadeUp} className="mb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-1">
          {trendingTickers.map((ticker, i) => (
            <motion.div
              key={ticker.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 min-w-[100px]",
                ticker.positive
                  ? "bg-success/5 border-success/15"
                  : "bg-destructive/5 border-destructive/15"
              )}
            >
              <span className="text-[11px] font-mono font-bold">{ticker.symbol}</span>
              <span className={cn(
                "text-[10px] font-mono font-bold flex items-center gap-0.5",
                ticker.positive ? "text-success" : "text-destructive"
              )}>
                {ticker.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(ticker.change).toFixed(2)}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {(activeTab === "trending" || activeTab === "important") && (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 space-y-3"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-primary mx-auto" />
                <p className="text-[13px] font-mono font-bold">المجتمع بانتظار أول تحليل</p>
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
          <motion.div
            key="fame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <HallOfFame />
          </motion.div>
        )}

        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <CommunitySuccessRate />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Create Button */}
      <motion.button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 left-5 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-gold"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

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
