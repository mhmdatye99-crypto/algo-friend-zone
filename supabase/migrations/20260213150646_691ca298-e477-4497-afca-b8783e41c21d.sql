
-- Financial Goals table
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  initial_capital NUMERIC NOT NULL,
  target_goal NUMERIC NOT NULL,
  risk_appetite TEXT NOT NULL DEFAULT 'conservative',
  current_balance NUMERIC NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  expert_title TEXT NOT NULL DEFAULT 'مبتدئ',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  target_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_goals_updated_at
BEFORE UPDATE ON public.financial_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Goal daily entries (profit logging)
CREATE TABLE public.goal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  note TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries" ON public.goal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON public.goal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.goal_entries FOR DELETE USING (auth.uid() = user_id);
