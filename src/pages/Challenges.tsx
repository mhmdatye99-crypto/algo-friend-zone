import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Target, Trophy, Flame, Award, Crown, TrendingUp,
  ChevronLeft, CheckCircle, Clock, Zap, Lock, BarChart3, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const challengeIcons: Record<string, typeof Shield> = {
  discipline: Shield,
  consistency: Target,
  growth: TrendingUp,
  risk: Lock,
};

const Challenges = () => {
  const { user } = useAuth();
  const {
    challenges, userChallenges, latestScore, tradingPlans,
    userPlan, badges, leaderboard, joinChallenge, selectPlan,
  } = useChallenges();

  const isJoined = (id: string) => userChallenges.some(uc => uc.challenge_id === id);
  const getUserChallenge = (id: string) => userChallenges.find(uc => uc.challenge_id === id);

  const score = latestScore?.score ?? 50;
  const scoreColor = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="px-5 pt-4 pb-28 space-y-5 max-w-lg mx-auto"
    >
      {/* Discipline Score Hero */}
      <motion.div
        variants={fadeUp}
        className="rounded-[14px] p-5 text-center"
        style={{
          background: "linear-gradient(135deg, hsla(43, 100%, 50%, 0.08) 0%, hsla(190, 100%, 50%, 0.04) 100%)",
          border: "1px solid hsla(43, 100%, 50%, 0.12)",
        }}
      >
        <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">درجة الانضباط</p>
        <p className={cn("text-4xl font-mono font-bold", scoreColor)}>{score}</p>
        <p className="text-[10px] font-mono text-muted-foreground mt-1">من 100</p>

        {latestScore && (
          <div className="grid grid-cols-5 gap-1.5 mt-4">
            {[
              { label: "SL", value: latestScore.sl_respect },
              { label: "مخاطرة", value: latestScore.risk_adherence },
              { label: "إفراط", value: latestScore.no_overtrading },
              { label: "خطة", value: latestScore.plan_following },
              { label: "ثبات", value: latestScore.consistency },
            ].map((m) => (
              <div key={m.label} className="bg-secondary/40 rounded-lg p-1.5 text-center">
                <p className="text-[8px] font-mono text-muted-foreground">{m.label}</p>
                <p className={cn("text-[11px] font-mono font-bold",
                  m.value >= 70 ? "text-success" : m.value >= 40 ? "text-warning" : "text-destructive"
                )}>{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/30 border border-border/20 rounded-xl h-10 p-1">
            <TabsTrigger value="challenges" className="text-[9px] font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Trophy className="w-3 h-3 mr-1" />التحديات
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-[9px] font-mono data-[state=active]:bg-accent/10 data-[state=active]:text-accent rounded-lg">
              <Target className="w-3 h-3 mr-1" />الخطط
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-[9px] font-mono data-[state=active]:bg-warning/10 data-[state=active]:text-warning rounded-lg">
              <Award className="w-3 h-3 mr-1" />الشارات
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-[9px] font-mono data-[state=active]:bg-success/10 data-[state=active]:text-success rounded-lg">
              <Crown className="w-3 h-3 mr-1" />المتصدرون
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="mt-4 space-y-3">
            {challenges.map((c) => {
              const Icon = challengeIcons[c.challenge_type] || Target;
              const joined = isJoined(c.id);
              const uc = getUserChallenge(c.id);
              const progress = uc ? Math.min((uc.progress / c.target_value) * 100, 100) : 0;

              return (
                <div
                  key={c.id}
                  className="glass rounded-[12px] p-4 border border-border/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">{c.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-mono font-bold">{c.name_ar}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{c.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                          {c.target_value} {c.metric === "days" ? "يوم" : c.metric === "trades" ? "صفقة" : "%"}
                        </span>
                        <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {c.badge_name_ar}
                        </span>
                      </div>
                    </div>
                  </div>

                  {joined && uc && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-muted-foreground">التقدم</span>
                        <span className="text-[10px] font-mono font-bold text-primary">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-secondary/50" />
                      {uc.status === "completed" && (
                        <div className="flex items-center gap-1 text-success text-[10px] font-mono font-bold mt-1">
                          <CheckCircle className="w-3 h-3" /> مكتمل!
                        </div>
                      )}
                    </div>
                  )}

                  {!joined && (
                    <button
                      onClick={() => joinChallenge.mutate(c.id)}
                      disabled={joinChallenge.isPending}
                      className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-mono font-bold border border-primary/20 hover:bg-primary/15 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" /> انضم للتحدي
                    </button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* Trading Plans Tab */}
          <TabsContent value="plans" className="mt-4 space-y-3">
            {tradingPlans.map((plan) => {
              const isSelected = userPlan?.plan_id === plan.id;
              const typeColors: Record<string, string> = {
                conservative: "border-success/20 bg-success/5",
                moderate: "border-warning/20 bg-warning/5",
                advanced: "border-destructive/20 bg-destructive/5",
              };

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "glass rounded-[12px] p-4 border transition-all",
                    isSelected ? "border-primary/40 bg-primary/5" : typeColors[plan.plan_type] || "border-border/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-mono font-bold">{plan.name_ar}</p>
                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> مختارة
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-3">{plan.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-secondary/40 rounded-lg p-2 text-center">
                      <p className="text-[8px] font-mono text-muted-foreground">مخاطرة/صفقة</p>
                      <p className="text-[11px] font-mono font-bold">{plan.risk_per_trade}%</p>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-2 text-center">
                      <p className="text-[8px] font-mono text-muted-foreground">صفقات/يوم</p>
                      <p className="text-[11px] font-mono font-bold">{plan.max_daily_trades}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-2 text-center">
                      <p className="text-[8px] font-mono text-muted-foreground">R:R أدنى</p>
                      <p className="text-[11px] font-mono font-bold">1:{plan.min_rr_ratio}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-2 text-center">
                      <p className="text-[8px] font-mono text-muted-foreground">خسارة يومية</p>
                      <p className="text-[11px] font-mono font-bold text-destructive">{plan.max_daily_loss_percent}%</p>
                    </div>
                  </div>
                  {!isSelected && (
                    <button
                      onClick={() => selectPlan.mutate(plan.id)}
                      disabled={selectPlan.isPending}
                      className="w-full py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-mono font-bold border border-primary/20 hover:bg-primary/15 transition-colors"
                    >
                      اختر هذه الخطة
                    </button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-4">
            {badges.length === 0 ? (
              <div className="glass rounded-[14px] p-8 text-center">
                <Award className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-mono">لا توجد شارات بعد</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">أكمل التحديات لكسب شارات!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {badges.map((b) => (
                  <div key={b.id} className="glass rounded-[12px] p-3 text-center border border-primary/10">
                    <span className="text-2xl block mb-1">{b.badge_icon}</span>
                    <p className="text-[10px] font-mono font-bold">{b.badge_name_ar}</p>
                    <p className="text-[8px] font-mono text-muted-foreground mt-0.5">
                      {new Date(b.earned_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-4 space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> أفضل المنضبطين هذا الأسبوع
            </p>
            {leaderboard.length === 0 ? (
              <div className="glass rounded-[14px] p-8 text-center">
                <Crown className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-mono">لا توجد بيانات بعد</p>
              </div>
            ) : (
              <div className="glass rounded-[12px] divide-y divide-border/10">
                {leaderboard.slice(0, 10).map((entry: any, i: number) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMe = entry.user_id === user?.id;
                  return (
                    <div
                      key={`${entry.user_id}-${i}`}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5",
                        isMe && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm w-6 text-center font-mono font-bold">
                          {i < 3 ? medals[i] : `#${i + 1}`}
                        </span>
                        <div>
                          <p className="text-[11px] font-mono font-bold">
                            {isMe ? "أنت" : `متداول ${i + 1}`}
                          </p>
                          <p className="text-[8px] font-mono text-muted-foreground">{entry.score_date}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[13px] font-mono font-bold",
                        entry.score >= 70 ? "text-success" : entry.score >= 40 ? "text-warning" : "text-destructive"
                      )}>
                        {entry.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="glass rounded-[12px] p-3 border border-border/10">
              <p className="text-[9px] font-mono text-muted-foreground text-center">
                ⚠️ التصنيف يعتمد على الانضباط والثبات — وليس الأرباح. نحن نكافئ المتداولين المسؤولين.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Challenges;
