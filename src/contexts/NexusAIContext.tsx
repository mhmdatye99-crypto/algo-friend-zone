import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AIAnalysisResult } from "@/components/analysis/types";

export interface NexusAIContextPayload {
  /** Where the assistant was opened from, e.g. "الأسواق" or "تحليل شارت" */
  source?: string;
  asset?: string;
  price?: string | number;
  timeframe?: string;
  signalId?: string;
  signalSummary?: string;
  analysisSummary?: string;
}

export interface AIMessageModel {
  id: string;
  role: "user" | "assistant";
  text?: string;
  image?: string | null;
  analysis?: AIAnalysisResult | null;
  error?: boolean;
}

interface NexusAIState {
  open: boolean;
  context: NexusAIContextPayload | null;
  messages: AIMessageModel[];
  pendingAction: "chart" | null;
  openAI: (ctx?: NexusAIContextPayload, action?: "chart") => void;
  closeAI: () => void;
  clearPendingAction: () => void;
  setMessages: React.Dispatch<React.SetStateAction<AIMessageModel[]>>;
  resetConversation: () => void;
}

const Ctx = createContext<NexusAIState | null>(null);

export const NexusAIProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<NexusAIContextPayload | null>(null);
  const [messages, setMessages] = useState<AIMessageModel[]>([]);
  const [pendingAction, setPendingAction] = useState<"chart" | null>(null);

  const openAI = useCallback((ctx?: NexusAIContextPayload, action?: "chart") => {
    setContext(ctx ?? null);
    if (action) setPendingAction(action);
    setOpen(true);
  }, []);

  const closeAI = useCallback(() => setOpen(false), []);
  const clearPendingAction = useCallback(() => setPendingAction(null), []);
  const resetConversation = useCallback(() => setMessages([]), []);

  const value = useMemo(
    () => ({
      open,
      context,
      messages,
      pendingAction,
      openAI,
      closeAI,
      clearPendingAction,
      setMessages,
      resetConversation,
    }),
    [open, context, messages, pendingAction, openAI, closeAI, clearPendingAction, resetConversation]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useNexusAI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNexusAI must be used inside NexusAIProvider");
  return v;
};
