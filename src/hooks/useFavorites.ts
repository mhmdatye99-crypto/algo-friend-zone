import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) { setFavorites(new Set()); setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("favorite_assets")
        .select("pair")
        .eq("user_id", userId);
      setFavorites(new Set((data || []).map(d => d.pair)));
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const toggle = useCallback(async (pair: string) => {
    if (!userId) return;
    const isFav = favorites.has(pair);
    if (isFav) {
      setFavorites(prev => { const n = new Set(prev); n.delete(pair); return n; });
      await supabase.from("favorite_assets").delete().eq("user_id", userId).eq("pair", pair);
    } else {
      setFavorites(prev => new Set(prev).add(pair));
      await supabase.from("favorite_assets").insert({ user_id: userId, pair });
    }
  }, [userId, favorites]);

  return { favorites, toggle, loading, isLoggedIn: !!userId };
};
