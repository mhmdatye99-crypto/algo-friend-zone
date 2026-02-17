import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain, Shield, AlertTriangle, TrendingUp, Target,
  BarChart3, Send, Sparkles, CheckCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { useTradePerformance } from "@/hooks/useTradePerformance";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asset-consultant`;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Mentor = () => {
  const { user } = useAuth();
  const { latestScore } = useChallenges();
  const { data: perf } = useTradePerformance();
  const { spendCredits, canAfford, isFounder } = useCredits();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCharged, setSessionCharged] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const score = latestScore?.score ?? 50;
  const scoreColor = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

  // Behavioral insights
  const insights = [];
  if (latestScore) {
    if (latestScore.sl_respect < 50) insights.push({ type: "warning", text: "أنت لا تلتزم بوقف الخسارة بشكل كافٍ. التزم بخطتك." });
    if (latestScore.no_overtrading < 50) insights.push({ type: "warning", text: "تجاوزت عدد الصفقات اليومية المسموح. قلّل من التداول المفرط." });
    if (latestScore.risk_adherence < 50) insights.push({ type: "warning", text: "حجم مخاطرتك يتجاوز الحدود المقبولة. راجع إعدادات المخاطرة." });
    if (latestScore.plan_following < 50) insights.push({ type: "warning", text: "أنت تخرج عن خطة التداول. عد للالتزام بالقواعد." });
    if (score >= 70) insights.push({ type: "success", text: "أداء منضبط ممتاز! استمر بهذا النهج المؤسسي." });
    if (latestScore.consistency >= 70) insights.push({ type: "success", text: "مستوى ثبات عالٍ — أنت تتداول كمحترف." });
  }

  const streamChat = useCallback(async (userMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: userMessages,
          assetContext: { pair: "عام", price: 0, change: 0, rsi: 50, macd: "محايد", signal: "محايد", vol: "", category: "عام", up: true },
        }),
      });
      if (!resp.ok || !resp.body) { upsert("حدث خطأ"); setIsLoading(false); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) upsert(c); } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch { upsert("خطأ في الاتصال"); }
    setIsLoading(false);
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!sessionCharged && !isFounder) {
      if (!canAfford(CREDIT_COSTS.chat_session)) { toast.error("رصيد غير كافٍ"); return; }
      const success = await spendCredits(CREDIT_COSTS.chat_session, "chat_session", "جلسة مع المُرشد AI");
      if (!success) return;
      setSessionCharged(true);
    }
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput("");
    streamChat(newMessages);
  };

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-3 pb-28 max-w-lg mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">مدرب التداول</p>
        <h1 className="text-lg font-bold">AI <span className="text-gradient-gold">Mentor</span></h1>
      </motion.div>

      {/* Discipline Score */}
      <motion.div variants={fadeUp} className="rounded-xl p-4 text-center" style={{
        background: "linear-gradient(135deg, hsla(145, 80%, 48%, 0.06) 0%, hsla(220, 20%, 12%, 0.4) 100%)",
        border: "1px solid hsla(145, 80%, 48%, 0.1)",
      }}>
        <Shield className="w-7 h-7 text-primary mx-auto mb-1" />
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">درجة الانضباط</p>
        <p className={cn("text-4xl font-mono font-bold", scoreColor)}>{score}</p>
        <p className="text-[9px] font-mono text-muted-foreground mt-1">من 100</p>

        {latestScore && (
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {[
              { label: "SL", value: latestScore.sl_respect },
              { label: "مخاطرة", value: latestScore.risk_adherence },
              { label: "إفراط", value: latestScore.no_overtrading },
              { label: "خطة", value: latestScore.plan_following },
              { label: "ثبات", value: latestScore.consistency },
            ].map((m) => (
              <div key={m.label} className="bg-secondary/40 rounded-lg p-1.5 text-center">
                <p className="text-[7px] font-mono text-muted-foreground">{m.label}</p>
                <p className={cn("text-[10px] font-mono font-bold",
                  m.value >= 70 ? "text-success" : m.value >= 40 ? "text-warning" : "text-destructive"
                )}>{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Behavioral Insights */}
      {insights.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">تقييم سلوكي</p>
          {insights.map((ins, i) => (
            <div key={i} className={cn(
              "rounded-xl px-3 py-2.5 flex items-start gap-2 text-[10px] font-mono border",
              ins.type === "warning"
                ? "bg-warning/5 border-warning/10 text-warning"
                : "bg-success/5 border-success/10 text-success"
            )}>
              {ins.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{ins.text}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Risk Adherence Rating */}
      <motion.div variants={fadeUp} className="rounded-xl p-3 bg-card/60 border border-border/10">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">التزام المخاطرة</p>
        <Progress value={latestScore?.risk_adherence ?? 50} className="h-2 bg-secondary/50" />
        <div className="flex justify-between mt-1.5 text-[8px] font-mono text-muted-foreground">
          <span>ضعيف</span>
          <span className="font-bold text-foreground">{latestScore?.risk_adherence ?? 50}%</span>
          <span>ممتاز</span>
        </div>
      </motion.div>

      {/* Chat with Mentor */}
      <motion.div variants={fadeUp} className="rounded-xl bg-card/40 border border-border/10 p-3">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <Brain className="w-3 h-3 text-accent" /> اسأل المُرشد
        </p>
        <div ref={scrollRef} className="max-h-[35vh] overflow-y-auto space-y-2 scrollbar-hide mb-2">
          {messages.length === 0 && (
            <div className="text-center py-4">
              <Brain className="w-8 h-8 mx-auto mb-2 text-accent/40" />
              <p className="text-[10px] font-mono text-muted-foreground">اسألني عن أدائك، خطتك، أو أي استشارة تداولية</p>
              <div className="flex flex-col gap-1.5 mt-3">
                {["كيف أحسّن انضباطي؟", "هل أتداول بشكل مفرط؟", "قيّم إدارتي للمخاطر"].map(q => (
                  <button key={q} onClick={() => send(q)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 border border-border/10 text-[10px] font-mono hover:bg-secondary/80 transition-all text-right">
                    <Sparkles className="w-3 h-3 text-accent shrink-0" /> {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-[11px] font-mono leading-relaxed",
                msg.role === "user"
                  ? "bg-secondary border border-border/20 rounded-br-none"
                  : "bg-accent/5 border border-accent/10 rounded-bl-none"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-accent/5 border border-accent/10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="اسأل المُرشد AI..."
            className="flex-1 bg-secondary/50 border border-border/20 rounded-lg px-3 py-2 text-[11px] font-mono placeholder:text-muted-foreground focus:outline-none focus:border-accent/30 transition-colors"
            dir="rtl"
          />
          <button onClick={() => send(input)} disabled={!input.trim() || isLoading}
            className={cn("p-2 rounded-lg transition-all", input.trim() && !isLoading ? "bg-accent text-accent-foreground" : "bg-secondary/50 text-muted-foreground")}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Mentor;
