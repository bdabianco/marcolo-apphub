import { useEffect, useState } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, Target, PiggyBank, CreditCard, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { formatCurrency } from '@/lib/utils';
import { useProject } from '@/contexts/ProjectContext';
import { FinancialAdvisorChat } from '@/components/FinancialAdvisorChat';

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
  monthlySavingsContribution: number;
  totalSavingsTarget: number;
  totalSavingsCurrent: number;
  savingsProgress: number;
  monthlyDebtPayment: number;
  debtFreeMonths: number;
}

function InsightsContent() {
  const { user } = useAuth();
  const { currentProject } = useProject();
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
    monthlySavingsContribution: 0,
    totalSavingsTarget: 0,
    totalSavingsCurrent: 0,
    savingsProgress: 0,
    monthlyDebtPayment: 0,
    debtFreeMonths: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, [user, currentProject]);

  const [debtBreakdown, setDebtBreakdown] = useState<any[]>([]);

  const loadMetrics = async () => {
    if (!user) return;

    // Get all user's budget plans
    const { data: budgets } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('user_id', user.id);

    // Get cashflow record - use the one linked to current project or most recent
    const cashflowQuery = supabase
      .from('cashflow_records')
      .select('*')
      .eq('user_id', user.id);
    
    if (currentProject) {
      cashflowQuery.eq('budget_plan_id', currentProject.id);
    }
    
    const { data: cashflows } = await cashflowQuery.order('updated_at', { ascending: false }).limit(1);

    // Get savings goals (filter by current project if available)
    const savingsQuery = supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id);
    
    if (currentProject) {
      savingsQuery.eq('budget_plan_id', currentProject.id);
    }
    const { data: savings } = await savingsQuery;

    const { data: assets } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id);

    let totalIncome = 0;
    let totalExpenses = 0;

    // Use current project if available, otherwise sum all budgets
    if (currentProject) {
      const { data: currentBudget } = await supabase
        .from('budget_plans')
        .select('net_income, total_expenses')
        .eq('id', currentProject.id)
        .single();
      
      if (currentBudget) {
        totalIncome = Number(currentBudget.net_income || 0);
        totalExpenses = Number(currentBudget.total_expenses || 0);
      }
    } else if (budgets && budgets.length > 0) {
      totalIncome = budgets.reduce((sum, b) => sum + Number(b.net_income || 0), 0);
      totalExpenses = budgets.reduce((sum, b) => sum + Number(b.total_expenses || 0), 0);
    }

    // Extract debt breakdown from cashflows
    const allDebts: any[] = [];
    let totalMortgageBalance = 0;
    let totalMortgagePayment = 0;
    
    cashflows?.forEach(cf => {
      console.log('Processing cashflow record:', cf);
      
      // Add mortgage if exists - parse if it's a string
      let mortgage = cf.mortgage;
      if (typeof mortgage === 'string') {
        try {
          mortgage = JSON.parse(mortgage);
          console.log('Parsed mortgage from string:', mortgage);
        } catch (e) {
          console.error('Failed to parse mortgage JSON:', e);
          mortgage = null;
        }
      }
      
      if (mortgage && typeof mortgage === 'object') {
        const mortgageData = mortgage as any;
        console.log('Mortgage data:', mortgageData);
        
        if (mortgageData.primary && mortgageData.primary.balance > 0) {
          const primaryBalance = Number(mortgageData.primary.balance || 0);
          const primaryPayment = Number(mortgageData.primary.monthlyPayment || 0);
          const primaryRate = Number(mortgageData.primary.interestRate || 0);
          
          allDebts.push({
            name: 'Mortgage (Primary)',
            balance: primaryBalance,
            monthlyPayment: primaryPayment,
            interestRate: primaryRate,
          });
          totalMortgageBalance += primaryBalance;
          totalMortgagePayment += primaryPayment;
          console.log('Added primary mortgage:', { primaryBalance, primaryPayment });
        }
        
        if (mortgageData.secondary && mortgageData.secondary.balance > 0) {
          const secondaryBalance = Number(mortgageData.secondary.balance || 0);
          const secondaryPayment = Number(mortgageData.secondary.monthlyPayment || 0);
          const secondaryRate = Number(mortgageData.secondary.interestRate || 0);
          
          allDebts.push({
            name: 'Mortgage (Secondary)',
            balance: secondaryBalance,
            monthlyPayment: secondaryPayment,
            interestRate: secondaryRate,
          });
          totalMortgageBalance += secondaryBalance;
          totalMortgagePayment += secondaryPayment;
          console.log('Added secondary mortgage:', { secondaryBalance, secondaryPayment });
        }
      }
      
      // Add other debts - parse if it's a string
      let debts = cf.debts;
      if (typeof debts === 'string') {
        try {
          debts = JSON.parse(debts);
        } catch (e) {
          console.error('Failed to parse debts JSON:', e);
          debts = [];
        }
      }
      
      if (debts && Array.isArray(debts)) {
        debts.forEach((debt: any) => {
          if (debt.balance > 0) {
            allDebts.push({
              name: debt.name || 'Unnamed Debt',
              balance: Number(debt.balance || 0),
              monthlyPayment: Number(debt.monthlyPayment || 0),
              interestRate: Number(debt.interestRate || 0),
            });
          }
        });
      }
    });
    
    console.log('All debts breakdown:', allDebts);
    console.log('Total mortgage balance:', totalMortgageBalance);
    console.log('Total mortgage payment:', totalMortgagePayment);
    
    setDebtBreakdown(allDebts);
    
    // Calculate total debts including mortgage
    const otherDebts = cashflows?.reduce((sum, c) => sum + Number(c.total_debt || 0), 0) || 0;
    const totalDebts = otherDebts + totalMortgageBalance;
    
    console.log('Other debts:', otherDebts);
    console.log('Total debts (with mortgage):', totalDebts);
    
    // Calculate total monthly debt payment including mortgage
    const otherDebtPayments = cashflows?.reduce((sum, c) => sum + Number(c.monthly_debt_payment || 0), 0) || 0;
    const monthlyDebtPayment = otherDebtPayments + totalMortgagePayment;
    
    console.log('Monthly debt payment (with mortgage):', monthlyDebtPayment);
    
    const totalAssets = assets?.reduce((sum, a) => sum + Number(a.current_value || 0), 0) || 0;
    
    // Savings goals metrics
    const totalSavingsTarget = savings?.reduce((sum, s) => sum + Number(s.target_amount || 0), 0) || 0;
    const totalSavingsCurrent = savings?.reduce((sum, s) => sum + Number(s.current_amount || 0), 0) || 0;
    const monthlySavingsContribution = savings?.reduce((sum, s) => sum + Number(s.monthly_contribution || 0), 0) || 0;
    const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;
    
    const surplus = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;
    const debtToIncomeRatio = totalIncome > 0 ? (totalDebts / totalIncome) * 100 : 0;
    const netWorth = totalAssets - totalDebts;
    
    // Calculate months to debt freedom
    const debtFreeMonths = monthlyDebtPayment > 0 ? Math.ceil(totalDebts / monthlyDebtPayment) : 0;

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
      monthlySavingsContribution,
      totalSavingsTarget,
      totalSavingsCurrent,
      savingsProgress,
      monthlyDebtPayment,
      debtFreeMonths,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold text-foreground">Financial Insights</h2>
                <p className="text-muted-foreground mt-1">
                  {currentProject ? `Analysis for ${currentProject.project_name}` : 'Comprehensive analysis across all your budget plans'}
                </p>
              </div>
            </div>
            <FinancialAdvisorChat metrics={metrics} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-2">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
              <CardTitle className="text-sm font-medium">Annual Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${formatCurrency(metrics.totalAnnualIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
              <CardTitle className="text-sm font-medium">Annual Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatCurrency(metrics.totalAnnualExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
              <CardTitle className="text-sm font-medium">Annual Surplus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.annualSurplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ${formatCurrency(metrics.annualSurplus)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
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
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
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

        {/* Savings Goals Progress */}
        {metrics.savingsGoalsCount > 0 && (
          <Card className="mb-6 border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-accent/5 via-accent/3 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Savings Goals Progress
              </CardTitle>
              <CardDescription>Track your progress toward your financial goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Active Goals</div>
                  <div className="text-2xl font-bold text-primary">
                    {metrics.savingsGoalsCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Monthly Contribution</div>
                  <div className="text-2xl font-bold">
                    ${formatCurrency(metrics.monthlySavingsContribution)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Current Savings</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${formatCurrency(metrics.totalSavingsCurrent)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total Target</div>
                  <div className="text-2xl font-bold">
                    ${formatCurrency(metrics.totalSavingsTarget)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{metrics.savingsProgress.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all"
                    style={{ width: `${Math.min(metrics.savingsProgress, 100)}%` }}
                  />
                </div>
              </div>

              {metrics.savingsProgress >= 100 && (
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded">
                  <TrendingUp className="h-4 w-4" />
                  <span>Congratulations! You've reached your savings goals!</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Debt Payoff Timeline */}
        {metrics.totalDebts > 0 && (
          <Card className="mb-6 border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-destructive/5 via-destructive/3 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Debt Payoff Timeline
              </CardTitle>
              <CardDescription>Your path to becoming debt-free</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total Debt</div>
                  <div className="text-2xl font-bold text-destructive">
                    ${formatCurrency(metrics.totalDebts)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
                  <div className="text-2xl font-bold">
                    ${formatCurrency(metrics.monthlyDebtPayment)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Months to Freedom</div>
                  <div className="text-2xl font-bold text-primary">
                    {metrics.debtFreeMonths > 0 ? metrics.debtFreeMonths : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Individual Debt Breakdown */}
              {debtBreakdown.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="text-sm font-semibold text-muted-foreground">Debt Breakdown</div>
                  {debtBreakdown.map((debt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded border">
                      <div className="flex-1">
                        <div className="font-medium">{debt.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {debt.interestRate > 0 && `${debt.interestRate}% APR`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-destructive">
                          ${formatCurrency(debt.balance)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${formatCurrency(debt.monthlyPayment)}/mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {metrics.debtFreeMonths > 0 && (
                <div className="bg-muted/50 p-3 rounded mt-4">
                  <div className="text-sm font-medium mb-1">Projected Debt-Free Date</div>
                  <div className="text-lg font-bold">
                    {new Date(Date.now() + metrics.debtFreeMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Net Worth */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
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
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-accent/5 via-accent/3 to-transparent">
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
