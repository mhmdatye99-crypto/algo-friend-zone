import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `أنت محلل فني خبير في الأسواق المالية. عند استلام صورة لشارت (رسم بياني)، قم بتحليلها بالتفصيل.

أجب دائماً بصيغة JSON التالية بالضبط (بدون أي نص إضافي قبله أو بعده):
{
  "pair": "اسم الزوج أو الأصل المالي (مثل BTC/USDT)",
  "timeframe": "الإطار الزمني المكتشف (مثل 1H, 4H, 1D)",
  "pattern": "اسم النمط الفني المكتشف",
  "patternAr": "اسم النمط بالعربية",
  "patternConfidence": 85,
  "direction": "bullish أو bearish أو sideways",
  "directionAr": "صاعد أو هابط أو جانبي",
  "directionConfidence": 80,
  "supportLevels": ["67200", "66800"],
  "resistanceLevels": ["68500", "69200"],
  "indicators": [
    {"name": "RSI", "value": "62", "signal": "محايد"},
    {"name": "MACD", "signal": "إيجابي"}
  ],
  "entry": "سعر الدخول المقترح",
  "stopLoss": "وقف الخسارة",
  "takeProfit1": "الهدف الأول",
  "takeProfit2": "الهدف الثاني",
  "riskReward": "1:3.2",
  "strategy": "وصف مختصر للاستراتيجية المقترحة",
  "reasoning": ["سبب 1", "سبب 2", "سبب 3", "سبب 4", "سبب 5"],
  "summary": "ملخص التحليل في 2-3 جمل"
}

إذا لم تتمكن من التعرف على الشارت، أعد:
{"error": "لم أتمكن من التعرف على الشارت. يرجى التأكد من أن الصورة تحتوي على رسم بياني مالي واضح."}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "حلل هذا الشارت بالتفصيل وأعطني التحليل الفني الكامل." },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول مرة أخرى بعد قليل." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد لاستخدام الذكاء الاصطناعي." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في التحليل. حاول مرة أخرى." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      analysis = { error: "تعذر تحليل الصورة. حاول بصورة أوضح." };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-chart error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
