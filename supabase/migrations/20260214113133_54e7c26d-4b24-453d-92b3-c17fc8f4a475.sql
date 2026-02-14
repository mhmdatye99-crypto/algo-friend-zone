
CREATE TABLE public.saved_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pair TEXT NOT NULL,
  icon TEXT,
  price NUMERIC NOT NULL,
  direction TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 50,
  timeframe TEXT NOT NULL DEFAULT '4H',
  rsi INTEGER,
  macd TEXT,
  signal TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON public.saved_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analyses" ON public.saved_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.saved_analyses FOR DELETE USING (auth.uid() = user_id);
