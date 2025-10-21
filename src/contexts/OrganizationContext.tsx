import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  settings?: any;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  memberRole: string | null;
  loading: boolean;
  switchOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrganizations = async () => {
    if (!user) {
      setUserOrganizations([]);
      setCurrentOrganization(null);
      setMemberRole(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user's organizations through memberships
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const orgs = memberships?.map(m => m.organizations).filter(Boolean) as Organization[] || [];
      setUserOrganizations(orgs);

      // Set current org from localStorage or first org
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      let currentOrg = orgs.find(o => o.id === savedOrgId) || orgs[0] || null;
      
      setCurrentOrganization(currentOrg);

      // Get user's role in current org
      if (currentOrg) {
        const membership = memberships?.find(m => m.organization_id === currentOrg.id);
        setMemberRole(membership?.role || null);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [user]);

  const switchOrganization = (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);
    }
  };

  const refreshOrganizations = async () => {
    setLoading(true);
    await loadOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        userOrganizations,
        memberRole,
        loading,
        switchOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
