import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, MessageCircle, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SignalContext {
  pair: string;
  direction: string;
  timeFrame: string;
  price: string;
  rsi: number;
  macd: string;
  confidence: number;
  rr: string;
  sl: string;
  target1: string;
  target2: string;
}

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_QUESTIONS = [
  "لماذا هذا الدخول؟",
  "هل الدخول آمن الآن؟",
  "ما خطة الخروج إذا زاد التذبذب؟",
  "ما أقرب دعم ومقاومة؟",
];

const ASK_X_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-x`;

interface Props {
  signalContext: SignalContext;
  open: boolean;
  onClose: () => void;
  onOpenRiskCalc: () => void;
}

const AskXChat = ({ signalContext, open, onClose, onOpenRiskCalc }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const streamChat = async (allMessages: Msg[]) => {
    const resp = await fetch(ASK_X_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, signalContext }),
    });

    if (resp.status === 429) { toast.error("تم تجاوز حد الطلبات"); throw new Error("rate limited"); }
    if (resp.status === 402) { toast.error("يرجى إضافة رصيد"); throw new Error("payment required"); }
    if (!resp.ok || !resp.body) throw new Error("Failed");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") return;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) upsert(content);
        } catch { buffer = line + "\n" + buffer; break; }
      }
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      await streamChat(newMessages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="rounded-xl border border-accent/20 bg-background/95 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-accent/5 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center">
              <span className="text-[11px] font-bold text-accent">X</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-accent">اسأل X عن {signalContext.pair}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onOpenRiskCalc(); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-accent transition-colors">
              <Calculator className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="max-h-64 overflow-y-auto p-3 space-y-2 scrollbar-hide">
          {messages.length === 0 && (
            <div className="text-center py-4 space-y-3">
              <p className="text-[10px] font-mono text-muted-foreground">اسأل X أي سؤال عن هذه الإشارة</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-[9px] font-mono px-2.5 py-1.5 rounded-lg bg-accent/8 text-accent border border-accent/15 hover:bg-accent/15 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}>
              <div className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-[11px] font-mono leading-relaxed",
                m.role === "user"
                  ? "bg-secondary/50 text-foreground"
                  : "bg-accent/8 text-foreground border border-accent/10"
              )}>
                {m.role === "assistant" && <span className="text-accent font-bold text-[9px] block mb-1">X:</span>}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-end">
              <div className="bg-accent/8 rounded-xl px-3 py-2 border border-accent/10">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-2 border-t border-border/10">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            onClick={e => e.stopPropagation()}
            placeholder="اسأل X..."
            className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-[11px] font-mono border border-border/20 focus:border-accent/40 focus:outline-none"
          />
          <button
            onClick={(e) => { e.stopPropagation(); send(input); }}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center hover:bg-accent/25 transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AskXChat;
