import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrgMember {
  id: string;
  user_id: string;
  role: string;
  full_name?: string;
}

const SettingsContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization, userOrganizations, memberRole, refreshOrganizations } = useOrganization();
  
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [creating, setCreating] = useState(false);
  
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name);
      setOrgSlug(currentOrganization.slug);
      setOrgDescription(currentOrganization.description || '');
      loadMembers();
    }
  }, [currentOrganization]);

  const loadMembers = async () => {
    if (!currentOrganization) return;
    
    setLoadingMembers(true);
    try {
      const { data: membersData, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      // Fetch profiles separately
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);
        
        const enrichedMembers = membersData.map(m => ({
          ...m,
          full_name: profilesMap.get(m.user_id) || undefined,
        }));
        
        setMembers(enrichedMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim() || !newOrgSlug.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: newOrgSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add current user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user?.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast.success('Organization created successfully');
      await refreshOrganizations();
      setNewOrgName('');
      setNewOrgSlug('');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!currentOrganization || memberRole !== 'owner') return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgName,
          slug: orgSlug,
          description: orgDescription,
        })
        .eq('id', currentOrganization.id);

      if (error) throw error;

      toast.success('Organization updated successfully');
      await refreshOrganizations();
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast.error(error.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-primary text-primary-foreground',
      admin: 'bg-secondary text-secondary-foreground',
      member: 'bg-accent text-accent-foreground',
      viewer: 'bg-muted text-muted-foreground',
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/app-hub')}
              className="mb-4"
            >
              <Icons.ArrowLeft className="mr-2 h-4 w-4" />
              Back to App Hub
            </Button>
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your organization and team settings
            </p>
          </div>

          {/* Create Organization */}
          {!currentOrganization && userOrganizations.length === 0 && (
            <Card className="mb-8 rounded-[2rem] border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Create Your Organization</CardTitle>
                <CardDescription>
                  Get started by creating your first organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newOrgName">Organization Name</Label>
                  <Input
                    id="newOrgName"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newOrgSlug">Slug (URL-friendly)</Label>
                  <Input
                    id="newOrgSlug"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    placeholder="acme-inc"
                  />
                </div>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? 'Creating...' : 'Create Organization'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organization Details */}
          {currentOrganization && (
            <>
              <Card className="mb-8 rounded-[2rem] border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Organization Details</CardTitle>
                      <CardDescription>
                        Manage your organization information
                      </CardDescription>
                    </div>
                    <Badge className={getRoleBadge(memberRole || '')}>
                      {memberRole?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      disabled={memberRole !== 'owner'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">Slug</Label>
                    <Input
                      id="orgSlug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      disabled={memberRole !== 'owner'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgDescription">Description</Label>
                    <Textarea
                      id="orgDescription"
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      disabled={memberRole !== 'owner'}
                      rows={3}
                    />
                  </div>
                  {memberRole === 'owner' && (
                    <Button
                      onClick={handleSaveOrganization}
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="rounded-[2rem] border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Manage your organization members
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingMembers ? (
                    <div className="text-center py-8">
                      <Icons.Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No members found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icons.User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.full_name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.user_id === user?.id && '(You)'}
                              </p>
                            </div>
                          </div>
                          <Badge className={getRoleBadge(member.role)}>
                            {member.role.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
};

export default Settings;
