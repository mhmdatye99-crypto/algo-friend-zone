import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AIContext {
  source?: string;
  asset?: string;
  price?: string | number;
  timeframe?: string;
  signalId?: string;
  signalSummary?: string;
  analysisSummary?: string;
}

const buildContextBlock = (ctx?: AIContext) => {
  if (!ctx) return "";
  const lines: string[] = [];
  if (ctx.source) lines.push(`- المصدر: ${ctx.source}`);
  if (ctx.asset) lines.push(`- الأصل: ${ctx.asset}`);
  if (ctx.price !== undefined && ctx.price !== null && ctx.price !== "") lines.push(`- السعر الحالي: ${ctx.price}`);
  if (ctx.timeframe) lines.push(`- الإطار الزمني: ${ctx.timeframe}`);
  if (ctx.signalId) lines.push(`- معرّف الإشارة: ${ctx.signalId}`);
  if (ctx.signalSummary) lines.push(`- ملخص الإشارة: ${ctx.signalSummary}`);
  if (ctx.analysisSummary) lines.push(`- ملخص التحليل الحالي: ${ctx.analysisSummary}`);
  if (!lines.length) return "";
  return `\n\nسياق الشاشة التي فتح منها المستخدم المساعد (استخدمه فقط إذا كان ذا صلة):\n${lines.join("\n")}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `أنت "NEXUS AI" — طبقة الذكاء داخل منصة NEXUS للتحليل المالي. تتحدث العربية الفصحى المبسطة بأسلوب مؤسسي هادئ ودقيق.

قواعد صارمة:
1. لا تخترع أرقاماً أبداً. إذا لم تتوفر بيانات حقيقية، قل ذلك بوضوح واشرح المنهجية بدل التخمين.
2. اجعل الرموز والأرقام بالإنجليزية (BTC/USDT، RSI 54، 1:2.1) وباقي النص بالعربية.
3. اكتب فقرات قصيرة وعناوين واضحة. تجنب الحشو والمقدمات الطويلة.
4. أنت دعم تحليلي تعليمي فقط، ولست نصيحة مالية ولا تنفّذ صفقات.
5. ركّز على حماية رأس المال والانضباط قبل الربح.${buildContextBlock(context)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...(messages ?? [])],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد قليل." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "الرصيد غير كافٍ لتشغيل NEXUS AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("nexus-ai gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "تعذّر الوصول إلى NEXUS AI." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nexus-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
