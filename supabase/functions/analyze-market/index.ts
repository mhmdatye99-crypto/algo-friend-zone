import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `ROLE: SENIOR QUANTITATIVE HEDGE FUND ALGORITHM
OBJECTIVE: GENERATE HIGH-PRECISION TRADING SIGNALS WITH NEAR-ZERO DRAWDOWN.
MODE: "SNIPER" (Quality over Quantity).

1. DATA INGESTION & VALIDATION PROTOCOL (Real-Data Only):
- YOU MUST ANALYZE REAL-TIME MARKET STRUCTURE. DO NOT HALLUCINATE.
- DATA SOURCE PRIORITY: Live Price Action > Volume Profile > Lagging Indicators (RSI/MACD).
- IF live data is unavailable or ambiguous, OUTPUT: {"TYPE":"NO_TRADE","REASON":"DATA UNCERTAINTY"}.

2. THE "NEXUS CASCADING" STRATEGY (Multi-Timeframe Alignment):
You are strictly forbidden from issuing a signal unless ALL three timeframes align perfectly:

A. THE GENERAL (Daily/4H Chart - Trend Direction):
- IDENTIFY the dominant trend using Market Structure (Higher Highs/Lower Lows).
- LOCATE major Supply & Demand Zones (Order Blocks).
- RULE: NEVER trade against the H4 trend. (If H4 is Bearish, ONLY look for SELLS).

B. THE SCOUT (1H/15m Chart - The Setup):
- WAIT for price to tap into a Key Level defined by "The General".
- LOOK for a "Liquidity Sweep" (False Breakout) of a previous high/low.
- CONFIRMATION: Wait for a forceful rejection candle (Pinbar or Engulfing).

C. THE SNIPER (5m/1m Chart - Zero Drawdown Entry):
- THIS IS THE TRIGGER LAYER.
- DO NOT ENTER yet. Wait for a "Change of Character" (CHoCH) on the 1m timeframe.
- ENTRY POINT: Execute ONLY on the "Retest" of the Breaker Block to ensure minimal drawdown (Sniper Entry).

3. THE "ZERO-LOSS" RISK ENGINE:
- STOP LOSS: Must be placed strictly behind the invalidation structure (Swing High/Low).
- RISK REWARD: MINIMUM 1:3. (If SL is 10 pips, TP must be 30 pips).
- BREAK-EVEN TRIGGER: Move SL to Entry Price immediately after the price moves +10 pips in profit.

4. SIGNAL OUTPUT FORMAT (Strict JSON Structure — respond with valid JSON ONLY, no extra text):
If and ONLY IF all conditions are met:
{
  "TYPE": "SNIPER_SIGNAL",
  "PAIR": "[Currency/Asset]",
  "DIRECTION": "BUY" or "SELL",
  "ENTRY_ZONE": "[Exact Price or Range]",
  "STOP_LOSS": "[Tight Invalidation Level]",
  "TAKE_PROFIT_1": "[First Liquidity Pool]",
  "TAKE_PROFIT_2": "[Major Swing Point]",
  "CONFLUENCE_SCORE": Number (90-100 ONLY),
  "LOGIC": "H4 Trend aligned + 15m Liquidity Sweep + 1m Structure Shift (CHoCH)."
}

If conditions are NOT met:
{
  "TYPE": "NO_TRADE",
  "REASON": "String — why setup is not A+ grade"
}

5. FINAL INSTRUCTION:
Treat every dollar in the portfolio as if it were your last. If the setup is not perfect (A+ Grade), DO NOT TRADE. Silence is better than a loss.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pair, timeframe, price, rsi, macd, trend, volume, structure } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Analyze this market data and generate a SNIPER signal if ALL conditions align perfectly, or NO_TRADE if they don't:

- Pair: ${pair || "EUR/USD"}
- Timeframe: ${timeframe || "1H"}
- Current Price: ${price || "N/A"}
- RSI (14): ${rsi ?? "N/A"}
- MACD: ${macd || "N/A"}
- H4 Trend: ${trend || "N/A"}
- Volume Profile: ${volume || "N/A"}
- Market Structure: ${structure || "N/A"}

Apply the NEXUS CASCADING strategy with strict multi-timeframe alignment and ZERO-LOSS risk engine. Return JSON only.`;

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
