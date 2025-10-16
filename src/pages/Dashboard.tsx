import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProtectedRoute } from '@/lib/auth';
import { DollarSign, TrendingUp, PiggyBank, FileText, LogOut, LineChart, Shield, CheckCircle2, Circle, Clock } from 'lucide-react';
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
    expenseCount: 0,
    incomeCount: 0,
    debtCount: 0,
    assetCount: 0,
  });

  const [completionStatus, setCompletionStatus] = useState({
    budget: { complete: false, progress: 0, label: 'Not Started' },
    cashflow: { complete: false, progress: 0, label: 'Not Started' },
    savings: { complete: false, progress: 0, label: 'Not Started' },
    insights: { complete: false, progress: 0, label: 'Not Started' },
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
      .maybeSingle();

    const { data: savings } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('budget_plan_id', currentProject.id);

    const { data: cashflow } = await supabase
      .from('cashflow_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('budget_plan_id', currentProject.id)
      .maybeSingle();

    const { data: assets } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id);

    // Parse expenses and income from budget
    let expenseCount = 0;
    let incomeCount = 0;
    let debtCount = 0;

    if (budget) {
      try {
        const expensesData = typeof budget.expenses === 'string' ? budget.expenses : JSON.stringify(budget.expenses || '[]');
        const incomeCategoriesData = typeof budget.income_categories === 'string' ? budget.income_categories : JSON.stringify(budget.income_categories || '[]');
        
        const expenses = JSON.parse(expensesData);
        const incomeCategories = JSON.parse(incomeCategoriesData);
        expenseCount = expenses.length;
        incomeCount = incomeCategories.length;
      } catch (e) {
        console.error('Error parsing budget data:', e);
      }
    }

    if (cashflow) {
      try {
        const debtsData = typeof cashflow.debts === 'string' ? cashflow.debts : JSON.stringify(cashflow.debts || '[]');
        const debts = JSON.parse(debtsData);
        debtCount = debts.length;
      } catch (e) {
        console.error('Error parsing cashflow data:', e);
      }
    }

    // Calculate completion status
    const budgetComplete = budget && incomeCount > 0 && expenseCount > 0;
    const cashflowComplete = cashflow && debtCount > 0;
    const savingsComplete = savings && savings.length > 0;
    const insightsComplete = budgetComplete && cashflowComplete;

    setCompletionStatus({
      budget: {
        complete: budgetComplete || false,
        progress: budgetComplete ? 100 : (budget ? 50 : 0),
        label: budgetComplete ? 'Complete' : (budget ? 'In Progress' : 'Not Started')
      },
      cashflow: {
        complete: cashflowComplete || false,
        progress: cashflowComplete ? 100 : (cashflow ? 50 : 0),
        label: cashflowComplete ? 'Complete' : (cashflow ? 'In Progress' : 'Not Started')
      },
      savings: {
        complete: savingsComplete || false,
        progress: savingsComplete ? 100 : 0,
        label: savingsComplete ? 'Complete' : 'Not Started'
      },
      insights: {
        complete: insightsComplete || false,
        progress: insightsComplete ? 100 : 0,
        label: insightsComplete ? 'Ready' : 'Pending Data'
      }
    });

    if (budget) {
      setStats({
        budgetPlans: 1,
        totalIncome: Number(budget.net_income || 0),
        totalExpenses: Number(budget.total_expenses || 0),
        savingsGoals: savings?.length || 0,
        expenseCount,
        incomeCount,
        debtCount,
        assetCount: assets?.length || 0,
      });
    } else {
      setStats({
        budgetPlans: 0,
        totalIncome: 0,
        totalExpenses: 0,
        savingsGoals: 0,
        expenseCount: 0,
        incomeCount: 0,
        debtCount: 0,
        assetCount: 0,
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
            <div className="flex items-center justify-between">
              <div>
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
              </div>
              
              {/* Overall Completion */}
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(
                    (Object.values(completionStatus).filter(s => s.complete).length / 4) * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground">Setup Complete</div>
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <Progress 
              value={Math.round(
                (Object.values(completionStatus).filter(s => s.complete).length / 4) * 100
              )} 
              className="h-2 mt-3"
            />
          </CardHeader>
          
          <CardContent className="grid gap-4 md:grid-cols-4">
            {/* Budget Plan */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/budget')}
                    className="h-32 flex-col gap-2 relative group overflow-hidden"
                  >
                    <div className="absolute top-2 right-2">
                      <Badge variant={completionStatus.budget.complete ? "default" : "secondary"} className="text-xs">
                        {completionStatus.budget.label}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-primary-foreground/0 group-hover:bg-primary-foreground/10 transition-colors" />
                    <FileText className="h-7 w-7 relative z-10" />
                    <span className="relative z-10 text-sm font-semibold">Budget Plan</span>
                    <div className="relative z-10 text-xs text-primary-foreground/80">
                      {stats.incomeCount} income • {stats.expenseCount} expenses
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">Create Your Budget</p>
                  <p className="text-xs">Set up income sources and track monthly expenses with automatic tax calculations.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Cashflow */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/cashflow')}
                    variant={isDeficit ? "destructive" : "secondary"}
                    className="h-32 flex-col gap-2 relative group overflow-hidden"
                  >
                    <div className="absolute top-2 right-2">
                      <Badge variant={completionStatus.cashflow.complete ? "default" : "secondary"} className="text-xs">
                        {completionStatus.cashflow.label}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-secondary-foreground/0 group-hover:bg-secondary-foreground/10 transition-colors" />
                    <TrendingUp className="h-7 w-7 relative z-10" />
                    <span className="relative z-10 text-sm font-semibold">
                      {isDeficit ? 'Fix Cashflow ⚠' : 'Track Cashflow'}
                    </span>
                    <div className="relative z-10 text-xs opacity-80">
                      {stats.debtCount} debts • {stats.assetCount} assets
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">Analyze Cashflow</p>
                  <p className="text-xs">Track debts, mortgages, and available monthly cashflow after all expenses.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Savings Goals */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/savings')}
                    variant="outline"
                    className="h-32 flex-col gap-2 hover:border-accent hover:bg-accent/5 relative"
                  >
                    <div className="absolute top-2 right-2">
                      <Badge variant={completionStatus.savings.complete ? "default" : "secondary"} className="text-xs">
                        {completionStatus.savings.label}
                      </Badge>
                    </div>
                    <PiggyBank className="h-7 w-7" />
                    <span className="text-sm font-semibold">Savings Goals</span>
                    <div className="text-xs text-muted-foreground">
                      {stats.savingsGoals} active goals
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">Set Savings Goals</p>
                  <p className="text-xs">Define and track savings targets with automated progress monitoring and projections.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* AI Insights */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/insights')}
                    variant="outline"
                    className="h-32 flex-col gap-2 hover:border-primary hover:bg-primary/5 relative"
                  >
                    <div className="absolute top-2 right-2">
                      <Badge variant={completionStatus.insights.complete ? "default" : "secondary"} className="text-xs">
                        {completionStatus.insights.label}
                      </Badge>
                    </div>
                    <LineChart className="h-7 w-7" />
                    <span className="text-sm font-semibold">AI Insights</span>
                    <div className="text-xs text-muted-foreground">
                      Financial analysis & advice
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">Get AI Insights</p>
                  <p className="text-xs">View financial ratios, debt payoff timeline, and get personalized AI advice based on your data.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
