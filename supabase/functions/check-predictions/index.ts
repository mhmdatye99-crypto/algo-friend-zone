import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Timeframe to hours mapping
const TIMEFRAME_HOURS: Record<string, number> = {
  "1M": 1 / 60, "5M": 5 / 60, "15M": 0.25, "30M": 0.5,
  "1H": 1, "4H": 4, "1D": 24, "1W": 168,
};

// Fetch current price from Binance
async function getBinancePrice(symbol: string): Promise<number | null> {
  try {
    const cleanSymbol = symbol.replace("/", "").toUpperCase();
    const resp = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

// For non-crypto, try CoinGecko-style mapping or return null
async function getPrice(pair: string): Promise<number | null> {
  // Try Binance first (works for crypto)
  const binancePrice = await getBinancePrice(pair);
  if (binancePrice) return binancePrice;

  // For forex/commodities, we can't get reliable free API prices
  // Return null to skip these for now
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pending predictions whose timeframe has elapsed
    const { data: pendingPosts, error } = await supabase
      .from("community_posts")
      .select("id, pair, prediction, price_at_post, timeframe, created_at")
      .eq("outcome", "pending")
      .not("price_at_post", "is", null);

    if (error) {
      console.error("Error fetching posts:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      return new Response(JSON.stringify({ checked: 0, message: "No pending predictions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    let checked = 0;
    let correct = 0;
    let incorrect = 0;

    for (const post of pendingPosts) {
      const timeframe = post.timeframe || "4H";
      const hours = TIMEFRAME_HOURS[timeframe] || 4;
      const createdAt = new Date(post.created_at).getTime();
      const elapsedHours = (now - createdAt) / (1000 * 60 * 60);

      // Only check if timeframe has elapsed
      if (elapsedHours < hours) continue;

      const currentPrice = await getPrice(post.pair);
      if (!currentPrice || !post.price_at_post) continue;

      const priceAtPost = Number(post.price_at_post);
      const priceChange = ((currentPrice - priceAtPost) / priceAtPost) * 100;

      // Determine outcome: bullish prediction correct if price went up, bearish if down
      // Use a small threshold (0.1%) to avoid noise
      let outcome: string;
      if (Math.abs(priceChange) < 0.05) {
        // Too close to call — skip for now, check later
        continue;
      } else if (post.prediction === "bullish" && priceChange > 0) {
        outcome = "correct";
        correct++;
      } else if (post.prediction === "bearish" && priceChange < 0) {
        outcome = "correct";
        correct++;
      } else {
        outcome = "incorrect";
        incorrect++;
      }

      await supabase
        .from("community_posts")
        .update({
          outcome,
          outcome_price: currentPrice,
          outcome_checked_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      // Award reputation for correct predictions
      if (outcome === "correct") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("reputation_points")
          .eq("user_id", (await supabase.from("community_posts").select("user_id").eq("id", post.id).single()).data?.user_id)
          .single();

        if (profile) {
          const postData = (await supabase.from("community_posts").select("user_id").eq("id", post.id).single()).data;
          if (postData) {
            await supabase
              .from("profiles")
              .update({ reputation_points: profile.reputation_points + 10 })
              .eq("user_id", postData.user_id);

            // Notify user of correct prediction
            await supabase.from("notifications").insert({
              user_id: postData.user_id,
              type: "vote",
              message: `🎯 توقعك لـ ${post.pair} كان صحيحاً! +10 سمعة`,
              post_id: post.id,
            });
          }
        }
      }

      checked++;
    }

    return new Response(
      JSON.stringify({ checked, correct, incorrect, total_pending: pendingPosts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Prediction checker error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
