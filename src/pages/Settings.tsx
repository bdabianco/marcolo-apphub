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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OrgMember {
  id: string;
  user_id: string;
  role: string;
  full_name?: string;
}

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface AppAccess {
  id: string;
  app_id: string;
  is_enabled: boolean;
  apps: App;
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
  const [slugError, setSlugError] = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const [appAccess, setAppAccess] = useState<AppAccess[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingApp, setUpdatingApp] = useState<string | null>(null);

  // Admin app management
  const [isAdmin, setIsAdmin] = useState(false);
  const [allApps, setAllApps] = useState<App[]>([]);
  const [loadingAllApps, setLoadingAllApps] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [appFormData, setAppFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    category: '',
    url: '',
    is_active: true,
  });

  // Auto-generate slug from organization name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Validate slug
  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError('Slug is required');
      return false;
    }
    if (slug.length < 3) {
      setSlugError('Slug must be at least 3 characters');
      return false;
    }
    if (slug.length > 50) {
      setSlugError('Slug must be less than 50 characters');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    if (slug.startsWith('-') || slug.endsWith('-')) {
      setSlugError('Slug cannot start or end with a hyphen');
      return false;
    }
    setSlugError('');
    return true;
  };

  // Handle org name change and auto-generate slug
  const handleNewOrgNameChange = (name: string) => {
    setNewOrgName(name);
    const generatedSlug = generateSlug(name);
    setNewOrgSlug(generatedSlug);
    validateSlug(generatedSlug);
  };

  // Handle manual slug change
  const handleNewOrgSlugChange = (slug: string) => {
    const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setNewOrgSlug(cleanedSlug);
    validateSlug(cleanedSlug);
  };

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name);
      setOrgSlug(currentOrganization.slug);
      setOrgDescription(currentOrganization.description || '');
      loadMembers();
      loadAppAccess();
    }
  }, [currentOrganization]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadAllApps();
    }
  }, [isAdmin]);

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
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an organization name",
        variant: "destructive",
      });
      return;
    }

    if (!validateSlug(newOrgSlug)) {
      toast({
        title: "Error",
        description: slugError || "Please fix the slug errors",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Debug: Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id);
      
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an organization",
          variant: "destructive",
        });
        setCreating(false);
        return;
      }

      // Check if slug already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', newOrgSlug)
        .maybeSingle();

      if (existingOrg) {
        toast({
          title: "Error",
          description: "This slug is already taken. Please choose a different one.",
          variant: "destructive",
        });
        setCreating(false);
        return;
      }

      console.log('Creating organization:', { name: newOrgName, slug: newOrgSlug });

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: newOrgSlug,
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization insert error:', orgError);
        throw orgError;
      }

      console.log('Organization created:', org);

      // Add current user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: session.user.id,
          role: 'owner',
        });

      if (memberError) {
        console.error('Member insert error:', memberError);
        throw memberError;
      }

      console.log('Member added successfully');

      toast({
        title: "Success",
        description: "Organization created successfully",
      });
      await refreshOrganizations();
      setNewOrgName('');
      setNewOrgSlug('');
      setSlugError('');
      setJustCreated(true);
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create organization',
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
      await refreshOrganizations();
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update organization',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadAppAccess = async () => {
    if (!currentOrganization) return;
    
    setLoadingApps(true);
    try {
      const { data, error } = await supabase
        .from('app_access')
        .select('*, apps(*)')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
      setAppAccess(data || []);
    } catch (error) {
      console.error('Error loading app access:', error);
      toast({
        title: "Error",
        description: "Failed to load app subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoadingApps(false);
    }
  };

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Load all apps (admin only)
  const loadAllApps = async () => {
    if (!isAdmin) return;
    
    setLoadingAllApps(true);
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAllApps(data || []);
    } catch (error) {
      console.error('Error loading all apps:', error);
      toast({
        title: "Error",
        description: "Failed to load apps",
        variant: "destructive",
      });
    } finally {
      setLoadingAllApps(false);
    }
  };

  // Handle app create/update
  const handleSaveApp = async () => {
    if (!isAdmin) return;

    try {
      if (editingApp) {
        // Update existing app
        const { error } = await supabase
          .from('apps')
          .update({
            name: appFormData.name,
            slug: appFormData.slug,
            description: appFormData.description,
            icon: appFormData.icon,
            category: appFormData.category,
            url: appFormData.url,
            is_active: appFormData.is_active,
          })
          .eq('id', editingApp.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "App updated successfully",
        });
      } else {
        // Create new app
        const { error } = await supabase
          .from('apps')
          .insert({
            name: appFormData.name,
            slug: appFormData.slug,
            description: appFormData.description,
            icon: appFormData.icon,
            category: appFormData.category,
            url: appFormData.url,
            is_active: appFormData.is_active,
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "App created successfully",
        });
      }

      setAppDialogOpen(false);
      setEditingApp(null);
      setAppFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        category: '',
        url: '',
        is_active: true,
      });
      loadAllApps();
    } catch (error: any) {
      console.error('Error saving app:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save app',
        variant: "destructive",
      });
    }
  };

  // Handle app edit
  const handleEditApp = (app: App) => {
    setEditingApp(app);
    setAppFormData({
      name: app.name,
      slug: (app as any).slug || '',
      description: app.description,
      icon: app.icon,
      category: app.category,
      url: (app as any).url || '',
      is_active: (app as any).is_active ?? true,
    });
    setAppDialogOpen(true);
  };

  // Handle new app
  const handleNewApp = () => {
    setEditingApp(null);
    setAppFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      category: '',
      url: '',
      is_active: true,
    });
    setAppDialogOpen(true);
  };

  const handleInviteMember = async () => {
    if (!currentOrganization || !inviteEmail.trim()) return;

    setInviting(true);
    try {
      // Check if user exists by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', inviteEmail); // Note: In production, you'd need a proper email lookup

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        toast({
          title: "User not found",
          description: "No user exists with this email. They need to sign up first.",
          variant: "destructive",
        });
        setInviting(false);
        return;
      }

      const userId = profiles[0].id;

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "This user is already a member of your organization.",
          variant: "destructive",
        });
        setInviting(false);
        return;
      }

      // Add member
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: currentOrganization.id,
          user_id: userId,
          role: inviteRole,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member added successfully",
      });
      
      setInviteEmail('');
      setInviteRole('member');
      setInviteDialogOpen(false);
      loadMembers();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!currentOrganization || memberUserId === user?.id) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed",
      });
      loadMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'owner' | 'admin' | 'member' | 'viewer') => {
    if (!currentOrganization) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated",
      });
      loadMembers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleToggleAppAccess = async (accessId: string, appId: string, currentState: boolean) => {
    if (!currentOrganization) return;

    setUpdatingApp(appId);
    try {
      const { error } = await supabase
        .from('app_access')
        .update({ is_enabled: !currentState })
        .eq('id', accessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `App ${!currentState ? 'enabled' : 'disabled'}`,
      });
      loadAppAccess();
    } catch (error: any) {
      console.error('Error updating app access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update app access",
        variant: "destructive",
      });
    } finally {
      setUpdatingApp(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="h-6 w-6" /> : <Icons.AppWindow className="h-6 w-6" />;
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

          {/* Success Card - Show after organization creation */}
          {justCreated && currentOrganization && (
            <Card className="mb-8 rounded-[2rem] border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
                    <Icons.CheckCircle2 className="h-10 w-10 text-primary" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      🎉 You're All Set!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-1">
                      <strong>{currentOrganization.name}</strong> is ready to go
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your apps are waiting for you in the App Hub
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <Button
                      size="lg"
                      onClick={() => navigate('/app-hub')}
                      className="flex-1"
                    >
                      <Icons.Rocket className="mr-2 h-5 w-5" />
                      Go to App Hub
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setJustCreated(false)}
                      className="flex-1"
                    >
                      Continue Setup
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      You can always return to settings to manage your organization and team
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Organization */}
          {!currentOrganization && userOrganizations.length === 0 && (
            <Card className="mb-8 rounded-[2rem] border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Create Your Organization</CardTitle>
                <CardDescription>
                  Get started by creating your organization. Don't have a company? Use your name or a personal identifier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-primary/5 border-primary/20">
                  <Icons.Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>For individuals:</strong> You can use your name (e.g., "John Smith Consulting") or a personal brand. 
                    This helps organize your apps and settings.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="newOrgName">Organization Name</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icons.HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Your company name, personal brand, or full name. This will be displayed throughout the App Hub.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="newOrgName"
                    value={newOrgName}
                    onChange={(e) => handleNewOrgNameChange(e.target.value)}
                    placeholder="e.g., Acme Inc. or John Smith"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Examples: "Acme Inc.", "Jane Doe Consulting", "Smith Family"
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="newOrgSlug">Slug (URL-friendly identifier)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icons.HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold mb-2">What is a slug?</p>
                          <p className="mb-2">A URL-friendly version of your organization name used in web addresses.</p>
                          <p className="mb-2"><strong>Rules:</strong></p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Lowercase letters only</li>
                            <li>Numbers and hyphens allowed</li>
                            <li>No spaces or special characters</li>
                            <li>3-50 characters long</li>
                          </ul>
                          <p className="mt-2 text-xs italic">Example: "Acme Inc." becomes "acme-inc"</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="newOrgSlug"
                      value={newOrgSlug}
                      onChange={(e) => handleNewOrgSlugChange(e.target.value)}
                      placeholder="e.g., acme-inc or john-smith"
                      maxLength={50}
                      className={slugError ? 'border-destructive' : ''}
                    />
                    {newOrgSlug && !slugError && (
                      <Icons.CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {slugError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <Icons.AlertCircle className="h-3 w-3" />
                      {slugError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from your name. Can be customized but cannot be changed later.
                  </p>
                </div>

                <Button
                  onClick={handleCreateOrganization}
                  disabled={creating || !newOrgName.trim() || !newOrgSlug.trim() || !!slugError}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
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
              <Card className="mb-8 rounded-[2rem] border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Manage your organization members and their roles
                      </CardDescription>
                    </div>
                    {(memberRole === 'owner' || memberRole === 'admin') && (
                      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Icons.UserPlus className="mr-2 h-4 w-4" />
                            Add Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription>
                              Add a new member to your organization. They must have an account first.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="inviteEmail">User ID</Label>
                              <Input
                                id="inviteEmail"
                                placeholder="Enter user ID"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Note: User must sign up first before they can be added
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="inviteRole">Role</Label>
                              <select
                                id="inviteRole"
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as any)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                              >
                                <option value="viewer">Viewer - Can only view apps</option>
                                <option value="member">Member - Can use apps</option>
                                <option value="admin">Admin - Can manage team and apps</option>
                              </select>
                            </div>
                            <Button
                              onClick={handleInviteMember}
                              disabled={inviting || !inviteEmail.trim()}
                              className="w-full"
                            >
                              {inviting ? (
                                <>
                                  <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                'Add Member'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
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
                          <div className="flex items-center gap-2">
                            {(memberRole === 'owner' || memberRole === 'admin') && member.user_id !== user?.id ? (
                              <>
                                <select
                                  value={member.role}
                                  onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as 'owner' | 'admin' | 'member' | 'viewer')}
                                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                                >
                                  <option value="viewer">Viewer</option>
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                  {memberRole === 'owner' && <option value="owner">Owner</option>}
                                </select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id, member.user_id)}
                                >
                                  <Icons.Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <Badge className={getRoleBadge(member.role)}>
                                {member.role.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* App Subscriptions */}
              <Card className="rounded-[2rem] border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>App Subscriptions</CardTitle>
                      <CardDescription>
                        Manage which apps your organization can access
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingApps ? (
                    <div className="text-center py-8">
                      <Icons.Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : appAccess.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No apps available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appAccess.map((access) => (
                        <div
                          key={access.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {getIconComponent(access.apps.icon)}
                            </div>
                            <div>
                              <p className="font-medium">{access.apps.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {access.apps.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={access.is_enabled ? "default" : "secondary"}>
                              {access.is_enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            {(memberRole === 'owner' || memberRole === 'admin') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAppAccess(access.id, access.app_id, access.is_enabled)}
                                disabled={updatingApp === access.app_id}
                              >
                                {updatingApp === access.app_id ? (
                                  <Icons.Loader2 className="h-4 w-4 animate-spin" />
                                ) : access.is_enabled ? (
                                  'Disable'
                                ) : (
                                  'Enable'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* App Management (Admin Only) */}
              {isAdmin && (
                <Card className="mt-8 rounded-[2rem] border-2 border-destructive/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icons.Shield className="h-5 w-5 text-destructive" />
                          App Management (Admin)
                        </CardTitle>
                        <CardDescription>
                          Manage all apps in the system
                        </CardDescription>
                      </div>
                      <Button onClick={handleNewApp} size="sm">
                        <Icons.Plus className="mr-2 h-4 w-4" />
                        Add App
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingAllApps ? (
                      <div className="text-center py-8">
                        <Icons.Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      </div>
                    ) : allApps.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No apps in the system
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allApps.map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-4 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {getIconComponent(app.icon)}
                              </div>
                              <div>
                                <p className="font-medium">{app.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {app.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Category: {app.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={(app as any).is_active ? "default" : "secondary"}>
                                {(app as any).is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditApp(app)}
                              >
                                <Icons.Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* App Create/Edit Dialog */}
          <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingApp ? 'Edit App' : 'Add New App'}
                </DialogTitle>
                <DialogDescription>
                  {editingApp ? 'Update the app details below' : 'Create a new app in the system'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">App Name</Label>
                    <Input
                      id="appName"
                      placeholder="e.g., Portfolio Builder"
                      value={appFormData.name}
                      onChange={(e) => setAppFormData({ ...appFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appSlug">Slug</Label>
                    <Input
                      id="appSlug"
                      placeholder="e.g., portfolio-builder"
                      value={appFormData.slug}
                      onChange={(e) => setAppFormData({ ...appFormData, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appDescription">Description</Label>
                  <Textarea
                    id="appDescription"
                    placeholder="Brief description of the app"
                    value={appFormData.description}
                    onChange={(e) => setAppFormData({ ...appFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appIcon">Icon (Lucide name)</Label>
                    <Input
                      id="appIcon"
                      placeholder="e.g., Briefcase"
                      value={appFormData.icon}
                      onChange={(e) => setAppFormData({ ...appFormData, icon: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appCategory">Category</Label>
                    <Input
                      id="appCategory"
                      placeholder="e.g., Professional"
                      value={appFormData.category}
                      onChange={(e) => setAppFormData({ ...appFormData, category: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appUrl">App URL</Label>
                  <Input
                    id="appUrl"
                    placeholder="https://example.com"
                    value={appFormData.url}
                    onChange={(e) => setAppFormData({ ...appFormData, url: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="appActive"
                    checked={appFormData.is_active}
                    onChange={(e) => setAppFormData({ ...appFormData, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="appActive">Active (visible to users)</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAppDialogOpen(false);
                    setEditingApp(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveApp}>
                  {editingApp ? 'Update App' : 'Create App'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
