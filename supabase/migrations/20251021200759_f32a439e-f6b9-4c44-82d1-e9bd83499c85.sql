-- Drop all budget-related tables
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.savings_goals CASCADE;
DROP TABLE IF EXISTS public.cashflow_records CASCADE;
DROP TABLE IF EXISTS public.budget_plans CASCADE;

-- Keep only App Hub tables:
-- organizations, organization_members, apps, app_access, profiles, user_roles