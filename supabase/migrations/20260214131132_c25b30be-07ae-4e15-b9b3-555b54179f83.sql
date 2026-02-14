
-- Add reputation_points to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_points integer NOT NULL DEFAULT 0;

-- Create a public read policy for profiles (needed for leaderboard & community display names)
-- Drop existing restrictive select policy first, then create a permissive one
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Anyone authenticated can view profiles"
ON public.profiles
FOR SELECT
USING (true);
