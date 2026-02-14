
-- Add outcome tracking columns to community_posts
ALTER TABLE public.community_posts
  ADD COLUMN outcome TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN price_at_post NUMERIC,
  ADD COLUMN outcome_price NUMERIC,
  ADD COLUMN outcome_checked_at TIMESTAMP WITH TIME ZONE;

-- Add index for pending outcomes
CREATE INDEX idx_community_posts_outcome ON public.community_posts(outcome, created_at);
