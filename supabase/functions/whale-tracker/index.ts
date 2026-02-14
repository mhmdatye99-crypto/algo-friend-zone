import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.lovable.dev/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a crypto whale transaction simulator. Generate exactly 8 realistic large whale transactions that could be happening right now on major exchanges. Each transaction should reflect current market conditions.

Return ONLY valid JSON array with this exact structure (no markdown, no explanation):
[{
  "pair": "BTC",
  "icon": "₿",
  "type": "buy" or "sell",
  "amount": "formatted like 1.2K or 5.3M",
  "usdValue": "formatted like $2.5M or $1.2B",
  "time": "1-45 (minutes ago)",
  "exchange": "Binance/Coinbase/Kraken/OKX/Bybit",
  "wallet": "short wallet like 0x7a3...f2e1"
}]

Rules:
- Use realistic amounts based on current crypto prices (BTC ~98K, ETH ~3.4K, SOL ~195, XRP ~0.62, BNB ~680, DOGE ~0.35, ADA ~0.85, AVAX ~38)
- Mix of buy/sell with slight buy bias (55-60%)
- USD values should be $500K minimum for whale status
- Vary exchanges realistically
- Include 4-5 different coins, not just BTC
- Make amounts feel organic, not round numbers`
          },
          {
            role: "user",
            content: "Generate 8 whale transactions happening in the last 45 minutes."
          }
        ],
        temperature: 0.9,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API failed [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response, handling potential markdown wrapping
    let transactions;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      transactions = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      transactions = [];
    }

    return new Response(JSON.stringify({ transactions, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Whale tracker error:", error);
    return new Response(JSON.stringify({ error: error.message, transactions: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
