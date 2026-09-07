import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Target, TrendingUp, Lock, CheckCircle, Crown, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { useCommunity } from "@/hooks/useCommunity";
import WarRoomPost from "@/components/community/WarRoomPost";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import CommentsSheet from "@/components/community/CommentsSheet";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1 } },
};

const challengeIcons: Record<string, typeof Shield> = {
  discipline: Shield, consistency: Target, growth: TrendingUp, risk: Lock,
};

type Tab = "feed" | "challenges" | "ranking";

const tabs: { key: Tab; label: string }[] = [
  { key: "feed", label: "النقاش" },
  { key: "challenges", label: "التحديات" },
  { key: "ranking", label: "الترتيب" },
];

const CommunityPage = () => {
  const { user } = useAuth();
  const { challenges, userChallenges, badges, leaderboard, joinChallenge } = useChallenges();
  const { posts, loading, vote, saveStrategy, createPost } = useCommunity();
  const [tab, setTab] = useState<Tab>("feed");
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const getUserChallenge = (id: string) => userChallenges.find((uc) => uc.challenge_id === id);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="nx-page"
    >
      {/* Tabs */}
      <motion.div variants={fade} className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("nx-chip flex-1", tab === t.key && "nx-chip-on")}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Feed */}
      {tab === "feed" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="nx-card text-center py-10">
              <Sparkles className="w-6 h-6 text-primary/50 mx-auto mb-3" />
              <p className="nx-body text-muted-foreground">كن أول من ينشر تحليلاً</p>
            </div>
          ) : (
            posts.slice(0, 15).map((post) => (
              <WarRoomPost
                key={post.id}
                post={post}
                onVote={vote}
                onSave={saveStrategy}
                onOpenComments={setCommentPostId}
              />
            ))
          )}
        </div>
      )}

      {/* Challenges */}
      {tab === "challenges" && (
        <div className="space-y-4">
          {challenges.map((c) => {
            const Icon = challengeIcons[c.challenge_type] || Target;
            const uc = getUserChallenge(c.id);
            const progress = uc ? Math.min((uc.progress / c.target_value) * 100, 100) : 0;

            return (
              <div key={c.id} className="nx-card space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="nx-card-title">{c.name_ar}</p>
                    <p className="nx-body text-[15px] text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                </div>

                {uc ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="nx-label">التقدم</span>
                      <span className="font-mono text-[15px] font-bold text-primary tabular-nums nx-ltr">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-secondary" />
                    {uc.status === "completed" && (
                      <p className="text-success text-[14px] font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> مكتمل
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => joinChallenge.mutate(c.id)}
                    disabled={joinChallenge.isPending}
                    className="nx-btn-secondary nx-btn-sm w-full"
                  >
                    انضم للتحدي
                  </button>
                )}
              </div>
            );
          })}

          {badges.length > 0 && (
            <div className="space-y-3">
              <h2 className="nx-section">شاراتي</h2>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((b) => (
                  <div key={b.id} className="nx-card !p-3 text-center">
                    <span className="text-2xl block mb-1.5">{b.badge_icon}</span>
                    <p className="text-[13px] font-semibold leading-tight">{b.badge_name_ar}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranking */}
      {tab === "ranking" && (
        <div className="space-y-3">
          <p className="nx-meta">التصنيف بالانضباط — وليس الأرباح</p>
          {leaderboard.length === 0 ? (
            <div className="nx-card text-center py-10">
              <Crown className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
              <p className="nx-body text-muted-foreground">لا توجد بيانات بعد</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {leaderboard.slice(0, 10).map((entry: any, i: number) => {
                const medals = ["🥇", "🥈", "🥉"];
                const isMe = entry.user_id === user?.id;
                return (
                  <div
                    key={`${entry.user_id}-${i}`}
                    className={cn(
                      "flex items-center justify-between px-4 h-[60px] border-b border-border/70 last:border-b-0",
                      isMe && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[16px] w-7 text-center font-mono font-bold">
                        {i < 3 ? medals[i] : `#${i + 1}`}
                      </span>
                      <p className="text-[16px] font-semibold">{isMe ? "أنت" : `متداول ${i + 1}`}</p>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[17px] font-bold tabular-nums nx-ltr",
                        entry.score >= 70 ? "text-success" : entry.score >= 40 ? "text-warning" : "text-destructive"
                      )}
                    >
                      {entry.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create post */}
      {tab === "feed" && (
        <motion.button
          onClick={() => setShowCreate(true)}
          aria-label="نشر تحليل"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-30 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      )}

      <CreatePostDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={createPost} />
      <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
    </motion.div>
  );
};

export default CommunityPage;
