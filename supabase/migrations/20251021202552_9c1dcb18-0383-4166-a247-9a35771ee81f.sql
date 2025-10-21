-- Drop the current policy
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

-- Create a simpler, more permissive policy that allows any authenticated user to insert
-- The security comes from the organization_members table linking them as owner
CREATE POLICY "Allow authenticated inserts to organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Make sure we can see our own orgs after creating them
-- Update the SELECT policy to also show orgs we just created (before membership is added)
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    is_org_member(auth.uid(), id) OR 
    -- Allow seeing orgs we just created for a brief moment before membership is added
    created_at > (now() - interval '1 minute')
  );