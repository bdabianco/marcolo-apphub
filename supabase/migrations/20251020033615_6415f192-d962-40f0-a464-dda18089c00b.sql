-- Add assets column to cashflow_records table
ALTER TABLE public.cashflow_records
ADD COLUMN IF NOT EXISTS assets jsonb DEFAULT '[]'::jsonb;