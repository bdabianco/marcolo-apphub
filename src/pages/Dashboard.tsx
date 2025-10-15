import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/lib/auth';
import { DollarSign, TrendingUp, PiggyBank, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import marcoloLogo from '@/assets/marcolo-logo.png';
import { toast } from 'sonner';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    budgetPlans: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsGoals: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;

    const { data: budgets } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('user_id', user.id);

    const { data: savings } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id);

    if (budgets && budgets.length > 0) {
      const totalIncome = budgets.reduce((sum, b) => sum + Number(b.net_income || 0), 0);
      const totalExpenses = budgets.reduce((sum, b) => sum + Number(b.total_expenses || 0), 0);
      
      setStats({
        budgetPlans: budgets.length,
        totalIncome,
        totalExpenses,
        savingsGoals: savings?.length || 0,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={marcoloLogo} alt="Marcolo" className="h-10 w-10" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Marcolo Cashflow
            </h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Manage your budget, track cashflow, and optimize your savings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Plans</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.budgetPlans}</div>
              <p className="text-xs text-muted-foreground">Active plans</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total monthly</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Monthly total</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your financial planning</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button 
              onClick={() => navigate('/budget')}
              className="h-24 flex-col gap-2"
            >
              <FileText className="h-6 w-6" />
              <span>Create Budget Plan</span>
            </Button>
            <Button 
              onClick={() => navigate('/cashflow')}
              variant="secondary"
              className="h-24 flex-col gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Track Cashflow</span>
            </Button>
            <Button 
              onClick={() => navigate('/savings')}
              variant="outline"
              className="h-24 flex-col gap-2"
            >
              <PiggyBank className="h-6 w-6" />
              <span>Set Savings Goals</span>
            </Button>
          </CardContent>
        </Card>
      </main>
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
