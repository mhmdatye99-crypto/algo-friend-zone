import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Crosshair, Trophy, BarChart3,
  TrendingUp, TrendingDown, Radio, X, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/hooks/useCommunity";
import WarRoomPost from "@/components/community/WarRoomPost";
import HallOfFame from "@/components/community/HallOfFame";
import CommunitySuccessRate from "@/components/community/CommunitySuccessRate";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import CommentsSheet from "@/components/community/CommentsSheet";
import OracleInsight from "@/components/community/OracleInsight";
import { useLivePrices } from "@/hooks/useLivePrices";

const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

type Tab = "feed" | "signals" | "leaderboard" | "stats";
type AssetFilter = "all" | "crypto" | "forex" | "commodities";

const assetFilters: { id: AssetFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "crypto", label: "كريبتو" },
  { id: "forex", label: "فوركس" },
  { id: "commodities", label: "سلع" },
];

const Community = () => {
  const { posts, loading, vote, saveStrategy, createPost } = useCommunity();
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const assets = useLivePrices();

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (assetFilter !== "all") {
      const cryptoPairs = ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "DOT", "DOGE", "AVAX", "LINK"];
      const forexPairs = ["EUR", "GBP", "USD", "JPY", "CHF", "AUD", "CAD", "NZD"];
      filtered = filtered.filter(p => {
        const pair = p.pair.toUpperCase();
        if (assetFilter === "crypto") return cryptoPairs.some(c => pair.includes(c));
        if (assetFilter === "forex") return forexPairs.some(f => pair.includes(f));
        if (assetFilter === "commodities") return pair.includes("GOLD") || pair.includes("XAU") || pair.includes("OIL") || pair.includes("SILVER");
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.pair.toLowerCase().includes(q) || p.display_name?.toLowerCase().includes(q) || p.analysis_summary?.toLowerCase().includes(q)
      );
    }
    if (activeTab === "signals") {
      filtered = [...filtered].sort((a, b) => b.ai_confidence - a.ai_confidence);
    }
    return filtered;
  }, [posts, assetFilter, searchQuery, activeTab]);

  const trendingTickers = assets
    .filter(a => a.category === "كريبتو")
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 6)
    .map(a => ({ symbol: a.pair.split("/")[0], change: a.change, positive: a.change >= 0 }));

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "feed", label: "البث المباشر", icon: Radio },
    { id: "signals", label: "جودة التنفيذ", icon: Crosshair },
    { id: "leaderboard", label: "المتصدرون", icon: Trophy },
    { id: "stats", label: "الإحصائيات", icon: BarChart3 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="pb-28 max-w-lg mx-auto">
      {/* Header — Professionalized */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold font-display tracking-wide">غرفة العمليات</h1>
            <p className="text-[10px] font-mono text-muted-foreground">مركز تقييم جودة التنفيذ</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[10px] font-mono text-muted-foreground">
              <span className="font-bold text-foreground">{posts.length}</span> تحليل
            </span>
          </div>
        </div>

        <div className={cn("relative rounded-xl transition-all duration-200", searchFocused ? "ring-1 ring-accent/30" : "")}>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-border/10 bg-card/50">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="ابحث عن أصل أو محلل..."
              className="flex-1 bg-transparent text-[12px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              dir="rtl"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-0.5">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Asset Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="px-4 mb-2">
        <div className="flex gap-1.5">
          {assetFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setAssetFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all border",
                assetFilter === f.id
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-secondary/40 text-muted-foreground border-border/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Live Tickers */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 py-1">
          {trendingTickers.map((ticker) => (
            <div key={ticker.symbol} className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0",
              ticker.positive ? "border-success/10 text-success" : "border-destructive/10 text-destructive"
            )}>
              <span className="text-[10px] font-mono font-bold text-foreground">{ticker.symbol}</span>
              <span className="text-[9px] font-mono font-bold flex items-center gap-0.5">
                {ticker.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {Math.abs(ticker.change).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs — Execution Quality Focus */}
      <div className="px-4 mb-3">
        <div className="flex gap-0 border-b border-border/15">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-mono font-medium whitespace-nowrap transition-all relative",
                activeTab === tab.id ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="community-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Quality Note */}
      {activeTab === "signals" && (
        <div className="px-4 mb-3">
          <div className="rounded-lg px-3 py-2 border border-accent/10 bg-accent/3 flex items-start gap-2">
            <Shield className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <p className="text-[8px] font-mono text-muted-foreground/80">
              التصنيف يعتمد على جودة التنفيذ والالتزام بإدارة المخاطر — وليس حجم الأرباح
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {(activeTab === "feed" || activeTab === "signals") && (
          <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="px-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-xl p-10 text-center space-y-3 border border-border/10 bg-card/50">
                <Crosshair className="w-7 h-7 text-accent mx-auto opacity-60" />
                <p className="text-[12px] font-mono font-bold">
                  {searchQuery ? "لا توجد نتائج" : "المجتمع بانتظار أول تحليل"}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {searchQuery ? "جرّب كلمات بحث مختلفة" : "كن أول من ينشر تحليلاً"}
                </p>
              </div>
            ) : (
              <>
                {activeTab === "feed" && <OracleInsight posts={filteredPosts} />}
                {filteredPosts.map(post => (
                  <WarRoomPost key={post.id} post={post} onVote={vote} onSave={saveStrategy} onOpenComments={setCommentPostId} />
                ))}
              </>
            )}
          </motion.div>
        )}
        {activeTab === "leaderboard" && (
          <motion.div key="fame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="px-4">
            <HallOfFame />
          </motion.div>
        )}
        {activeTab === "stats" && (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="px-4">
            <CommunitySuccessRate />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Button */}
      <motion.button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-28 right-5 z-30 w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg border border-accent/30"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-2xl font-bold">+</span>
      </motion.button>

      <CreatePostDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={createPost} />
      <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
    </motion.div>
  );
};

export default Community;
