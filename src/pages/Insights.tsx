import { useEffect, useState } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { formatCurrency } from '@/lib/utils';

interface Metrics {
  totalAnnualIncome: number;
  totalAnnualExpenses: number;
  annualSurplus: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  budgetPlansCount: number;
  savingsGoalsCount: number;
}

function InsightsContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({
    totalAnnualIncome: 0,
    totalAnnualExpenses: 0,
    annualSurplus: 0,
    savingsRate: 0,
    debtToIncomeRatio: 0,
    totalAssets: 0,
    totalDebts: 0,
    netWorth: 0,
    budgetPlansCount: 0,
    savingsGoalsCount: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    if (!user) return;

    const { data: budgets } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('user_id', user.id);

    const { data: cashflows } = await supabase
      .from('cashflow_records')
      .select('*')
      .eq('user_id', user.id);

    const { data: savings } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id);

    const { data: assets } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id);

    let totalIncome = 0;
    let totalExpenses = 0;

    if (budgets && budgets.length > 0) {
      totalIncome = budgets.reduce((sum, b) => sum + Number(b.net_income || 0), 0);
      totalExpenses = budgets.reduce((sum, b) => sum + Number(b.total_expenses || 0), 0);
    }

    const totalDebts = cashflows?.reduce((sum, c) => sum + Number(c.total_debt || 0), 0) || 0;
    const totalAssets = assets?.reduce((sum, a) => sum + Number(a.current_value || 0), 0) || 0;
    const surplus = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;
    const debtToIncomeRatio = totalIncome > 0 ? (totalDebts / totalIncome) * 100 : 0;
    const netWorth = totalAssets - totalDebts;

    setMetrics({
      totalAnnualIncome: totalIncome,
      totalAnnualExpenses: totalExpenses,
      annualSurplus: surplus,
      savingsRate,
      debtToIncomeRatio,
      totalAssets,
      totalDebts,
      netWorth,
      budgetPlansCount: budgets?.length || 0,
      savingsGoalsCount: savings?.length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Financial Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of your financial health and progress
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${formatCurrency(metrics.totalAnnualIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatCurrency(metrics.totalAnnualExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Surplus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.annualSurplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ${formatCurrency(metrics.annualSurplus)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {metrics.savingsRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Ratios */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Financial Ratios</CardTitle>
            <CardDescription>Key indicators of your financial health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Debt-to-Income Ratio</span>
                <span className={`font-bold ${metrics.debtToIncomeRatio > 43 ? 'text-destructive' : 'text-primary'}`}>
                  {metrics.debtToIncomeRatio.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${metrics.debtToIncomeRatio > 43 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(metrics.debtToIncomeRatio, 100)}%` }}
                />
              </div>
              {metrics.debtToIncomeRatio > 43 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>High debt-to-income ratio. Consider debt reduction strategies.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Savings Rate</span>
                <span className={`font-bold ${metrics.savingsRate < 20 ? 'text-destructive' : 'text-primary'}`}>
                  {metrics.savingsRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${metrics.savingsRate < 20 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(metrics.savingsRate, 100)}%` }}
                />
              </div>
              {metrics.savingsRate < 20 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Aim for at least 20% savings rate for financial security.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Net Worth */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Net Worth Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Assets</div>
                <div className="text-xl font-bold text-primary">
                  ${formatCurrency(metrics.totalAssets)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Debts</div>
                <div className="text-xl font-bold text-destructive">
                  ${formatCurrency(metrics.totalDebts)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Net Worth</div>
                <div className={`text-xl font-bold ${metrics.netWorth >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ${formatCurrency(metrics.netWorth)}
                </div>
              </div>
            </div>

            {metrics.netWorth > 0 && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded">
                <TrendingUp className="h-4 w-4" />
                <span>Positive net worth! Keep building your financial foundation.</span>
              </div>
            )}
            {metrics.netWorth < 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
                <TrendingDown className="h-4 w-4" />
                <span>Focus on debt reduction to improve your net worth.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.savingsRate < 20 && (
              <div className="p-3 bg-muted rounded">
                <div className="font-medium mb-1">Increase Your Savings Rate</div>
                <div className="text-sm text-muted-foreground">
                  Try to reduce expenses or increase income to reach a 20% savings rate.
                </div>
              </div>
            )}
            {metrics.debtToIncomeRatio > 43 && (
              <div className="p-3 bg-muted rounded">
                <div className="font-medium mb-1">Reduce Debt Burden</div>
                <div className="text-sm text-muted-foreground">
                  Your debt-to-income ratio is high. Consider debt consolidation or extra payments.
                </div>
              </div>
            )}
            {metrics.savingsGoalsCount === 0 && (
              <div className="p-3 bg-muted rounded">
                <div className="font-medium mb-1">Set Savings Goals</div>
                <div className="text-sm text-muted-foreground">
                  Start by creating an emergency fund goal equal to 6 months of expenses.
                </div>
              </div>
            )}
            {metrics.budgetPlansCount === 0 && (
              <div className="p-3 bg-muted rounded">
                <div className="font-medium mb-1">Create a Budget Plan</div>
                <div className="text-sm text-muted-foreground">
                  Track your income and expenses with a detailed budget plan.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Insights() {
  return (
    <ProtectedRoute>
      <InsightsContent />
    </ProtectedRoute>
  );
}
