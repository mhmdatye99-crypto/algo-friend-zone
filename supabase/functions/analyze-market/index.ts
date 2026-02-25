import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `ROLE: SENIOR QUANTITATIVE HEDGE FUND ALGORITHM
OBJECTIVE: GENERATE HIGH-PRECISION TRADING SIGNALS WITH NEAR-ZERO DRAWDOWN.
MODE: "SNIPER" (Quality over Quantity).

1. DATA INGESTION & VALIDATION PROTOCOL:
- YOU MUST ANALYZE REAL-TIME MARKET STRUCTURE.
- IF data is ambiguous, OUTPUT: "NO_TRADE".

2. THE "NEXUS CASCADING" STRATEGY (Multi-Timeframe):
- GENERAL (4H): Identify dominant trend. NEVER trade against it.
- SCOUT (1H): Wait for Liquidity Sweep.
- SNIPER (1m): Wait for Change of Character (CHoCH) and Retest.

3. THE "ZERO-LOSS" RISK ENGINE:
- STOP LOSS: Strictly behind invalidation structure.
- RISK REWARD: MINIMUM 1:3.

4. OUTPUT FORMAT (JSON ONLY — no extra text):
{
  "TYPE": "SNIPER_SIGNAL" or "NO_TRADE",
  "PAIR": "String",
  "ACTION": "BUY" or "SELL",
  "ENTRY": Number,
  "SL": Number,
  "TP1": Number,
  "TP2": Number,
  "CONFIDENCE": Number (0-100),
  "REASON": "String — concise explanation of why this trade qualifies"
}

Use realistic prices based on the pair and current market context provided. Always respond with valid JSON only.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pair, timeframe, price, rsi, macd, trend, volume } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Analyze this market data and generate a SNIPER signal if conditions align, or NO_TRADE if they don't:

- Pair: ${pair || "EUR/USD"}
- Timeframe: ${timeframe || "1H"}
- Current Price: ${price || "N/A"}
- RSI (14): ${rsi ?? "N/A"}
- MACD: ${macd || "N/A"}
- Trend (4H): ${trend || "N/A"}
- Volume: ${volume || "N/A"}

Apply the NEXUS CASCADING strategy and ZERO-LOSS risk engine. Return JSON only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد قليل." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في التحليل. حاول مرة أخرى." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let signal;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleaned = jsonMatch[0].replace(/،/g, ",");
        signal = JSON.parse(cleaned);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr, content);
      signal = { TYPE: "NO_TRADE", REASON: "تعذر التحليل. حاول مرة أخرى." };
    }

    return new Response(JSON.stringify(signal), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-market error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
