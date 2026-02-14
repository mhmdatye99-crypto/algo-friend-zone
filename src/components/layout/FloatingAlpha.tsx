import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asset-consultant`;

const FloatingAlpha = () => {
  const [open, setOpen] = useState(false);
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

    // Charge credits on first message of session
    if (!sessionCharged && !isFounder) {
      if (!canAfford(CREDIT_COSTS.chat_session)) {
        toast.error("رصيد غير كافٍ — تحتاج 2 نقطة لجلسة Nexus Oracle");
        return;
      }
      const success = await spendCredits(CREDIT_COSTS.chat_session, "chat_session", "جلسة Nexus Oracle");
      if (!success) {
        toast.error("رصيد غير كافٍ");
        return;
      }
      setSessionCharged(true);
    }

    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-28 right-20 z-30 w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(190 100% 40%), hsl(190 100% 55%))",
              boxShadow: "0 4px 20px hsla(190, 100%, 50%, 0.35), 0 0 40px hsla(190, 100%, 50%, 0.15)",
            }}
          >
            <Brain className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg h-[75vh] flex flex-col rounded-t-2xl overflow-hidden border-t border-x border-accent/15"
              style={{ background: "hsla(240, 15%, 2.5%, 0.95)", backdropFilter: "blur(40px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                     <p className="text-sm font-display font-bold text-foreground tracking-wide">NEXUS ORACLE</p>
                     <p className="text-[10px] font-mono text-muted-foreground">المستشار العصبي — اسأل عن أي أصل أو استراتيجية</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
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
              <div className="px-4 py-3 border-t border-border/20">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAlpha;
