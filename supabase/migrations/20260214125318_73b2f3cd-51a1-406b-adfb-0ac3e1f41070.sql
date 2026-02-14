
-- Add credits column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 20;

-- Add subscription_tier to profiles for quick access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'guest';

-- Create credit transactions table for history
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL, -- negative = spent, positive = added
  action text NOT NULL, -- 'chart_analysis', 'chat_session', 'reveal_signal', 'purchase', 'signup_bonus'
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_transactions
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a secure function to spend credits (prevents race conditions)
CREATE OR REPLACE FUNCTION public.spend_credits(_user_id uuid, _amount integer, _action text, _description text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_credits integer;
  user_tier text;
BEGIN
  -- Get current credits and tier
  SELECT credits, subscription_tier INTO current_credits, user_tier
  FROM public.profiles
  WHERE user_id = _user_id
  FOR UPDATE;

  -- Founders get free access
  IF user_tier = 'founder' THEN
    -- Still log the transaction but with 0 cost
    INSERT INTO public.credit_transactions (user_id, amount, action, description)
    VALUES (_user_id, 0, _action, _description || ' (Founder - مجاني)');
    RETURN true;
  END IF;

  -- Check sufficient credits
  IF current_credits < _amount THEN
    RETURN false;
  END IF;

  -- Deduct credits
  UPDATE public.profiles
  SET credits = credits - _amount
  WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (_user_id, -_amount, _action, _description);

  RETURN true;
END;
$$;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(_user_id uuid, _amount integer, _action text, _description text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + _amount
  WHERE user_id = _user_id;

  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (_user_id, _amount, _action, _description);
END;
$$;

-- Function to get user tier based on active subscription
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT 
      CASE 
        WHEN sp.name = 'yearly' THEN 'founder'
        WHEN sp.name IN ('monthly', 'quarterly') THEN 'alpha'
        ELSE 'guest'
      END
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = _user_id
      AND us.status = 'active'
      AND us.expires_at > now()
    ORDER BY us.expires_at DESC
    LIMIT 1),
    'guest'
  );
$$;
