-- Update Budget App to Mycashflow App
UPDATE public.apps 
SET 
  name = 'Mycashflow App',
  url = 'https://mycashflow.marcoloai.com',
  slug = 'mycashflow-app',
  updated_at = now()
WHERE slug = 'budget-app';