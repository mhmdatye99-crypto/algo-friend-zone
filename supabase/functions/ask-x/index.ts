import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, signalContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `أنت "X" — محلل ذكاء اصطناعي مؤسسي متخصص في الأسواق المالية. أسلوبك: مباشر، احترافي، مبني على البيانات، وحامي لرأس مال المتداول.

سياق الإشارة الحالية:
- الزوج: ${signalContext.pair}
- الاتجاه: ${signalContext.direction}
- الإطار الزمني: ${signalContext.timeFrame}
- السعر: ${signalContext.price}
- RSI: ${signalContext.rsi}
- MACD: ${signalContext.macd}
- الثقة: ${signalContext.confidence}%
- المخاطرة/العائد: ${signalContext.rr}
- وقف الخسارة: ${signalContext.sl}
- الأهداف: TP1=${signalContext.target1}, TP2=${signalContext.target2}

أجب بشكل مختصر ومباشر ومبني على البيانات الفنية. استخدم أرقام محددة. أحمِ رأس مال المتداول دائماً. لا تقدم نصائح مالية، فقط تحليل فني تعليمي.`;

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
          ...messages,
        ],
        stream: true,
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
      return new Response(JSON.stringify({ error: "خطأ في X. حاول مرة أخرى." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ask-x error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
