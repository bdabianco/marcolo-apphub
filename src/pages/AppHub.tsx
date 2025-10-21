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
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setApps(data || []);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-[2rem]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrganization && userOrganizations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Icons.Building2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome to Marcolo App Hub</h1>
              <p className="text-xl text-muted-foreground mb-8">
                To get started, you need to create or join an organization.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/settings')}
                className="bg-primary hover:bg-primary/90"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
              Growth Apps & Resources
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-[image:var(--gradient-leaf)] bg-clip-text text-transparent">
              App Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium apps and resources to accelerate your business growth
            </p>
            {currentOrganization && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icons.Building2 className="h-4 w-4" />
                <span>{currentOrganization.name}</span>
              </div>
            )}
          </div>

          {/* Apps Grid */}
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No apps available</h3>
              <p className="text-muted-foreground">Check back soon for new apps!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <Card
                  key={app.id}
                  className="group relative overflow-hidden hover:[box-shadow:0_10px_30px_-10px_hsl(var(--primary)/0.4)] transition-all duration-500 rounded-[2rem] border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-accent/5 cursor-pointer"
                  onClick={() => handleAppClick(app)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-leaf)] opacity-10 rounded-bl-full" />
                  
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary-foreground">
                        {getIconComponent(app.icon)}
                      </div>
                      {app.category && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30">
                          {app.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <CardTitle className="text-2xl mb-2 group-hover:bg-[image:var(--gradient-leaf)] group-hover:bg-clip-text group-hover:text-transparent transition-all">
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
                      className="w-full group-hover:bg-[image:var(--gradient-primary)] group-hover:text-primary-foreground group-hover:border-transparent transition-all border-primary/30"
                    >
                      <span>Launch App</span>
                      <Icons.ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Settings CTA */}
          <div className="mt-16 text-center">
            <Card className="inline-block rounded-[2rem] border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-accent/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Need Custom Solutions?</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your organization settings and team members
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="border-primary/30 hover:bg-[image:var(--gradient-primary)] hover:text-primary-foreground hover:border-transparent transition-all"
                >
                  <Icons.Settings className="mr-2 h-4 w-4" />
                  Organization Settings
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
