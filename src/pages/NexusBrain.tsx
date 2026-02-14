import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ScanLine, Sun, Send, X, Sparkles, Camera, Upload,
  ChevronLeft, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type BrainTab = "oracle" | "scan" | "brief";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asset-consultant`;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const NexusBrain = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BrainTab>("oracle");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCharged, setSessionCharged] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { spendCredits, canAfford, isFounder } = useCredits();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: userMessages,
          assetContext: { pair: "عام", price: 0, change: 0, rsi: 50, macd: "محايد", signal: "محايد", vol: "", category: "عام", up: true },
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { upsert("⚠️ عدد كبير من الطلبات، حاول بعد قليل"); setIsLoading(false); return; }
        if (resp.status === 402) { upsert("⚠️ رصيد غير كافٍ، يرجى إعادة الشحن"); setIsLoading(false); return; }
        const errData = await resp.json().catch(() => ({}));
        upsert(errData.error || "حدث خطأ، حاول مرة أخرى");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      upsert("⚠️ خطأ في الاتصال");
    }
    setIsLoading(false);
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!sessionCharged && !isFounder) {
      if (!canAfford(CREDIT_COSTS.chat_session)) {
        toast.error("رصيد غير كافٍ — تحتاج 2 نقطة لجلسة Nexus Oracle");
        return;
      }
      const success = await spendCredits(CREDIT_COSTS.chat_session, "chat_session", "جلسة Nexus Oracle");
      if (!success) { toast.error("رصيد غير كافٍ"); return; }
      setSessionCharged(true);
    }
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  };

  const tabs: { key: BrainTab; label: string; icon: React.ReactNode }[] = [
    { key: "oracle", label: "الأوراكل", icon: <Brain className="w-3.5 h-3.5" /> },
    { key: "scan", label: "مسح شارت", icon: <ScanLine className="w-3.5 h-3.5" /> },
    { key: "brief", label: "ملخص السوق", icon: <Sun className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 pt-4 pb-28 max-w-lg mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">INTELLIGENCE CENTER</p>
        <h1 className="text-xl font-display font-bold text-foreground tracking-wide">
          <span className="text-gradient-gold">NEXUS</span> BRAIN
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-mono font-bold transition-all",
              activeTab === t.key
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary/40 text-muted-foreground border border-border/10"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Oracle Tab */}
      {activeTab === "oracle" && (
        <motion.div variants={fadeUp} className="flex flex-col" style={{ minHeight: "60vh" }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 scrollbar-hide mb-3" style={{ maxHeight: "55vh" }}>
            {messages.length === 0 && (
              <div className="text-center pt-8">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                  <Brain className="w-7 h-7 text-accent" />
                </div>
                <p className="text-sm font-display font-bold text-foreground tracking-wide">NEXUS ORACLE</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-1">اسألني عن أي عملة، استراتيجية، أو تحليل</p>
                <div className="flex flex-col gap-2 mt-4">
                  {["ما أفضل فرصة تداول اليوم؟", "حلل لي البيتكوين الآن", "اقترح استراتيجية منخفضة المخاطر"].map(q => (
                    <button key={q} onClick={() => send(q)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/20 text-[11px] font-mono text-foreground hover:bg-secondary/80 transition-all text-right">
                      <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed font-mono",
                    msg.role === "user"
                      ? "bg-background border border-accent/30 text-foreground rounded-br-md"
                      : "rounded-bl-md text-foreground"
                  )}
                  style={msg.role === "assistant" ? {
                    background: "hsla(43, 100%, 50%, 0.06)",
                    border: "1px solid hsla(43, 100%, 50%, 0.1)",
                  } : undefined}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md" style={{
                  background: "hsla(43, 100%, 50%, 0.06)",
                  border: "1px solid hsla(43, 100%, 50%, 0.1)",
                }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="اسأل Nexus Oracle..."
              className="flex-1 bg-secondary/50 border border-border/20 rounded-xl px-3 py-2.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 transition-colors"
              dir="rtl"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                input.trim() && !isLoading
                  ? "bg-accent text-accent-foreground hover:bg-accent/80"
                  : "bg-secondary/50 text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Chart Scan Tab */}
      {activeTab === "scan" && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="glass rounded-[14px] p-6 text-center">
            <Cpu className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40 animate-pulse" />
            <h4 className="text-xs font-semibold font-mono mb-1">المحرك العصبي جاهز</h4>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">
              ارفع صورة شارت لتحليل مؤسسي بالذكاء الاصطناعي
            </p>
            <button
              onClick={() => navigate("/chart-vision")}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-[12px] font-mono font-bold hover:brightness-110 transition-all"
              style={{ boxShadow: "0 0 20px hsl(43 100% 50% / 0.2)" }}
            >
              <Camera className="w-4 h-4 inline-block ml-2" />
              افتح Chart Vision AI
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "+50 نمط", desc: "اكتشاف تلقائي" },
              { label: "دعم/مقاومة", desc: "مستويات ذكية" },
              { label: "استراتيجية", desc: "توليد فوري" },
            ].map((cap, i) => (
              <div key={i} className="glass rounded-[10px] p-3 text-center">
                <p className="text-[10px] font-mono font-bold text-foreground">{cap.label}</p>
                <p className="text-[8px] font-mono text-muted-foreground mt-0.5">{cap.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Market Brief Tab */}
      {activeTab === "brief" && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="glass rounded-[14px] p-6 text-center">
            <Sun className="w-10 h-10 mx-auto mb-3 text-warning animate-pulse" />
            <h4 className="text-xs font-semibold font-mono mb-1">الملخص الصباحي</h4>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">
              تقرير شامل عن حالة الأسواق والفرص بالذكاء الاصطناعي
            </p>
            <button
              onClick={() => navigate("/morning-brief")}
              className="px-6 py-3 rounded-xl text-[12px] font-mono font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, hsla(38, 100%, 50%, 0.15) 0%, hsla(43, 80%, 40%, 0.08) 100%)",
                border: "1px solid hsla(38, 100%, 50%, 0.2)",
              }}
            >
              <Sparkles className="w-4 h-4 inline-block ml-2 text-warning" />
              <span className="text-warning">افتح الملخص الصباحي</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NexusBrain;
