import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Shield, Target, Award, Crown, TrendingUp,
  CheckCircle, Zap, Lock, Users, BarChart3, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const CommunityPage = () => {
  const { user } = useAuth();
  const {
    challenges, userChallenges, latestScore, tradingPlans,
    userPlan, badges, leaderboard, joinChallenge, selectPlan,
  } = useChallenges();
  const { posts, loading, vote, saveStrategy, createPost } = useCommunity();
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const isJoined = (id: string) => userChallenges.some(uc => uc.challenge_id === id);
  const getUserChallenge = (id: string) => userChallenges.find(uc => uc.challenge_id === id);

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      className="px-4 pt-3 pb-28 space-y-3 max-w-lg mx-auto"
    >
      <motion.div variants={fade}>
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-card border border-border/15 h-9 p-0.5 gap-0.5" style={{ borderRadius: '4px' }}>
            <TabsTrigger value="challenges" className="text-[8px] font-mono font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1" style={{ borderRadius: '3px' }}>
              <Trophy className="w-3 h-3" />تحديات
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-[8px] font-mono font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1" style={{ borderRadius: '3px' }}>
              <Crown className="w-3 h-3" />ترتيب
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-[8px] font-mono font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1" style={{ borderRadius: '3px' }}>
              <Award className="w-3 h-3" />شارات
            </TabsTrigger>
            <TabsTrigger value="feed" className="text-[8px] font-mono font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1" style={{ borderRadius: '3px' }}>
              <Users className="w-3 h-3" />النقاش
            </TabsTrigger>
          </TabsList>

          {/* Challenges */}
          <TabsContent value="challenges" className="mt-3 space-y-2">
            {challenges.map((c) => {
              const Icon = challengeIcons[c.challenge_type] || Target;
              const joined = isJoined(c.id);
              const uc = getUserChallenge(c.id);
              const progress = uc ? Math.min((uc.progress / c.target_value) * 100, 100) : 0;

              return (
                <div key={c.id} className="p-3 bg-card/60 border border-border/10" style={{ borderRadius: '4px' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0" style={{ borderRadius: '4px' }}>
                      <span className="text-base">{c.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono font-bold">{c.name_ar}</p>
                      <p className="text-[8px] font-mono text-muted-foreground/50 mt-0.5">{c.description}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[7px] font-mono text-muted-foreground/40 bg-secondary/30 px-1.5 py-0.5" style={{ borderRadius: '2px' }}>
                          {c.target_value} {c.metric === "days" ? "يوم" : c.metric === "trades" ? "صفقة" : "%"}
                        </span>
                        <span className="text-[7px] font-mono text-primary/70 bg-primary/8 px-1.5 py-0.5" style={{ borderRadius: '2px' }}>{c.badge_name_ar}</span>
                      </div>
                    </div>
                  </div>
                  {joined && uc && (
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-mono text-muted-foreground/40">التقدم</span>
                        <span className="text-[8px] font-mono font-bold text-primary tabular-nums">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-1 bg-secondary/30" />
                      {uc.status === "completed" && (
                        <p className="text-success text-[8px] font-mono font-bold flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> مكتمل</p>
                      )}
                    </div>
                  )}
                  {!joined && (
                    <button onClick={() => joinChallenge.mutate(c.id)} disabled={joinChallenge.isPending}
                      className="mt-2.5 w-full py-2 bg-primary/8 text-primary text-[9px] font-mono font-bold border border-primary/15 hover:bg-primary/12 transition-colors flex items-center justify-center gap-1"
                      style={{ borderRadius: '3px' }}>
                      <Zap className="w-3 h-3" /> انضم للتحدي
                    </button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="mt-3 space-y-2">
            <p className="text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.15em]">
              التصنيف بالانضباط — وليس الأرباح
            </p>
            {leaderboard.length === 0 ? (
              <div className="p-8 bg-card/30 border border-border/8 text-center" style={{ borderRadius: '4px' }}>
                <Crown className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[10px] font-mono text-muted-foreground/30">لا توجد بيانات بعد</p>
              </div>
            ) : (
              <div className="overflow-hidden bg-card/50 border border-border/10 divide-y divide-border/5" style={{ borderRadius: '4px' }}>
                {leaderboard.slice(0, 10).map((entry: any, i: number) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMe = entry.user_id === user?.id;
                  return (
                    <div key={`${entry.user_id}-${i}`} className={cn("flex items-center justify-between px-3 py-2", isMe && "bg-primary/5")}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-5 text-center font-mono font-bold">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                        <p className="text-[9px] font-mono font-bold">{isMe ? "أنت" : `متداول ${i + 1}`}</p>
                      </div>
                      <span className={cn("text-[11px] font-mono font-bold tabular-nums",
                        entry.score >= 70 ? "text-success" : entry.score >= 40 ? "text-warning" : "text-destructive"
                      )}>{entry.score}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-3">
            {badges.length === 0 ? (
              <div className="p-8 bg-card/30 border border-border/8 text-center" style={{ borderRadius: '4px' }}>
                <Award className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[10px] font-mono text-muted-foreground/30">أكمل التحديات لكسب شارات</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {badges.map((b) => (
                  <div key={b.id} className="p-3 bg-card/50 border border-primary/8 text-center" style={{ borderRadius: '4px' }}>
                    <span className="text-xl block mb-1">{b.badge_icon}</span>
                    <p className="text-[8px] font-mono font-bold">{b.badge_name_ar}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Feed */}
          <TabsContent value="feed" className="mt-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 bg-card/30 border border-border/8 text-center" style={{ borderRadius: '4px' }}>
                <Sparkles className="w-5 h-5 text-primary/30 mx-auto mb-2" />
                <p className="text-[10px] font-mono font-bold text-muted-foreground/40">كن أول من ينشر تحليلاً</p>
              </div>
            ) : (
              posts.slice(0, 10).map(post => (
                <WarRoomPost key={post.id} post={post} onVote={vote} onSave={saveStrategy} onOpenComments={setCommentPostId} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Floating Create */}
      <motion.button onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-30 w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/30"
        style={{ borderRadius: '4px' }}
        whileTap={{ scale: 0.95 }}>
        <span className="text-lg font-bold">+</span>
      </motion.button>

      <CreatePostDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={createPost} />
      <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
    </motion.div>
  );
};

export default CommunityPage;
