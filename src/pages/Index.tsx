import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, TrendingUp, Shield, Sparkles, BarChart3 } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';

const Index = () => {
  const navigate = useNavigate();

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
              Marcolo Growth Partners
            </span>
          </h1>
          
          <p className="mb-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering businesses with AI-powered tools designed to streamline operations, optimize growth, and drive success.
          </p>
          
          <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our suite of intelligent applications helps entrepreneurs and business owners make data-driven decisions, manage finances effortlessly, and accelerate customer relationships—all without the complexity of traditional enterprise software.
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/app-hub')}
              className="text-lg h-14 px-12"
            >
              Enter App Hub
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Apps Section */}
        <div className="mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Our Applications
            </span>
          </h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <div className="text-left p-8 rounded-xl bg-card/50 backdrop-blur-sm border hover:shadow-xl transition-shadow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">MyaiCFO</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered financial planning tool built for entrepreneurs and business owners who need real-time insights into cash flow, budgeting, and financial decision-making without complex accounting software.
              </p>
            </div>

            <div className="text-left p-8 rounded-xl bg-card/50 backdrop-blur-sm border hover:shadow-xl transition-shadow opacity-75">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <BarChart3 className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold">MyaiCRO</h3>
                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">Coming Soon</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered customer relationship management built for sales teams and business owners who need to track leads, automate follow-ups, and close more deals without the complexity of traditional CRM systems.
              </p>
            </div>
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
