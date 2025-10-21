-- Drop the restrictive insert policy on organizations
DROP POLICY IF EXISTS "Admins can insert organizations" ON public.organizations;

-- Allow any authenticated user to create an organization
-- They will automatically become the owner through organization_members
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also fix the organization_members insert policy
-- New org creators need to be able to add themselves as owners
DROP POLICY IF EXISTS "Owners and admins can insert memberships" ON public.organization_members;

CREATE POLICY "Users can add themselves to new orgs"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    has_min_org_role(auth.uid(), organization_id, 'admin')
  );