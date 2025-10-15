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

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Welcome back!
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your budget, track cashflow, and optimize your savings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProjectSelector />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
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
              <div className="text-2xl font-bold">${formatCurrency(stats.totalIncome)}</div>
              <p className="text-xs text-muted-foreground">Total monthly</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(stats.totalExpenses)}</div>
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
          <CardContent className="grid gap-4 md:grid-cols-4">
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
            <Button 
              onClick={() => navigate('/insights')}
              variant="outline"
              className="h-24 flex-col gap-2"
            >
              <LineChart className="h-6 w-6" />
              <span>View Insights</span>
            </Button>
          </CardContent>
        </Card>

        {/* Admin Panel */}
        {isAdmin && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Panel
              </CardTitle>
              <CardDescription>Manage users and view system-wide statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin')} className="w-full">
                Manage Users
              </Button>
            </CardContent>
          </Card>
        )}
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
