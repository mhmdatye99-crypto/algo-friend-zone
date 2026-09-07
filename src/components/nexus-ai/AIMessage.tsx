import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AIMessageModel } from "@/contexts/NexusAIContext";
import ChartImageAttachment from "./ChartImageAttachment";
import AIAnalysisResultCard from "./AIAnalysisResultCard";

const AIMessage = ({ message }: { message: AIMessageModel }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex flex-col gap-2", isUser ? "items-start" : "items-stretch")}
    >
      {!isUser && <p className="nx-meta text-primary font-semibold">NEXUS AI</p>}

      {message.image && (
        <ChartImageAttachment src={message.image} compact={!isUser} />
      )}

      {message.text && (
        <div
          className={cn(
            isUser
              ? "bg-secondary border border-border rounded-xl px-4 py-3 max-w-[85%]"
              : "w-full"
          )}
        >
          <p
            className={cn(
              "text-[16px] leading-[1.85] whitespace-pre-wrap",
              message.error ? "text-destructive" : "text-foreground"
            )}
          >
            {message.text}
          </p>
        </div>
      )}

      {message.analysis && <AIAnalysisResultCard analysis={message.analysis} />}
    </motion.div>
  );
};

export default AIMessage;
