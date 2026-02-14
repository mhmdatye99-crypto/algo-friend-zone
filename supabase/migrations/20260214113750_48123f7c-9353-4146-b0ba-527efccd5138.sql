
-- Add entry_reason, strategy, and analysis_id columns to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS entry_reason text,
ADD COLUMN IF NOT EXISTS strategy text,
ADD COLUMN IF NOT EXISTS analysis_id uuid REFERENCES public.saved_analyses(id) ON DELETE SET NULL;
