import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, TrendingUp, PiggyBank, Shield } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center">
            <img src={marcoloLogo} alt="Marcolo" className="h-full w-full object-contain" />
          </div>
          
          <h1 className="mb-6 text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mycashflow
            </span>
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            Take control of your finances with powerful budget planning, cashflow analysis, and savings optimization tools.
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
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Budget Planning</h3>
            <p className="text-sm text-muted-foreground">
              Create detailed budgets with automatic Canadian tax calculations
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Cashflow Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Track debts and analyze your monthly cashflow with precision
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <PiggyBank className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Savings Goals</h3>
            <p className="text-sm text-muted-foreground">
              Set and track savings goals with automated progress monitoring
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border hover:shadow-lg transition-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your financial data is encrypted and accessible only to you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
