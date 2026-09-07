import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { useNexusAI, type AIMessageModel } from "@/contexts/NexusAIContext";
import type { AIAnalysisResult } from "@/components/analysis/types";
import AIOrb from "./AIOrb";
import AIConversation from "./AIConversation";
import AIQuickActions, { type QuickActionId } from "./AIQuickActions";
import AIComposer, { type AIComposerHandle } from "./AIComposer";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexus-ai`;

const uid = () => Math.random().toString(36).slice(2);

const NexusAIFullscreen = () => {
  const { open, closeAI, context, messages, setMessages, resetConversation, pendingAction, clearPendingAction } =
    useNexusAI();
  const { spendCredits, canAfford, isFounder } = useCredits();
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | undefined>();
  const composerRef = useRef<AIComposerHandle>(null);

  // Lock background scroll while fullscreen
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open && pendingAction === "chart") {
      clearPendingAction();
      setTimeout(() => composerRef.current?.pickImage(), 250);
    }
  }, [open, pendingAction, clearPendingAction]);

  const streamChat = useCallback(
    async (history: { role: "user" | "assistant"; content: string }[]) => {
      setBusy(true);
      setBusyLabel("NEXUS AI يفكّر");
      let soFar = "";
      const id = uid();

      try {
        const res = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: history, context: context ?? undefined }),
        });

        if (!res.ok || !res.body) {
          const info = await res.json().catch(() => null);
          throw new Error(info?.error || "تعذّر الوصول إلى NEXUS AI");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
              if (!delta) continue;
              soFar += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.id === id) {
                  return prev.map((m) => (m.id === id ? { ...m, text: soFar } : m));
                }
                return [...prev, { id, role: "assistant", text: soFar }];
              });
            } catch {
              /* partial chunk */
            }
          }
        }

        if (!soFar) {
          setMessages((prev) => [
            ...prev,
            { id, role: "assistant", text: "لم يصل رد من NEXUS AI. حاول مرة أخرى.", error: true },
          ]);
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: e instanceof Error ? e.message : "حدث خطأ غير متوقع.",
            error: true,
          },
        ]);
      } finally {
        setBusy(false);
        setBusyLabel(undefined);
      }
    },
    [context, setMessages]
  );

  const runChartAnalysis = useCallback(
    async (image: string, note?: string) => {
      if (!isFounder && !canAfford(CREDIT_COSTS.chart_analysis)) {
        toast.error("رصيد غير كافٍ");
        return;
      }
      if (!isFounder) {
        const ok = await spendCredits(CREDIT_COSTS.chart_analysis, "chart_analysis", "تحليل شارت AI");
        if (!ok) return;
      }

      setBusy(true);
      setBusyLabel("جارٍ قراءة الشارت");
      try {
        const { data, error } = await supabase.functions.invoke("analyze-chart", {
          body: { imageBase64: image, question: note || undefined },
        });
        if (error) throw error;
        const result = data as AIAnalysisResult;
        if (result?.error) {
          setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: result.error!, error: true }]);
          return;
        }
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", analysis: result }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "assistant", text: "فشل تحليل الصورة. حاول مرة أخرى.", error: true },
        ]);
      } finally {
        setBusy(false);
        setBusyLabel(undefined);
      }
    },
    [canAfford, isFounder, setMessages, spendCredits]
  );

  const handleSend = useCallback(
    async ({ text, image }: { text: string; image: string | null }) => {
      const userMsg: AIMessageModel = { id: uid(), role: "user", text: text || undefined, image };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);

      if (image) {
        await runChartAnalysis(image, text);
        return;
      }

      const history = nextMessages
        .filter((m) => m.text)
        .map((m) => ({ role: m.role, content: m.text as string }));
      await streamChat(history);
    },
    [messages, runChartAnalysis, setMessages, streamChat]
  );

  const handleQuickAction = useCallback(
    (id: QuickActionId) => {
      if (id === "chart") {
        composerRef.current?.pickImage();
        return;
      }
      const prompts: Record<Exclude<QuickActionId, "chart">, string> = {
        market: "أعطني قراءة موجزة لحالة السوق الآن مع أهم المخاطر.",
        signal: context?.signalId
          ? "اشرح لي منطق هذه الإشارة: لماذا هذا الدخول ووقف الخسارة والأهداف؟"
          : "اشرح لي كيف أقرأ الإشارة وأقيّم جودتها قبل الدخول.",
        asset: context?.asset
          ? `اشرح لي سلوك ${context.asset} حالياً: الاتجاه، الدعم والمقاومة، وما الذي يبطل السيناريو؟`
          : "اشرح لي كيف أحلل أي أصل خطوة بخطوة.",
      };
      handleSend({ text: prompts[id], image: null });
    },
    [context, handleSend]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[90] bg-background flex flex-col"
          dir="rtl"
          role="dialog"
          aria-label="NEXUS AI"
        >
          <header className="flex items-center justify-between gap-3 px-4 h-14 border-b border-border shrink-0 pt-[env(safe-area-inset-top)]">
            <button onClick={closeAI} aria-label="إغلاق" className="w-11 h-11 -mr-2 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <p className="text-[17px] font-semibold text-foreground">NEXUS AI</p>
            <button
              onClick={resetConversation}
              aria-label="محادثة جديدة"
              className="w-11 h-11 -ml-2 flex items-center justify-center text-muted-foreground hover:text-primary"
            >
              <Plus className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {messages.length === 0 ? (
              <div className="px-4 py-8 space-y-6 max-w-lg mx-auto">
                <div className="flex flex-col items-center text-center gap-4">
                  <AIOrb size={112} active={busy} />
                  <div className="space-y-1.5">
                    <h1 className="nx-section">مرحباً، أنا NEXUS AI</h1>
                    <p className="nx-body text-muted-foreground">
                      اسألني عن السوق، أو أرسل صورة شارت لتحليلها.
                    </p>
                    {context?.asset && (
                      <p className="nx-meta nx-ltr text-primary">{context.asset}</p>
                    )}
                  </div>
                </div>
                <AIQuickActions onSelect={handleQuickAction} />
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <AIConversation messages={messages} busy={busy} busyLabel={busyLabel} />
              </div>
            )}
          </div>

          <div className="shrink-0">
            <div className="max-w-lg mx-auto">
              <AIComposer ref={composerRef} disabled={busy} onSend={handleSend} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NexusAIFullscreen;
