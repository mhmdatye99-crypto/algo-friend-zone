import { useEffect, useRef } from "react";
import type { AIMessageModel } from "@/contexts/NexusAIContext";
import AIMessage from "./AIMessage";
import AIThinkingState from "./AIThinkingState";

interface Props {
  messages: AIMessageModel[];
  busy: boolean;
  busyLabel?: string;
}

const AIConversation = ({ messages, busy, busyLabel }: Props) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  return (
    <div className="px-4 py-4 space-y-5">
      {messages.map((m) => (
        <AIMessage key={m.id} message={m} />
      ))}
      {busy && <AIThinkingState label={busyLabel} />}
      <div ref={endRef} />
    </div>
  );
};

export default AIConversation;
