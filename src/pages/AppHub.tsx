import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

const requestSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  organization: z.string().trim().min(1, { message: "Organization is required" }).max(100),
  appName: z.string().trim().min(1, { message: "App name is required" }).max(100),
  description: z.string().trim().min(1, { message: "Description is required" }).max(1000),
  useCases: z.string().trim().max(1000).optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

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

const AppHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      appName: '',
      description: '',
      useCases: '',
    },
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      // Get all active apps to display to everyone
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (appsError) throw appsError;

      setApps(appsData || []);
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

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-app-request', {
        body: data,
      });

      if (error) throw error;

      toast.success('Request submitted successfully! We\'ll get back to you soon.');
      form.reset();
      setIsRequestDialogOpen(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl text-card-foreground group-hover:text-primary transition-colors">
                        {app.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                        Beta
                      </Badge>
                    </div>
                    {app.category === 'Finance' && (
                      <p className="text-sm font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent mb-3 tracking-wide">
                        Plan smarter. Grow faster. Sleep better
                      </p>
                    )}
                    <CardDescription 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: app.description }}
                    />
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

            {/* MyaiCRO App */}
            <Card 
              className="group relative overflow-hidden hover:shadow-[var(--shadow-medium)] transition-all duration-500 rounded-2xl border-border bg-card cursor-pointer"
              onClick={() => window.open('https://myaicro.marcoloai.com', '_blank')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-glow)] rounded-bl-full" />
              
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary-foreground">
                    <Icons.Users className="h-8 w-8" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Sales
                  </Badge>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl text-card-foreground group-hover:text-primary transition-colors">
                      MyaiCRO
                    </CardTitle>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-sm font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent mb-3 tracking-wide">
                    Turn prospects into revenue with intelligent precision.
                  </p>
                  <CardDescription className="text-sm leading-relaxed">
                    <strong>MyaiCRO is not a CRM — it's an AI-powered selling engine</strong> that analyzes your entire revenue motion from first touch to closed deal. It evaluates prospects, funnels, and deals through the lens of your company's offerings, ICP, value props, and buyer objectives.<br/><br/>From prospect intelligence to deal management, MyaiCRO ensures prospects become accounts and accounts generate revenue. AI sales agents and coaches highlight risks, surface opportunities, and recommend the next best action — empowering growth-focused organizations to sell smarter, faster, and with complete clarity.
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
                    <CardDescription 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: app.description }}
                    />
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
                  type="button"
                  onClick={() => setIsRequestDialogOpen(true)}
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

      {/* Request App Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Share Your Thoughts</DialogTitle>
            <DialogDescription>
              Tell us about the application you need and we'll work on making it a reality
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name/Type *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Invoice Manager, Lead Tracker" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this app should do and what problems it should solve..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useCases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Cases (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe specific scenarios where you would use this app..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Icons.Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppHub;
