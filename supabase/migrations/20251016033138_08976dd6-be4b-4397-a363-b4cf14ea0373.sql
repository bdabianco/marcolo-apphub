-- Add budget_plan_id to assets table for proper multi-tenancy
ALTER TABLE public.assets 
ADD COLUMN budget_plan_id uuid REFERENCES public.budget_plans(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_assets_budget_plan_id ON public.assets(budget_plan_id);

-- Migrate existing assets to their user's first budget plan
UPDATE public.assets a
SET budget_plan_id = (
  SELECT id 
  FROM public.budget_plans bp 
  WHERE bp.user_id = a.user_id 
  ORDER BY bp.created_at ASC 
  LIMIT 1
)
WHERE budget_plan_id IS NULL;