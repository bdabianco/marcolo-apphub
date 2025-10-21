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
      <div className="min-h-screen bg-[#1a1a1a]">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4 bg-[#2a2a2a]" />
            <Skeleton className="h-6 w-96 mb-12 bg-[#2a2a2a]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-[2rem] bg-[#2a2a2a]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrganization && userOrganizations.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mb-6">
                <Icons.Building2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Marcolo App Hub</h1>
              <p className="text-xl text-gray-400 mb-8">
                To get started, you need to create or join an organization.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/settings')}
                className="bg-primary hover:bg-primary/90 text-white"
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
    <div className="min-h-screen bg-[#1a1a1a]">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary">
              Growth Apps & Resources
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-[image:var(--gradient-leaf)] bg-clip-text text-transparent">
              App Hub
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Premium apps and resources to accelerate your business growth
            </p>
            {currentOrganization && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Icons.Building2 className="h-4 w-4" />
                <span>{currentOrganization.name}</span>
              </div>
            )}
          </div>

          {/* Apps Grid */}
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No apps available</h3>
              <p className="text-gray-400">Check back soon for new apps!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <Card
                  key={app.id}
                  className="group relative overflow-hidden hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] transition-all duration-500 rounded-2xl border border-[#2a2a2a] bg-[#242424] cursor-pointer"
                  onClick={() => handleAppClick(app)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
                  
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary">
                        {getIconComponent(app.icon)}
                      </div>
                      {app.category && (
                        <Badge variant="secondary" className="text-xs bg-[#2a2a2a] text-gray-400 border-[#3a3a3a]">
                          {app.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <CardTitle className="text-2xl mb-2 text-white group-hover:text-primary transition-colors">
                        {app.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-400">
                        {app.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent border-[#3a3a3a] text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all"
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
            <Card className="inline-block rounded-2xl border border-primary/30 bg-gradient-to-br from-[#1e3a2d] to-[#1a2f26]">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-2 text-white">Looking for Something Specific?</h3>
                <p className="text-gray-400 mb-6 max-w-2xl">
                  We're constantly developing new applications to meet your business needs. Let us know what tools would help your business thrive.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="bg-primary border-primary text-white hover:bg-primary/90 transition-all"
                >
                  <Icons.Settings className="mr-2 h-4 w-4" />
                  Request an App
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
