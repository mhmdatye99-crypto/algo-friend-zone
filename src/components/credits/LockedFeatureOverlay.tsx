import { ReactNode } from "react";

interface Props {
  cost: number;
  featureName: string;
  featureDescription?: string;
  onUnlock: () => void;
  children: ReactNode;
  locked: boolean;
  compact?: boolean;
}

export const LockedFeatureOverlay = ({ children }: Props) => {
  // DEV MODE: All features unlocked during development
  return <>{children}</>;
};
