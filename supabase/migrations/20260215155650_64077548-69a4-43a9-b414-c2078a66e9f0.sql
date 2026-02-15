
-- Trading Challenges definitions
CREATE TABLE public.trading_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL DEFAULT 'discipline',
  target_value integer NOT NULL DEFAULT 7,
  metric text NOT NULL DEFAULT 'days',
  icon text DEFAULT '🎯',
  badge_name text NOT NULL DEFAULT 'Challenge Complete',
  badge_name_ar text NOT NULL DEFAULT 'تحدي مكتمل',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trading_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view challenges"
  ON public.trading_challenges FOR SELECT
  USING (true);

-- Insert default challenges
INSERT INTO public.trading_challenges (name, name_ar, description, challenge_type, target_value, metric, icon, badge_name, badge_name_ar) VALUES
('7-Day Discipline', 'تحدي الانضباط 7 أيام', 'حافظ على درجة انضباط 70+ لمدة 7 أيام متتالية', 'discipline', 7, 'days', '🛡️', 'Discipline Shield', 'درع الانضباط'),
('30 Trades Consistency', 'تحدي 30 صفقة متناسقة', 'أكمل 30 صفقة مع الالتزام بخطة التداول المختارة', 'consistency', 30, 'trades', '🎯', 'Consistency Master', 'سيد الثبات'),
('5% Monthly Growth', 'تحدي نمو 5% شهري', 'حقق نمو 5% في محفظتك خلال شهر واحد', 'growth', 5, 'percent', '📈', 'Growth Champion', 'بطل النمو'),
('Risk Management Master', 'سيد إدارة المخاطر', 'نفّذ 20 صفقة متتالية بوقف خسارة محترم', 'risk', 20, 'trades', '🔒', 'Risk Guardian', 'حارس المخاطر');

-- User challenge participation
CREATE TABLE public.user_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.trading_challenges(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  progress integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own challenges" ON public.user_challenges FOR DELETE USING (auth.uid() = user_id);

-- Discipline scores
CREATE TABLE public.discipline_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 50,
  sl_respect integer NOT NULL DEFAULT 50,
  risk_adherence integer NOT NULL DEFAULT 50,
  no_overtrading integer NOT NULL DEFAULT 50,
  plan_following integer NOT NULL DEFAULT 50,
  consistency integer NOT NULL DEFAULT 50,
  score_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

ALTER TABLE public.discipline_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.discipline_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.discipline_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.discipline_scores FOR UPDATE USING (auth.uid() = user_id);

-- Trading plans
CREATE TABLE public.trading_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  description text NOT NULL,
  risk_per_trade numeric NOT NULL DEFAULT 1,
  max_daily_trades integer NOT NULL DEFAULT 3,
  min_rr_ratio numeric NOT NULL DEFAULT 2,
  max_daily_loss_percent numeric NOT NULL DEFAULT 3,
  plan_type text NOT NULL DEFAULT 'conservative',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view plans" ON public.trading_plans FOR SELECT USING (true);

INSERT INTO public.trading_plans (name, name_ar, description, risk_per_trade, max_daily_trades, min_rr_ratio, max_daily_loss_percent, plan_type) VALUES
('Conservative', 'خطة محافظة', 'مخاطرة منخفضة مع تركيز على الحفاظ على رأس المال. مثالية للمبتدئين.', 1, 2, 3, 2, 'conservative'),
('Moderate Growth', 'خطة النمو المعتدل', 'توازن بين المخاطرة والعائد. مناسبة للمتداولين المتوسطين.', 2, 3, 2, 4, 'moderate'),
('Advanced', 'خطة متقدمة', 'مخاطرة أعلى مع أهداف نمو أكبر. للمتداولين الخبراء فقط.', 3, 5, 1.5, 6, 'advanced');

-- User selected plan
CREATE TABLE public.user_trading_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.trading_plans(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  selected_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

ALTER TABLE public.user_trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan" ON public.user_trading_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can select plan" ON public.user_trading_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plan" ON public.user_trading_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plan" ON public.user_trading_plans FOR DELETE USING (auth.uid() = user_id);

-- Earned badges
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_name text NOT NULL,
  badge_name_ar text NOT NULL,
  badge_icon text DEFAULT '🏆',
  challenge_id uuid REFERENCES public.trading_challenges(id),
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_name)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
