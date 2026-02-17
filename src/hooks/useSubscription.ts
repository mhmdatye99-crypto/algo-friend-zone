import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Stripe product/price mapping
export const STRIPE_TIERS = {
  pro: {
    product_id: "prod_TzpbRE4fcLTxfJ",
    price_id: "price_1T1pwIDdvupKPnRUaAO6RleR",
    name: "X-Pro",
    name_ar: "إكس-برو",
    price: 29.99,
  },
  elite: {
    product_id: "prod_TzpbGerJPdqAZG",
    price_id: "price_1T1pwcDdvupKPnRUJLVyTNIk",
    name: "X-Elite",
    name_ar: "إكس-إيليت",
    price: 59.99,
  },
} as const;

export type StripeTier = "free" | "pro" | "elite";

interface StripeSubscription {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface LegacySubscription {
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
  const [subscription, setSubscription] = useState<LegacySubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stripeTier, setStripeTier] = useState<StripeTier>("free");
  const [stripeSubscriptionEnd, setStripeSubscriptionEnd] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const getTierFromProductId = (productId: string | null): StripeTier => {
    if (!productId) return "free";
    if (productId === STRIPE_TIERS.elite.product_id) return "elite";
    if (productId === STRIPE_TIERS.pro.product_id) return "pro";
    return "free";
  };

  const checkStripeSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      const result = data as StripeSubscription;
      if (result.subscribed) {
        const tier = getTierFromProductId(result.product_id);
        setStripeTier(tier);
        setStripeSubscriptionEnd(result.subscription_end);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.log("Stripe check failed, falling back to DB:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsSubscribed(false);
      setIsAdmin(false);
      setStripeTier("free");
      setStripeSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);

      // Check legacy DB subscription
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

      // Check Stripe subscription
      await checkStripeSubscription();

      setLoading(false);
    };

    fetchAll();

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkStripeSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkStripeSubscription]);

  const startCheckout = async (tier: "pro" | "elite") => {
    setCheckoutLoading(true);
    try {
      const priceId = STRIPE_TIERS[tier].price_id;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Portal error:", err);
    }
  };

  const isPro = stripeTier === "pro" || stripeTier === "elite" || isSubscribed;
  const isElite = stripeTier === "elite";

  return {
    subscription,
    isSubscribed: isPro,
    isAdmin,
    loading,
    stripeTier,
    stripeSubscriptionEnd,
    isPro,
    isElite,
    startCheckout,
    openCustomerPortal,
    checkoutLoading,
    refreshSubscription: checkStripeSubscription,
  };
};
