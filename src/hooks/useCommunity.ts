import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const sendNotification = async (userId: string, fromUserId: string, type: string, message: string, postId: string) => {
  if (userId === fromUserId) return; // Don't notify yourself
  await supabase.from("notifications").insert({
    user_id: userId,
    from_user_id: fromUserId,
    type,
    message,
    post_id: postId,
  });
};

export interface CommunityPost {
  id: string;
  user_id: string;
  pair: string;
  prediction: "bullish" | "bearish";
  ai_confidence: number;
  analysis_summary: string | null;
  timeframe: string;
  created_at: string;
  image_url: string | null;
  display_name?: string;
  bullish_count: number;
  bearish_count: number;
  user_vote?: "bullish" | "bearish" | null;
  comment_count: number;
  is_saved: boolean;
  outcome: "pending" | "correct" | "incorrect";
  price_at_post: number | null;
  outcome_price: number | null;
  outcome_checked_at: string | null;
}

export function useCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: rawPosts } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!rawPosts) { setLoading(false); return; }

    const userIds = [...new Set(rawPosts.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

    const postIds = rawPosts.map(p => p.id);

    const [{ data: votes }, { data: comments }, { data: saved }] = await Promise.all([
      supabase.from("community_votes").select("post_id, vote, user_id").in("post_id", postIds),
      supabase.from("community_comments").select("post_id").in("post_id", postIds),
      supabase.from("saved_strategies").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);

    const savedSet = new Set(saved?.map(s => s.post_id) || []);

    const enriched: CommunityPost[] = rawPosts.map(p => {
      const postVotes = votes?.filter(v => v.post_id === p.id) || [];
      const userVote = postVotes.find(v => v.user_id === user.id);
      return {
        ...p,
        prediction: p.prediction as "bullish" | "bearish",
        outcome: (p.outcome || "pending") as "pending" | "correct" | "incorrect",
        price_at_post: p.price_at_post ? Number(p.price_at_post) : null,
        outcome_price: p.outcome_price ? Number(p.outcome_price) : null,
        outcome_checked_at: p.outcome_checked_at || null,
        display_name: profileMap.get(p.user_id) || "محلل مجهول",
        bullish_count: postVotes.filter(v => v.vote === "bullish").length,
        bearish_count: postVotes.filter(v => v.vote === "bearish").length,
        user_vote: (userVote?.vote as "bullish" | "bearish") || null,
        comment_count: comments?.filter(c => c.post_id === p.id).length || 0,
        is_saved: savedSet.has(p.id),
      };
    });

    setPosts(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const vote = async (postId: string, voteType: "bullish" | "bearish") => {
    if (!user) return;
    const existing = posts.find(p => p.id === postId);
    if (existing?.user_vote === voteType) {
      await supabase.from("community_votes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("community_votes").upsert(
        { post_id: postId, user_id: user.id, vote: voteType },
        { onConflict: "post_id,user_id" }
      );
      // Award +1 reputation + send notification
      if (existing && existing.user_id !== user.id && !existing.user_vote) {
        supabase.from("profiles").select("reputation_points").eq("user_id", existing.user_id).single()
          .then(({ data }) => {
            if (data) supabase.from("profiles").update({ reputation_points: (data.reputation_points || 0) + 1 }).eq("user_id", existing.user_id).then(() => {});
          });
        sendNotification(
          existing.user_id, user.id, "vote",
          `صوّت أحدهم ${voteType === "bullish" ? "صعودي 🟢" : "هبوطي 🔴"} على تحليلك لـ ${existing.pair}`,
          postId
        );
      }
    }
    fetchPosts();
  };

  const saveStrategy = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (post?.is_saved) {
      await supabase.from("saved_strategies").delete().eq("post_id", postId).eq("user_id", user.id);
      toast({ title: "تمت الإزالة من قائمة المراقبة" });
    } else {
      await supabase.from("saved_strategies").insert({ post_id: postId, user_id: user.id });
      toast({ title: "✅ تم حفظ الاستراتيجية في قائمة المراقبة" });
    }
    fetchPosts();
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("community-images").upload(path, file);
    if (error) { toast({ title: "فشل رفع الصورة", variant: "destructive" }); return null; }
    const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const createPost = async (data: { pair: string; prediction: "bullish" | "bearish"; ai_confidence: number; analysis_summary: string; timeframe: string; image?: File | null; price_at_post?: number }) => {
    if (!user) return;
    let image_url: string | null = null;
    if (data.image) {
      image_url = await uploadImage(data.image);
    }
    const { image, ...rest } = data;
    await supabase.from("community_posts").insert({ ...rest, user_id: user.id, image_url, price_at_post: data.price_at_post || null });
    
    // Award reputation points for posting
    await supabase
      .from("profiles")
      .update({ reputation_points: (await supabase.from("profiles").select("reputation_points").eq("user_id", user.id).single()).data?.reputation_points! + 5 })
      .eq("user_id", user.id);
    
    toast({ title: "✅ تم نشر التحليل في غرفة العمليات (+5 سمعة)" });
    fetchPosts();
  };

  return { posts, loading, vote, saveStrategy, createPost, refetch: fetchPosts };
}
