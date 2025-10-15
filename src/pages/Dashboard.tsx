import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/lib/auth';
import { DollarSign, TrendingUp, PiggyBank, FileText, LogOut, LineChart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProjectSelector } from '@/components/ProjectSelector';
import { AppHeader } from '@/components/AppHeader';
import { formatCurrency } from '@/lib/utils';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    budgetPlans: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsGoals: 0,
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadStats();
    checkAdminStatus();
  }, [currentProject]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const loadStats = async () => {
    if (!user || !currentProject) return;

    const { data: budget } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('id', currentProject.id)
      .single();

    const { data: savings } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('budget_plan_id', currentProject.id);

    if (budget) {
      setStats({
        budgetPlans: 1,
        totalIncome: Number(budget.net_income || 0),
        totalExpenses: Number(budget.total_expenses || 0),
        savingsGoals: savings?.length || 0,
      });
    } else {
      setStats({
        budgetPlans: 0,
        totalIncome: 0,
        totalExpenses: 0,
        savingsGoals: 0,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const cashflowBalance = stats.totalIncome - stats.totalExpenses;
  const isDeficit = cashflowBalance < 0;

  return (
    <div className="min-h-screen bg-[image:var(--gradient-subtle)]">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-[image:var(--gradient-primary)] opacity-20 blur-xl rounded-lg" />
            <div className="relative">
              <h1 className="text-4xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                Welcome back!
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your budget, track cashflow, and optimize your savings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProjectSelector />
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/admin')}
                className="h-9 w-9"
                title="Admin Panel"
              >
                <Shield className="h-4 w-4 text-primary" />
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid - 3 columns */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(stats.totalIncome)}</div>
              <p className="text-xs text-muted-foreground">Total monthly</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(stats.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">Monthly total</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Goals</CardTitle>
              <PiggyBank className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savingsGoals}</div>
              <p className="text-xs text-muted-foreground">Active goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="relative overflow-hidden border-2">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[image:var(--gradient-primary)]" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Quick Actions
              {isDeficit && (
                <span className="text-xs font-normal px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  Deficit Alert
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {isDeficit 
                ? `You have a monthly deficit of $${formatCurrency(Math.abs(cashflowBalance))}. Start with cashflow tracking.`
                : 'Get started with your financial planning'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Button 
              onClick={() => navigate('/budget')}
              className="h-28 flex-col gap-3 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary-foreground/0 group-hover:bg-primary-foreground/10 transition-colors" />
              <FileText className="h-7 w-7 relative z-10" />
              <span className="relative z-10 text-sm">Budget Plan</span>
            </Button>
            <Button 
              onClick={() => navigate('/cashflow')}
              variant={isDeficit ? "destructive" : "secondary"}
              className="h-28 flex-col gap-3 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-secondary-foreground/0 group-hover:bg-secondary-foreground/10 transition-colors" />
              <TrendingUp className="h-7 w-7 relative z-10" />
              <span className="relative z-10 text-sm">
                {isDeficit ? 'Fix Cashflow ⚠' : 'Track Cashflow'}
              </span>
            </Button>
            <Button 
              onClick={() => navigate('/savings')}
              variant="outline"
              className="h-28 flex-col gap-3 hover:border-accent hover:bg-accent/5"
            >
              <PiggyBank className="h-7 w-7" />
              <span className="text-sm">Savings Goals</span>
            </Button>
            <Button 
              onClick={() => navigate('/insights')}
              variant="outline"
              className="h-28 flex-col gap-3 hover:border-primary hover:bg-primary/5"
            >
              <LineChart className="h-7 w-7" />
              <span className="text-sm">AI Insights</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
