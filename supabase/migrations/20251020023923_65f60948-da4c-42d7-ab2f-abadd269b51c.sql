-- Add project_type column to budget_plans table
ALTER TABLE public.budget_plans
ADD COLUMN project_type text NOT NULL DEFAULT 'personal' CHECK (project_type IN ('personal', 'business'));