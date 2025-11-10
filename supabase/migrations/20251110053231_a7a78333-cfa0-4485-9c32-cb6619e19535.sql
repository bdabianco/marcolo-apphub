-- Update RLS policy to allow public viewing of active apps
DROP POLICY IF EXISTS "Authenticated users can view active apps" ON apps;

CREATE POLICY "Anyone can view active apps" 
ON apps 
FOR SELECT 
USING (is_active = true);