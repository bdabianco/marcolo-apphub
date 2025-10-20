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
import { DollarSign, TrendingUp, PiggyBank, FileText, LogOut, LineChart, Shield, CheckCircle2, Circle, Clock, Wallet } from 'lucide-react';
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
    assets: { complete: false, progress: 0, label: 'Not Started' },
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
    const assetsComplete = assets && assets.length > 0;
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
      assets: {
        complete: assetsComplete || false,
        progress: assetsComplete ? 100 : 0,
        label: assetsComplete ? 'Complete' : 'Not Started'
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
    <div className="min-h-screen bg-[image:var(--gradient-sky)] relative overflow-hidden">
      {/* Organic Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section - Organic Flow */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div className="relative">
            <div className="absolute -inset-2 bg-[image:var(--gradient-leaf)] opacity-10 blur-2xl rounded-[3rem]" />
            <div className="relative">
              <h1 className="text-5xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent mb-2">
                Welcome back!
              </h1>
              <p className="text-lg text-foreground/70 font-light">
                Grow your finances naturally
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

        {/* Stats Grid - Organic Flowing Layout */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="relative overflow-hidden group hover:[box-shadow:var(--shadow-leaf)] transition-all duration-500 rounded-[2rem] border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-leaf)] opacity-10 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground/80">Net Income</CardTitle>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${formatCurrency(stats.totalIncome)}</div>
              <p className="text-sm text-muted-foreground mt-1">Growing monthly</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:[box-shadow:var(--shadow-leaf)] transition-all duration-500 rounded-[2rem] border-2 border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 opacity-20 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground/80">Expenses</CardTitle>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">${formatCurrency(stats.totalExpenses)}</div>
              <p className="text-sm text-muted-foreground mt-1">Tracked flow</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:[box-shadow:var(--shadow-leaf)] transition-all duration-500 rounded-[2rem] border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 opacity-20 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground/80">Savings Goals</CardTitle>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <PiggyBank className="h-6 w-6 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.savingsGoals}</div>
              <p className="text-sm text-muted-foreground mt-1">Nurturing goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Tree Branch Layout */}
        <Card className="relative overflow-hidden border-2 border-primary/20 rounded-[2.5rem] bg-gradient-to-br from-card via-card to-primary/5 [box-shadow:var(--shadow-canopy)]">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[image:var(--gradient-leaf)] rounded-t-[2.5rem]" />
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
                    (Object.values(completionStatus).filter(s => s.complete).length / 5) * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground">Setup Complete</div>
              </div>
            </div>
            
            {/* Organic Growth Progress Bar */}
            <div className="relative mt-4">
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[image:var(--gradient-leaf)] shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.round((Object.values(completionStatus).filter(s => s.complete).length / 5) * 100)}%`
                  }}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid gap-6 md:grid-cols-5 p-8">
            {/* Budget Plan - Root */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/budget')}
                    className="h-36 flex-col gap-3 relative group overflow-hidden rounded-[1.5rem] border-2 border-primary/30 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_4px_24px_hsl(var(--primary)/0.25)] hover:shadow-[0_8px_32px_hsl(var(--primary)/0.35)] transition-all duration-500"
                  >
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant={completionStatus.budget.complete ? "default" : "secondary"} className="text-xs bg-primary-foreground/90 text-primary backdrop-blur-sm">
                        {completionStatus.budget.label}
                      </Badge>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-foreground/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <FileText className="h-8 w-8 relative z-10 text-primary-foreground" />
                    <span className="relative z-10 text-base font-bold text-primary-foreground">Budget Plan</span>
                    <div className="relative z-10 text-xs text-primary-foreground/90 font-medium">
                      {stats.incomeCount} income • {stats.expenseCount} expenses
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs rounded-2xl">
                  <p className="font-semibold mb-1">Create Your Budget</p>
                  <p className="text-xs">Plant your financial roots with income and expense tracking.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Cashflow - Trunk */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/cashflow')}
                    className={`h-36 flex-col gap-3 relative group overflow-hidden rounded-[1.5rem] border-2 ${
                      isDeficit 
                        ? 'border-destructive/30 bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive shadow-[0_4px_24px_hsl(var(--destructive)/0.25)] hover:shadow-[0_8px_32px_hsl(var(--destructive)/0.35)]' 
                        : 'border-secondary/30 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary shadow-[0_4px_24px_hsl(var(--secondary)/0.25)] hover:shadow-[0_8px_32px_hsl(var(--secondary)/0.35)]'
                    } transition-all duration-500`}
                  >
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant={completionStatus.cashflow.complete ? "default" : "secondary"} className="text-xs bg-secondary-foreground/90 text-secondary backdrop-blur-sm">
                        {completionStatus.cashflow.label}
                      </Badge>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary-foreground/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <TrendingUp className="h-8 w-8 relative z-10 text-secondary-foreground" />
                    <span className="relative z-10 text-base font-bold text-secondary-foreground">
                      {isDeficit ? 'Fix Cashflow ⚠' : 'Track Cashflow'}
                    </span>
                    <div className="relative z-10 text-xs text-secondary-foreground/90 font-medium">
                      {stats.debtCount} debts • {stats.assetCount} assets
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs rounded-2xl">
                  <p className="font-semibold mb-1">Analyze Cashflow</p>
                  <p className="text-xs">Strengthen your trunk with debt and asset management.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Savings Goals - Branch */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/savings')}
                    className="h-36 flex-col gap-3 relative group overflow-hidden rounded-[1.5rem] border-2 border-accent/30 bg-gradient-to-br from-accent/90 to-accent hover:from-accent hover:to-accent/90 shadow-[0_4px_24px_hsl(var(--accent)/0.25)] hover:shadow-[0_8px_32px_hsl(var(--accent)/0.35)] transition-all duration-500"
                  >
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant={completionStatus.savings.complete ? "default" : "secondary"} className="text-xs bg-accent-foreground/90 text-accent backdrop-blur-sm">
                        {completionStatus.savings.label}
                      </Badge>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent-foreground/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
                    <PiggyBank className="h-8 w-8 text-accent-foreground relative z-10" />
                    <span className="text-base font-bold text-accent-foreground relative z-10">
                      {currentProject?.project_type === 'business' ? 'Retained Earnings' : 'Savings Goals'}
                    </span>
                    <div className="text-xs text-accent-foreground/80 font-medium relative z-10">
                      {stats.savingsGoals} active {currentProject?.project_type === 'business' ? 'targets' : 'goals'}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs rounded-2xl">
                  <p className="font-semibold mb-1">
                    {currentProject?.project_type === 'business' ? 'Track Retained Earnings' : 'Set Savings Goals'}
                  </p>
                  <p className="text-xs">
                    {currentProject?.project_type === 'business' 
                      ? 'Build reserves and reinvestment capacity for business growth.' 
                      : 'Grow branches of savings with automated tracking.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Investments & Assets - Leaves */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/savings')}
                    className="h-36 flex-col gap-3 relative group overflow-hidden rounded-[1.5rem] border-2 border-primary/20 bg-gradient-to-br from-card to-primary/15 hover:from-primary/10 hover:to-primary/25 shadow-[0_4px_24px_hsl(var(--primary)/0.15)] hover:shadow-[0_8px_32px_hsl(var(--primary)/0.25)] transition-all duration-500"
                  >
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant={completionStatus.assets.complete ? "default" : "secondary"} className="text-xs">
                        {completionStatus.assets.label}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rounded-tr-full group-hover:scale-150 transition-transform duration-500" />
                    <Wallet className="h-8 w-8 text-primary relative z-10" />
                    <span className="text-base font-bold text-primary relative z-10">
                      {currentProject?.project_type === 'business' ? 'Business Assets' : 'Assets'}
                    </span>
                    <div className="text-xs text-muted-foreground font-medium relative z-10">
                      {stats.assetCount} tracked
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs rounded-2xl">
                  <p className="font-semibold mb-1">
                    {currentProject?.project_type === 'business' ? 'Track Business Assets' : 'Track Investments & Assets'}
                  </p>
                  <p className="text-xs">
                    {currentProject?.project_type === 'business'
                      ? 'Monitor equipment, property, and business investments.'
                      : 'Flourish with investments and asset monitoring.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>


            {/* AI Insights - Canopy */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/insights')}
                    className="h-36 flex-col gap-3 relative group overflow-hidden rounded-[1.5rem] border-2 border-secondary/20 bg-gradient-to-br from-card to-secondary/15 hover:from-secondary/10 hover:to-secondary/25 shadow-[0_4px_24px_hsl(var(--secondary)/0.15)] hover:shadow-[0_8px_32px_hsl(var(--secondary)/0.25)] transition-all duration-500"
                  >
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant={completionStatus.insights.complete ? "default" : "secondary"} className="text-xs">
                        {completionStatus.insights.label}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    <LineChart className="h-8 w-8 text-secondary relative z-10" />
                    <span className="text-base font-bold text-secondary relative z-10">
                      {currentProject?.project_type === 'business' ? 'Business Insights' : 'AI Insights'}
                    </span>
                    <div className="text-xs text-muted-foreground font-medium relative z-10">
                      {currentProject?.project_type === 'business' ? 'Business analysis & advice' : 'Financial analysis & advice'}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">
                    {currentProject?.project_type === 'business' ? 'Get Business Intelligence' : 'Get AI Insights'}
                  </p>
                  <p className="text-xs">
                    {currentProject?.project_type === 'business'
                      ? 'View profitability ratios, growth analysis, and get personalized business advice.'
                      : 'View financial ratios, debt payoff timeline, and get personalized AI advice based on your data.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your Data is Safe</h3>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">SSL/TLS Encrypted</span>
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              All financial data is protected with enterprise-grade encryption and isolated per user with Row-Level Security. 
              Your information is never shared and only accessible to you. We use industry-standard security practices 
              to ensure your financial privacy is maintained at all times.
            </p>
          </div>
        </div>
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
