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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const today = new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemPrompt = `أنت محلل مالي أول في صندوق تحوط عالمي. مهمتك إعداد ملخص صباحي يومي احترافي للمتداولين.

أعد الملخص بصيغة JSON التالية بالضبط (بدون أي نص إضافي):
{
  "date": "${today}",
  "greeting": "تحية صباحية مختصرة ومهنية (جملة واحدة)",
  "marketOverview": "نظرة عامة على حالة الأسواق العالمية في 2-3 جمل",
  "keyEvents": [
    {"time": "الوقت", "event": "الحدث", "impact": "high أو medium أو low", "assets": ["الأصول المتأثرة"]}
  ],
  "topOpportunities": [
    {"pair": "الزوج", "direction": "شراء أو بيع", "reason": "السبب باختصار", "confidence": 85}
  ],
  "riskAlerts": [
    {"alert": "تحذير مهم", "severity": "high أو medium"}
  ],
  "sentiment": {
    "crypto": {"score": 72, "label": "متفائل أو محايد أو متشائم"},
    "forex": {"score": 55, "label": "متفائل أو محايد أو متشائم"},
    "commodities": {"score": 68, "label": "متفائل أو محايد أو متشائم"}
  },
  "dailyTip": "نصيحة تداول احترافية لليوم",
  "focusAssets": ["أهم 3-5 أصول يجب مراقبتها اليوم"]
}

اجعل المحتوى واقعياً ومبنياً على تحليل فني ومعنوي. استخدم أسعاراً وأرقاماً منطقية. التاريخ اليوم: ${today}.`;

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
            { role: "user", content: `أعد الملخص الصباحي ليوم ${today}. اجعله شاملاً واحترافياً. أجب بصيغة JSON فقط.` },
          ],
          temperature: 0.7,
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
        JSON.stringify({ error: "حدث خطأ. حاول مرة أخرى." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let brief;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brief = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      brief = { error: "تعذر توليد الملخص. حاول مرة أخرى." };
    }

    return new Response(JSON.stringify(brief), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("morning-brief error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
