import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Sparkles, Target, FlaskConical, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "@/hooks/useLivePrices";
import { formatPrice } from "@/hooks/useLivePrices";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asset-consultant`;

const quickChips = [
  { label: "ملخص فني", icon: Sparkles, prompt: "قدم لي ملخصاً فنياً شاملاً لهذا الأصل مع مستويات الدعم والمقاومة" },
  { label: "اختبار استراتيجيتي", icon: FlaskConical, prompt: "اختبر استراتيجية تداول بناءً على المؤشرات الحالية لهذا الأصل واقترح نقاط دخول وخروج" },
  { label: "ربط بمستهدفات النمو", icon: Target, prompt: "كيف يمكن لهذا الأصل أن يساهم في تحقيق مستهدفات النمو المالية (مليون دولار)؟ اقترح خطة عملية" },
];

interface Props {
  asset: Asset;
}

export const AlphaConsultant = ({ asset }: Props) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
          assetContext: {
            pair: asset.pair,
            price: asset.price,
            change: asset.change,
            rsi: asset.rsi,
            macd: asset.macd,
            signal: asset.signal,
            vol: asset.vol,
            category: asset.category,
            up: asset.up,
          },
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
    } catch (e) {
      console.error(e);
      upsert("⚠️ خطأ في الاتصال");
    }
    setIsLoading(false);
  }, [asset]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[12px] font-bold transition-all",
          "bg-accent/10 border border-accent/30 text-accent",
          "hover:bg-accent/20 hover:border-accent/50",
          "animate-glow"
        )}
        style={{ boxShadow: "0 0 20px hsl(190 100% 50% / 0.15), 0 0 40px hsl(190 100% 50% / 0.05)" }}
      >
        <Brain className="w-4 h-4" />
        <span>Talk to Alpha</span>
        <Zap className="w-3 h-3 text-primary" />
      </motion.button>

      {/* Chat Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

            {/* Chat Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg h-[85vh] flex flex-col rounded-t-2xl overflow-hidden border-t border-x border-accent/15"
              style={{ background: "hsla(240, 15%, 2.5%, 0.92)", backdropFilter: "blur(40px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Alpha Consultant</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {asset.icon} {asset.pair} — <span className="font-mono">{formatPrice(asset.price)}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
                {messages.length === 0 && (
                  <div className="space-y-4 pt-4">
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                        <Brain className="w-7 h-7 text-accent" />
                      </div>
                      <p className="text-sm font-bold text-foreground">مرحباً، أنا Alpha</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-1">
                        مستشارك الذكي لـ <span className="text-accent font-bold">{asset.pair}</span>
                      </p>
                    </div>
                    {/* Quick Chips */}
                    <div className="flex flex-col gap-2">
                      {quickChips.map(chip => (
                        <button
                          key={chip.label}
                          onClick={() => send(chip.prompt)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/20 text-foreground text-[11px] font-mono hover:bg-secondary/80 hover:border-accent/20 transition-all text-right"
                        >
                          <chip.icon className="w-4 h-4 text-accent shrink-0" />
                          {chip.label}
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
                        boxShadow: "0 0 15px hsla(43, 100%, 50%, 0.08)",
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
                    placeholder="اسأل Alpha عن هذا الأصل..."
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
                <p className="text-[9px] text-muted-foreground font-mono text-center mt-2">
                  ليست إشارة دخول مالية — للأغراض التعليمية فقط
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
