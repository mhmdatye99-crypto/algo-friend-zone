import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
  const score = latestScore?.score ?? 50;

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-3 pb-28 space-y-4 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">التحديات والتصنيف</p>
        <h1 className="text-lg font-bold"><span className="text-gradient-gold">Community</span> Hub</h1>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/30 border border-border/20 rounded-xl h-10 p-1">
            <TabsTrigger value="challenges" className="text-[9px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Trophy className="w-3 h-3 mr-1" />تحديات
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-[9px] font-mono data-[state=active]:bg-success/10 data-[state=active]:text-success rounded-lg">
              <Crown className="w-3 h-3 mr-1" />ترتيب
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-[9px] font-mono data-[state=active]:bg-warning/10 data-[state=active]:text-warning rounded-lg">
              <Award className="w-3 h-3 mr-1" />شارات
            </TabsTrigger>
            <TabsTrigger value="feed" className="text-[9px] font-mono data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-lg">
              <Users className="w-3 h-3 mr-1" />النقاش
            </TabsTrigger>
          </TabsList>

          {/* Challenges */}
          <TabsContent value="challenges" className="mt-4 space-y-3">
            {challenges.map((c) => {
              const Icon = challengeIcons[c.challenge_type] || Target;
              const joined = isJoined(c.id);
              const uc = getUserChallenge(c.id);
              const progress = uc ? Math.min((uc.progress / c.target_value) * 100, 100) : 0;

              return (
                <div key={c.id} className="rounded-xl p-4 bg-card/60 border border-border/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">{c.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-mono font-bold">{c.name_ar}</p>
                      <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{c.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[8px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                          {c.target_value} {c.metric === "days" ? "يوم" : c.metric === "trades" ? "صفقة" : "%"}
                        </span>
                        <span className="text-[8px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">{c.badge_name_ar}</span>
                      </div>
                    </div>
                  </div>
                  {joined && uc && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-muted-foreground">التقدم</span>
                        <span className="text-[9px] font-mono font-bold text-primary">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-secondary/50" />
                      {uc.status === "completed" && (
                        <p className="text-success text-[9px] font-mono font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مكتمل!</p>
                      )}
                    </div>
                  )}
                  {!joined && (
                    <button onClick={() => joinChallenge.mutate(c.id)} disabled={joinChallenge.isPending}
                      className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-mono font-bold border border-primary/20 hover:bg-primary/15 transition-colors flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3" /> انضم
                    </button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="mt-4 space-y-2">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Users className="w-3 h-3" /> التصنيف بالانضباط — وليس الأرباح
            </p>
            {leaderboard.length === 0 ? (
              <div className="rounded-xl p-8 bg-card/40 border border-border/10 text-center">
                <Crown className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-[11px] font-mono text-muted-foreground">لا توجد بيانات بعد</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden bg-card/60 border border-border/10 divide-y divide-border/10">
                {leaderboard.slice(0, 10).map((entry: any, i: number) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMe = entry.user_id === user?.id;
                  return (
                    <div key={`${entry.user_id}-${i}`} className={cn("flex items-center justify-between px-3 py-2.5", isMe && "bg-primary/5")}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-6 text-center font-mono font-bold">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                        <p className="text-[10px] font-mono font-bold">{isMe ? "أنت" : `متداول ${i + 1}`}</p>
                      </div>
                      <span className={cn("text-[12px] font-mono font-bold",
                        entry.score >= 70 ? "text-success" : entry.score >= 40 ? "text-warning" : "text-destructive"
                      )}>{entry.score}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-4">
            {badges.length === 0 ? (
              <div className="rounded-xl p-8 bg-card/40 border border-border/10 text-center">
                <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-[11px] font-mono text-muted-foreground">أكمل التحديات لكسب شارات</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {badges.map((b) => (
                  <div key={b.id} className="rounded-xl p-3 bg-card/60 border border-primary/10 text-center">
                    <span className="text-2xl block mb-1">{b.badge_icon}</span>
                    <p className="text-[9px] font-mono font-bold">{b.badge_name_ar}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Community Feed */}
          <TabsContent value="feed" className="mt-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl p-8 bg-card/40 border border-border/10 text-center">
                <Sparkles className="w-7 h-7 text-primary mx-auto mb-2 opacity-50" />
                <p className="text-[11px] font-mono font-bold">كن أول من ينشر تحليلاً</p>
              </div>
            ) : (
              posts.slice(0, 10).map(post => (
                <WarRoomPost key={post.id} post={post} onVote={vote} onSave={saveStrategy} onOpenComments={setCommentPostId} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Floating Create Button */}
      <motion.button onClick={() => setShowCreate(true)}
        className="fixed bottom-28 right-5 z-30 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        whileTap={{ scale: 0.9 }}>
        <span className="text-xl font-bold">+</span>
      </motion.button>

      <CreatePostDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={createPost} />
      <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
    </motion.div>
  );
};

export default CommunityPage;
