import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  plan?: {
    name: string;
    name_ar: string;
    price: number;
    duration_days: number;
  };
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsSubscribed(false);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);

      // Check subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("*, plan:subscription_plans(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .maybeSingle();

      if (subData) {
        setSubscription({
          id: subData.id,
          plan_id: subData.plan_id,
          status: subData.status,
          starts_at: subData.starts_at,
          expires_at: subData.expires_at,
          plan: subData.plan as any,
        });
        setIsSubscribed(true);
      } else {
        setSubscription(null);
        setIsSubscribed(false);
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  return { subscription, isSubscribed, isAdmin, loading };
};
