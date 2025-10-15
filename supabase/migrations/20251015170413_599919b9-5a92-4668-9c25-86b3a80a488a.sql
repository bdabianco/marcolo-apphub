-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create budget_plans table
CREATE TABLE public.budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL DEFAULT 'My Budget',
  gross_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  federal_tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  provincial_tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  cpp DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ei DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expenses JSONB NOT NULL DEFAULT '[]',
  total_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  surplus DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on budget_plans
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

-- Budget plans policies
CREATE POLICY "Users can view their own budget plans"
  ON public.budget_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget plans"
  ON public.budget_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget plans"
  ON public.budget_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget plans"
  ON public.budget_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create cashflow_records table
CREATE TABLE public.cashflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  debts JSONB NOT NULL DEFAULT '[]',
  total_debt DECIMAL(12, 2) NOT NULL DEFAULT 0,
  monthly_debt_payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  available_cashflow DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on cashflow_records
ALTER TABLE public.cashflow_records ENABLE ROW LEVEL SECURITY;

-- Cashflow records policies
CREATE POLICY "Users can view their own cashflow records"
  ON public.cashflow_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cashflow records"
  ON public.cashflow_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cashflow records"
  ON public.cashflow_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cashflow records"
  ON public.cashflow_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create savings_goals table
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  monthly_contribution DECIMAL(12, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Savings goals policies
CREATE POLICY "Users can view their own savings goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers for all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_plans_updated_at
  BEFORE UPDATE ON public.budget_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashflow_records_updated_at
  BEFORE UPDATE ON public.cashflow_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();