import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  url: string;
  is_active: boolean;
}

const AppHubContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization, userOrganizations, loading: orgLoading } = useOrganization();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, [currentOrganization]);

  const loadApps = async () => {
    if (!currentOrganization) {
      setLoading(false);
      return;
    }

    try {
      // Get apps that the organization has access to
      const { data: accessData, error: accessError } = await supabase
        .from('app_access')
        .select('app_id, is_enabled, apps(*)')
        .eq('organization_id', currentOrganization.id)
        .eq('is_enabled', true);

      if (accessError) throw accessError;

      // Extract the apps from the access data
      const enabledApps = accessData?.map(access => access.apps).filter(Boolean) || [];
      setApps(enabledApps as App[]);
    } catch (error) {
      console.error('Error loading apps:', error);
      toast.error('Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="h-8 w-8" /> : <Icons.AppWindow className="h-8 w-8" />;
  };

  const handleAppClick = (app: App) => {
    window.open(app.url, '_blank');
  };

  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4 bg-muted" />
            <Skeleton className="h-6 w-96 mb-12 bg-muted" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-[2rem] bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrganization && userOrganizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mb-6">
                <Icons.Building2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to Marcolo App Hub</h1>
              <p className="text-xl text-muted-foreground mb-8">
                To get started, you need to create or join an organization.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/settings')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Organization
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              App Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI powered app for business efficiency and sales growth
            </p>
            {currentOrganization && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icons.Building2 className="h-4 w-4" />
                <span>{currentOrganization.name}</span>
              </div>
            )}
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Apps - Finance first if available */}
            {apps.filter(app => app.category === 'Finance').map((app) => (
              <Card
                key={app.id}
                className="group relative overflow-hidden hover:shadow-[var(--shadow-medium)] transition-all duration-500 rounded-2xl border-border bg-card cursor-pointer"
                onClick={() => handleAppClick(app)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-glow)] rounded-bl-full" />
                
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary-foreground">
                      {getIconComponent(app.icon)}
                    </div>
                    {app.category && (
                      <Badge variant="secondary" className="text-xs">
                        {app.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl mb-2 text-card-foreground group-hover:text-primary transition-colors">
                      {app.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {app.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <span>Launch App</span>
                    <Icons.ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Mycrm App - Coming Soon Placeholder */}
            <Card className="group relative overflow-hidden rounded-2xl border-border bg-card opacity-75">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-glow)] rounded-bl-full" />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Badge className="bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-2">
                  Coming Soon
                </Badge>
              </div>
              
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-primary-foreground">
                    <Icons.Users className="h-8 w-8" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    CRM
                  </Badge>
                </div>
                
                <div>
                  <CardTitle className="text-2xl mb-2 text-card-foreground">
                    Mycrm
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Customer First App - Your complete CRM solution for managing customer relationships
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  <span>Coming Soon</span>
                  <Icons.Clock className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Rest of Active Apps (excluding Finance) */}
            {apps.filter(app => app.category !== 'Finance').map((app) => (
              <Card
                key={app.id}
                className="group relative overflow-hidden hover:shadow-[var(--shadow-medium)] transition-all duration-500 rounded-2xl border-border bg-card cursor-pointer"
                onClick={() => handleAppClick(app)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-glow)] rounded-bl-full" />
                
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary-foreground">
                      {getIconComponent(app.icon)}
                    </div>
                    {app.category && (
                      <Badge variant="secondary" className="text-xs">
                        {app.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl mb-2 text-card-foreground group-hover:text-primary transition-colors">
                      {app.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {app.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <span>Launch App</span>
                    <Icons.ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Settings CTA */}
          <div className="mt-16 text-center">
            <Card className="inline-block rounded-2xl border border-primary/30 bg-[image:var(--gradient-hero)]">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Looking for Something Specific?</h3>
                <p className="text-foreground/80 mb-6 max-w-2xl">
                  We're committed to providing valuable easy to use AI powered tool, coaching and resources that help you grow your business succeed. Let us know what tools would help your business thrive.
                </p>
                <Button
                  onClick={() => navigate('/request-app')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                >
                  <Icons.Lightbulb className="mr-2 h-4 w-4" />
                  Share Your Insights for Growth
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppHub = () => {
  return (
    <ProtectedRoute>
      <AppHubContent />
    </ProtectedRoute>
  );
};

export default AppHub;
