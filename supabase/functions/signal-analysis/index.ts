import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pair, direction, timeFrame, price, rsi, macd, confidence, reasons } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `أنت محلل فني خبير في الأسواق المالية. عند استلام بيانات إشارة تداول، قدم تحليلاً شاملاً مع مناطق الدخول والخروج وأسباب الدخول والسيناريوهات المتوقعة.

أجب دائماً بصيغة JSON التالية بالضبط (بدون أي نص إضافي):
{
  "entryZone": {"from": "سعر", "to": "سعر", "type": "فوري أو معلق"},
  "exitZones": [
    {"target": "سعر", "label": "TP1", "probability": 75},
    {"target": "سعر", "label": "TP2", "probability": 55},
    {"target": "سعر", "label": "TP3", "probability": 35}
  ],
  "stopLoss": {"price": "سعر", "reason": "سبب وضع الوقف هنا"},
  "entryReasons": [
    "سبب 1 مفصل",
    "سبب 2 مفصل",
    "سبب 3 مفصل",
    "سبب 4 مفصل"
  ],
  "scenarios": [
    {"title": "السيناريو الإيجابي", "probability": 60, "description": "وصف مفصل لما سيحدث", "targets": ["هدف1", "هدف2"]},
    {"title": "السيناريو السلبي", "probability": 25, "description": "وصف مفصل لما سيحدث", "targets": ["مستوى1"]},
    {"title": "السيناريو المحايد", "probability": 15, "description": "وصف مفصل للحركة الجانبية", "targets": []}
  ],
  "riskReward": "1:X.X",
  "strategy": "وصف مختصر للاستراتيجية المثالية للتنفيذ",
  "keyLevels": {"support": ["سعر1", "سعر2"], "resistance": ["سعر1", "سعر2"]},
  "timeHorizon": "المدة المتوقعة للصفقة",
  "verdict": "ملخص التحليل في جملة واحدة قوية"
}

استخدم أرقاماً واقعية ومنطقية بناءً على السعر الحالي والمؤشرات المعطاة.`;

    const userPrompt = `حلل هذه الإشارة وأعطني تحليلاً شاملاً:
- الزوج: ${pair}
- الاتجاه: ${direction}
- الإطار الزمني: ${timeFrame}
- السعر الحالي: ${price}
- RSI: ${rsi}
- MACD: ${macd}
- الثقة: ${confidence}%
- الأسباب الأولية: ${reasons?.join(", ") || "غير محدد"}

أعطني مناطق الدخول والخروج بدقة، وأسباب الدخول، والسيناريوهات المتوقعة. أجب بصيغة JSON فقط.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
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

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Fix Arabic comma that breaks JSON parsing
        const cleaned = jsonMatch[0].replace(/،/g, ",");
        analysis = JSON.parse(cleaned);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr, content);
      analysis = { error: "تعذر التحليل. حاول مرة أخرى." };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("signal-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
