-- =============================================
-- ЛИЧНЫЙ ПЛАНИРОВЩИК - СХЕМА БД SUPABASE
-- =============================================

-- Включаем Row Level Security для безопасности
-- Каждый пользователь видит только свои данные

-- =============================================
-- 1. СФЕРЫ ЖИЗНИ
-- =============================================
CREATE TABLE spheres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '⭐',
  color TEXT DEFAULT '#C9A861',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spheres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spheres" ON spheres
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spheres" ON spheres
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spheres" ON spheres
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spheres" ON spheres
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 2. МЕЧТЫ
-- =============================================
CREATE TABLE dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sphere_id UUID REFERENCES spheres(id) ON DELETE SET NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'archived')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dreams" ON dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON dreams
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. ЦЕЛИ
-- =============================================
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  dream_id UUID REFERENCES dreams(id) ON DELETE SET NULL,
  sphere_id UUID REFERENCES spheres(id) ON DELETE SET NULL,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. РУБЕЖИ (ТАКТИКА)
-- =============================================
CREATE TABLE steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own steps" ON steps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps" ON steps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steps" ON steps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own steps" ON steps
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 5. ДЕЙСТВИЯ (ЗАДАЧИ)
-- =============================================
CREATE TABLE actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  deadline TIMESTAMPTZ,
  priority TEXT DEFAULT 'not_important' CHECK (priority IN ('can_wait', 'not_important', 'important', 'critical', 'urgent')),
  strength TEXT DEFAULT 'neutral' CHECK (strength IN ('positive', 'neutral', 'negative')),
  step_id UUID REFERENCES steps(id) ON DELETE SET NULL,
  sphere_id UUID REFERENCES spheres(id) ON DELETE SET NULL,
  repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'weekdays', 'custom')),
  repeat_interval INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'done', 'cancelled')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions" ON actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions" ON actions
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. ПОДЗАДАЧИ
-- =============================================
CREATE TABLE subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subtasks" ON subtasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks" ON subtasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks" ON subtasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks" ON subtasks
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. ВИДЫ ДЕЯТЕЛЬНОСТИ (ВРЕМЯ)
-- =============================================
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💼',
  color TEXT DEFAULT '#4A90D9',
  is_favorite BOOLEAN DEFAULT FALSE,
  daily_goal INTEGER,
  weekly_goals JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON activities
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. СЕССИИ (ТРЕКЕР ВРЕМЕНИ)
-- =============================================
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 9. КАТЕГОРИИ ФИНАНСОВ
-- =============================================
CREATE TABLE finance_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT '📦',
  color TEXT DEFAULT '#95A5A6',
  is_archived BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance_categories" ON finance_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own finance_categories" ON finance_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own finance_categories" ON finance_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own finance_categories" ON finance_categories
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 10. ФОНДЫ
-- =============================================
CREATE TABLE funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🛡️',
  balance DECIMAL(15,2) DEFAULT 0,
  rule_type TEXT DEFAULT 'percent' CHECK (rule_type IN ('percent', 'fixed', 'choice')),
  rule_value DECIMAL(15,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own funds" ON funds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funds" ON funds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funds" ON funds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own funds" ON funds
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 11. ТРАНЗАКЦИИ
-- =============================================
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  fund_id UUID REFERENCES funds(id) ON DELETE SET NULL,
  comment TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 12. БЮДЖЕТЫ
-- =============================================
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES finance_categories(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
  limit_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, year, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 13. НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
-- =============================================
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pin_hash TEXT,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =============================================
CREATE INDEX idx_dreams_user ON dreams(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_dream ON goals(dream_id);
CREATE INDEX idx_steps_user ON steps(user_id);
CREATE INDEX idx_steps_goal ON steps(goal_id);
CREATE INDEX idx_actions_user ON actions(user_id);
CREATE INDEX idx_actions_date ON actions(date);
CREATE INDEX idx_actions_step ON actions(step_id);
CREATE INDEX idx_subtasks_action ON subtasks(action_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_activity ON sessions(activity_id);
CREATE INDEX idx_finance_categories_user ON finance_categories(user_id);
CREATE INDEX idx_funds_user ON funds(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_budgets_user ON budgets(user_id);

-- =============================================
-- ГОТОВО!
-- =============================================
