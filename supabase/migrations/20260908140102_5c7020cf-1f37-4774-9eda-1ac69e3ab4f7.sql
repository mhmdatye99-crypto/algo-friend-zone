ALTER TABLE public.saved_analyses
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'market',
  ADD COLUMN IF NOT EXISTS analysis jsonb,
  ADD COLUMN IF NOT EXISTS stop_loss text,
  ADD COLUMN IF NOT EXISTS take_profit1 text,
  ADD COLUMN IF NOT EXISTS take_profit2 text;
CREATE INDEX IF NOT EXISTS saved_analyses_user_source_idx ON public.saved_analyses (user_id, source, created_at DESC);