import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Search, X, TrendingUp, TrendingDown,
  BarChart3, Target, Shield, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useLivePrices, type Asset } from "@/hooks/useLivePrices";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asset-consultant`;

/* ── Quick-action chips when an asset is selected ── */
const assetActions = [
  { label: "تحليل فني شامل", icon: BarChart3, prompt: (p: string) => `أعطني تحليل فني شامل لـ ${p} مع مستويات الدعم والمقاومة` },
  { label: "نقاط الدخول والخروج", icon: Target, prompt: (p: string) => `ما أفضل نقاط الدخول والخروج لـ ${p} حالياً؟` },
  { label: "تقييم المخاطرة", icon: Shield, prompt: (p: string) => `قيّم مخاطر التداول على ${p} الآن وحدد وقف الخسارة المناسب` },
  { label: "توقع الاتجاه", icon: Zap, prompt: (p: string) => `ما توقعك لاتجاه ${p} خلال الساعات القادمة؟` },
];

/* ── General suggestions (no asset selected) ── */
const generalSuggestions = [
  "ما أفضل فرصة تداول الآن؟",
  "كيف أحسّن انضباطي في التداول؟",
  "اشرح لي استراتيجية Break of Structure",
  "ما الفرق بين RSI و MACD؟",
];

const Mentor = () => {
  const { user } = useAuth();
  const { spendCredits, canAfford, isFounder } = useCredits();
  const assets = useLivePrices();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCharged, setSessionCharged] = useState(false);

  /* ── Asset search state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return assets.slice(0, 12);
    const q = searchQuery.toLowerCase();
    return assets.filter(a => a.pair.toLowerCase().includes(q)).slice(0, 15);
  }, [searchQuery, assets]);

  /* ── Streaming chat ── */
  const streamChat = useCallback(async (userMessages: Msg[], asset?: Asset | null) => {
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
      const ctx = asset ?? selectedAsset;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: userMessages,
          assetContext: ctx ? {
            pair: ctx.pair, price: ctx.price, change: ctx.change, rsi: ctx.rsi,
            macd: ctx.macd, signal: ctx.signal, vol: ctx.vol, category: ctx.category, up: ctx.up,
          } : { pair: "عام", price: 0, change: 0, rsi: 50, macd: "محايد", signal: "محايد", vol: "", category: "عام", up: true },
        }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { toast.error("تم تجاوز الحد المسموح، حاول لاحقاً"); }
        else if (resp.status === 402) { toast.error("الرصيد غير كافٍ"); }
        else { upsert("حدث خطأ في الاتصال"); }
        setIsLoading(false); return;
      }
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
  }, [selectedAsset]);

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
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  };

  const selectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowSearch(false);
    setSearchQuery("");
  };

  const clearAsset = () => {
    setSelectedAsset(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-lg mx-auto" dir="rtl">
      {/* ── Top bar ── */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-border/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
          background: "linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--accent), 0.1))",
          border: "1px solid hsla(var(--primary), 0.2)",
        }}>
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold font-display">المُرشد AI</h1>
          <p className="text-[13px] font-mono text-muted-foreground">مستشارك الذكي للتداول والتحليل</p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={cn(
            "p-2 rounded-lg transition-all",
            showSearch ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Search className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* ── Asset search panel ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border/10"
          >
            <div className="px-4 py-2.5 space-y-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عملة أو زوج..."
                  className="w-full bg-secondary/40 border border-border/20 rounded-lg px-3 py-2 pr-9 text-[13px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30"
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                {filtered.map(a => (
                  <button
                    key={a.pair}
                    onClick={() => selectAsset(a)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-secondary/30 border border-border/10 hover:bg-secondary/60 hover:border-primary/20 transition-all text-right"
                  >
                    <span className="text-[13px]">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-mono font-bold truncate">{a.pair}</p>
                      <p className={cn("text-[13px] font-mono", a.up ? "text-success" : "text-destructive")}>
                        {a.up ? "+" : ""}{a.change.toFixed(2)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selected asset bar ── */}
      {selectedAsset && (
        <div className="px-4 py-2 border-b border-border/10 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-base">{selectedAsset.icon}</span>
            <div>
              <p className="text-[13px] font-mono font-bold">{selectedAsset.pair}</p>
              <div className="flex items-center gap-2 text-[13px] font-mono">
                <span className="text-foreground">${selectedAsset.price.toLocaleString()}</span>
                <span className={cn("flex items-center gap-0.5", selectedAsset.up ? "text-success" : "text-destructive")}>
                  {selectedAsset.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {selectedAsset.up ? "+" : ""}{selectedAsset.change.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">RSI: {selectedAsset.rsi}</span>
              </div>
            </div>
          </div>
          <button onClick={clearAsset} className="p-1.5 rounded-md bg-secondary/50 hover:bg-secondary text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Chat messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{
              background: "linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--accent), 0.06))",
              border: "1px solid hsla(var(--primary), 0.15)",
            }}>
              <Brain className="w-8 h-8 text-primary/60" />
            </div>
            <h2 className="text-sm font-bold mb-1">مرحباً، أنا مُرشدك الذكي</h2>
            <p className="text-[13px] font-mono text-muted-foreground mb-5 max-w-[250px]">
              {selectedAsset
                ? `اختر سؤالاً عن ${selectedAsset.pair} أو اكتب سؤالك`
                : "ابحث عن عملة للتحليل أو اسألني أي سؤال عن التداول"
              }
            </p>

            {/* Quick action chips */}
            <div className="w-full space-y-1.5">
              {selectedAsset ? (
                assetActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => send(action.prompt(selectedAsset.pair))}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-secondary/40 border border-border/10 hover:bg-secondary/70 hover:border-primary/15 transition-all text-right"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-mono">{action.label}</span>
                    </button>
                  );
                })
              ) : (
                generalSuggestions.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-secondary/40 border border-border/10 hover:bg-secondary/70 hover:border-primary/15 transition-all text-right"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent/8 flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-[13px] font-mono">{q}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1 ml-2">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] font-mono leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary/12 border border-primary/15 rounded-br-md"
                    : "bg-secondary/50 border border-border/15 rounded-bl-md"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1 ml-2">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-secondary/50 border border-border/15 rounded-bl-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 py-3 pb-28 border-t border-border/10">
        {selectedAsset && messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto scrollbar-hide">
            {assetActions.map(action => (
              <button
                key={action.label}
                onClick={() => send(action.prompt(selectedAsset.pair))}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-secondary/40 border border-border/10 text-[13px] font-mono hover:bg-secondary/70 transition-all whitespace-nowrap"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder={selectedAsset ? `اسأل عن ${selectedAsset.pair}...` : "اكتب سؤالك..."}
            className="flex-1 bg-secondary/40 border border-border/20 rounded-xl px-4 py-2.5 text-[13px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
            dir="rtl"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/50 text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
