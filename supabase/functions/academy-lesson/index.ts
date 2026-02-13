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
    const { courseId, lessonIndex } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const courseTopics: Record<string, { title: string; lessons: string[] }> = {
      "quant-fundamentals": {
        title: "أسس التحليل الكمّي للأسواق",
        lessons: [
          "مقدمة في التحليل الكمّي وتاريخه في الأسواق المالية",
          "أساسيات الإحصاء التطبيقي للمتداولين",
          "التوزيعات الاحتمالية وتطبيقاتها على حركة الأسعار",
          "مفهوم الانحراف المعياري والتقلب في الأسواق",
          "مؤشر القوة النسبية RSI — البناء الرياضي والتفسير",
          "مؤشر MACD — التقارب والتباعد للمتوسطات المتحركة",
          "تحليل الحجم وارتباطه بحركة السعر",
          "نظرية الاحتمالات في إدارة المراكز",
          "الارتباط والتنويع بين الأصول المالية",
          "بناء نموذج كمّي بسيط للتنبؤ",
          "اختبار الأداء التاريخي (Backtesting) للاستراتيجيات",
          "مشروع تطبيقي: بناء مؤشر كمّي مخصص",
        ],
      },
      "advanced-ta": {
        title: "التحليل الفني المتقدم — أنماط وإشارات",
        lessons: [
          "فلسفة التحليل الفني ونظرية داو",
          "أنماط الشموع اليابانية المتقدمة",
          "نماذج الانعكاس: الرأس والكتفين، القمة المزدوجة",
          "نماذج الاستمرار: الأعلام، المثلثات، الأوتاد",
          "مستويات فيبوناتشي والمناطق الذهبية",
          "نظرية موجات إليوت المبسطة",
          "تحليل هيكل السوق (Market Structure)",
          "مناطق العرض والطلب المؤسسية",
          "تحليل السيولة وصيد الوقف (Stop Hunts)",
          "التقاء المؤشرات الفنية (Confluence Trading)",
          "قراءة دفتر الأوامر وتدفق الطلبات",
          "التحليل متعدد الإطارات الزمنية",
        ],
      },
      "risk-management": {
        title: "إدارة المخاطر المؤسسية وحجم المراكز",
        lessons: [
          "أساسيات إدارة المخاطر في التداول المؤسسي",
          "حساب حجم المركز الأمثل (Position Sizing)",
          "نسبة المخاطرة للعائد وتأثيرها على الأداء",
          "أقصى تراجع مسموح وقواعد إيقاف التداول",
          "التنويع وإدارة التعرّض للمخاطر",
          "إدارة المخاطر النفسية والانضباط",
          "بناء خطة تداول مؤسسية متكاملة",
          "تحليل أداء المحفظة: نسبة شارب وعامل الربح",
        ],
      },
      "deep-chart": {
        title: "إتقان رؤية الشارت بالتعلّم العميق",
        lessons: [
          "مقدمة في رؤية الشارت بالذكاء الاصطناعي",
          "كيف يرى الـ AI الأنماط في الرسوم البيانية",
          "التعرف الآلي على مستويات الدعم والمقاومة",
          "اكتشاف الأنماط الفنية بالتعلم العميق",
          "تحليل الشموع اليابانية بالذكاء الاصطناعي",
          "دمج المؤشرات الفنية مع تحليل الصور",
          "بناء استراتيجية مبنية على Chart Vision AI",
          "تطبيق عملي: تحليل 10 شارتات حية",
          "تقييم دقة النماذج وتحسين الأداء",
          "مشروع نهائي: بناء نظام تحليل شارت متكامل",
        ],
      },
    };

    const courseKeys = Object.keys(courseTopics);
    const course = courseTopics[courseKeys[courseId] || courseKeys[0]];
    const lessonTitle = course.lessons[lessonIndex] || course.lessons[0];

    const systemPrompt = `أنت مدرّب تداول مؤسسي خبير ومحاضر أكاديمي في الأسواق المالية. مهمتك تقديم درس تعليمي شامل ومهني.

أجب دائماً بصيغة JSON التالية بالضبط (بدون أي نص إضافي):
{
  "title": "عنوان الدرس",
  "introduction": "مقدمة تمهيدية للدرس في 2-3 جمل احترافية",
  "sections": [
    {
      "heading": "عنوان القسم",
      "content": "محتوى تعليمي مفصل ومهني (3-5 فقرات على الأقل)",
      "keyPoint": "النقطة الجوهرية من هذا القسم في جملة واحدة"
    }
  ],
  "practicalExample": {
    "scenario": "سيناريو تطبيقي واقعي من الأسواق",
    "analysis": "تحليل خطوة بخطوة للسيناريو",
    "outcome": "النتيجة والدروس المستفادة"
  },
  "quiz": [
    {
      "question": "سؤال اختبار",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctIndex": 0,
      "explanation": "شرح الإجابة الصحيحة"
    },
    {
      "question": "سؤال ثاني",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctIndex": 1,
      "explanation": "شرح الإجابة الصحيحة"
    },
    {
      "question": "سؤال ثالث",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctIndex": 2,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ],
  "summary": "ملخص الدرس في 3-4 نقاط رئيسية",
  "nextSteps": "ما يجب على المتداول فعله بعد هذا الدرس"
}

قدّم محتوى عميقاً ومهنياً يليق بمتداولين محترفين. استخدم أمثلة حقيقية من الأسواق. لا تستخدم لغة مبسطة أو أسلوب مبتدئين.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `قدّم درساً تعليمياً شاملاً عن: "${lessonTitle}" ضمن منهج "${course.title}". الدرس رقم ${lessonIndex + 1}.`,
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
        JSON.stringify({ error: "حدث خطأ في توليد الدرس. حاول مرة أخرى." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let lesson;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lesson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      lesson = { error: "تعذر توليد الدرس. حاول مرة أخرى." };
    }

    return new Response(JSON.stringify(lesson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("academy-lesson error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
