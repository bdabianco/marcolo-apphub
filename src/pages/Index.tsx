import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, TrendingUp, PiggyBank, Shield, Sparkles } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/app-hub');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <a
            href="https://www.marcoloai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mb-8 flex h-32 w-32 items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={marcoloLogo} alt="Marcolo" className="h-full w-full object-contain" />
          </a>
          
          <h1 className="mb-6 text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Marcolo App Hub
            </span>
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated business apps and resources driven by AI for accelerated sales efficiency and business growth. Access AI powered tools for financial planning, sales optimization, analytics, customer experience, business growth and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg h-12 px-8"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg h-12 px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Financial Planning</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive financial planning for personal and business budgets with AI insights
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Growth Tools</h3>
            <p className="text-sm text-muted-foreground">
              Data-driven insights and analytics to accelerate your business growth
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent recommendations and automation powered by advanced AI
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground">
              Bank-level encryption and multi-tenant isolation for your data
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-border/50">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Enterprise-Grade Security</h3>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">SSL/TLS Encrypted</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All data is protected with enterprise-grade encryption and multi-tenant isolation. 
              Your organization's information is secured with Row-Level Security and never shared. 
              We follow industry-standard security practices to ensure your business data remains private and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
