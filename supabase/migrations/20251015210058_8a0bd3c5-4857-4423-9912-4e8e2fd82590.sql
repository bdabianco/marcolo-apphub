-- Drop the existing check constraint
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_asset_type_check;

-- Add a new check constraint with all the asset types we need
ALTER TABLE public.assets 
ADD CONSTRAINT assets_asset_type_check 
CHECK (asset_type IN ('property', 'tfsa', 'rrsp', 'group_retirement', 'other_investment'));