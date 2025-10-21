-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create org_role enum for organization-level roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create organization memberships table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(organization_id, user_id)
);

-- Create apps registry table
CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create app access control table
CREATE TABLE public.app_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(app_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_access ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Create security definer function to check org role
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role org_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- Create security definer function to check if user has minimum role level
CREATE OR REPLACE FUNCTION public.has_min_org_role(_user_id UUID, _org_id UUID, _min_role org_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND (
        (_min_role = 'viewer') OR
        (_min_role = 'member' AND role IN ('member', 'admin', 'owner')) OR
        (_min_role = 'admin' AND role IN ('admin', 'owner')) OR
        (_min_role = 'owner' AND role = 'owner')
      )
  )
$$;

-- RLS Policies for organizations
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (is_org_member(auth.uid(), id));

CREATE POLICY "Owners can update their organizations"
  ON public.organizations FOR UPDATE
  USING (has_org_role(auth.uid(), id, 'owner'));

CREATE POLICY "Admins can insert organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for organization_members
CREATE POLICY "Members can view their org memberships"
  ON public.organization_members FOR SELECT
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Owners and admins can insert memberships"
  ON public.organization_members FOR INSERT
  WITH CHECK (has_min_org_role(auth.uid(), organization_id, 'admin'));

CREATE POLICY "Owners and admins can update memberships"
  ON public.organization_members FOR UPDATE
  USING (has_min_org_role(auth.uid(), organization_id, 'admin'));

CREATE POLICY "Owners and admins can delete memberships"
  ON public.organization_members FOR DELETE
  USING (has_min_org_role(auth.uid(), organization_id, 'admin'));

-- RLS Policies for apps (public read for authenticated users)
CREATE POLICY "Authenticated users can view active apps"
  ON public.apps FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage apps"
  ON public.apps FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for app_access
CREATE POLICY "Members can view their org's app access"
  ON public.app_access FOR SELECT
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage app access"
  ON public.app_access FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial app: Budget App
INSERT INTO public.apps (name, slug, description, icon, category, url, sort_order)
VALUES (
  'Budget App',
  'budget-app',
  'Comprehensive financial planning tool for personal and business budgets with AI-powered insights',
  'DollarSign',
  'Finance',
  'https://budget.marcoloai.com',
  1
);