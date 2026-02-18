import { motion } from "framer-motion";
import { Lock, Crown, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  featureName: string;
  children: React.ReactNode;
  className?: string;
}

export const SubscriptionGate = ({ featureName, children, className }: Props) => {
  // DEV MODE: All features unlocked during development
  return <div className={className}>{children}</div>;
};
