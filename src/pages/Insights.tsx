import { useEffect, useState } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, Target, PiggyBank, CreditCard, Lightbulb, Info, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
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
    // Sum actual debt payments from the debts array instead of using stored monthly_debt_payment
    // to avoid double-counting mortgage
    const otherDebtPayments = allDebts
      .filter(d => !d.name.includes('Mortgage'))
      .reduce((sum, d) => sum + d.monthlyPayment, 0);
    const monthlyDebtPayment = otherDebtPayments + totalMortgagePayment;
    
    console.log('Other debt payments (excluding mortgage):', otherDebtPayments);
    console.log('Monthly debt payment (with mortgage):', monthlyDebtPayment);
    
    const totalAssets = assets?.reduce((sum, a) => sum + Number(a.current_value || 0), 0) || 0;
    
    // Savings goals metrics
    const totalSavingsTarget = savings?.reduce((sum, s) => sum + Number(s.target_amount || 0), 0) || 0;
    const totalSavingsCurrent = savings?.reduce((sum, s) => sum + Number(s.current_amount || 0), 0) || 0;
    const monthlySavingsContribution = savings?.reduce((sum, s) => sum + Number(s.monthly_contribution || 0), 0) || 0;
    const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;
    
    const surplus = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;
    
    // Calculate debt-to-income ratio using MONTHLY payments vs MONTHLY gross income
    const monthlyGrossIncome = budgets?.reduce((sum, b) => sum + Number(b.gross_income || 0), 0) / 12 || 0;
    const debtToIncomeRatio = monthlyGrossIncome > 0 ? (monthlyDebtPayment / monthlyGrossIncome) * 100 : 0;
    
    console.log('DTI Calculation:', {
      monthlyDebtPayment,
      monthlyGrossIncome,
      debtToIncomeRatio: debtToIncomeRatio.toFixed(1) + '%'
    });
    console.log('Savings Rate:', {
      surplus,
      totalIncome,
      savingsRate: savingsRate.toFixed(1) + '%'
    });
    
    const netWorth = totalAssets - totalDebts;
    
    // Calculate months to debt freedom (considering interest)
    // Calculate payoff time for each individual debt, then take the maximum
    let debtFreeMonths = 0;
    
    allDebts.forEach(debt => {
      if (debt.monthlyPayment > 0 && debt.balance > 0) {
        const monthlyRate = (debt.interestRate / 100) / 12;
        let monthsToPayoff = 0;
        
        if (monthlyRate > 0) {
          // Check if payment covers interest
          const monthlyInterest = debt.balance * monthlyRate;
          if (debt.monthlyPayment > monthlyInterest) {
            // Standard amortization formula: n = -log(1 - (P * r / M)) / log(1 + r)
            monthsToPayoff = Math.ceil(
              -Math.log(1 - (debt.balance * monthlyRate / debt.monthlyPayment)) / 
              Math.log(1 + monthlyRate)
            );
          } else {
            // Payment doesn't cover interest - will never be paid off
            monthsToPayoff = 999;
          }
        } else {
          // No interest, simple division
          monthsToPayoff = Math.ceil(debt.balance / debt.monthlyPayment);
        }
        
        // Track the longest payoff time
        debtFreeMonths = Math.max(debtFreeMonths, monthsToPayoff);
        
        console.log(`${debt.name}: ${monthsToPayoff} months to payoff`);
      }
    });

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
    <div className="min-h-screen bg-[image:var(--gradient-sky)] relative overflow-hidden">
      {/* Organic Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <Lightbulb className="h-9 w-9 text-secondary" />
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                  {currentProject?.project_type === 'business' ? 'Business Performance' : 'Financial Insights'}
                </h2>
                <p className="text-muted-foreground mt-1 text-lg">
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
              <CardTitle className="text-sm font-medium">
                {currentProject?.project_type === 'business' ? 'Annual Revenue' : 'Annual Net Income'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${formatCurrency(metrics.totalAnnualIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentProject?.project_type === 'business' ? 'Gross annual revenue' : 'After-tax income'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 rounded-[2rem] hover:[box-shadow:var(--shadow-leaf)] transition-all duration-500">
            <CardHeader className="pb-3 bg-gradient-to-br from-secondary/10 to-transparent rounded-t-[2rem]">
              <CardTitle className="text-sm font-semibold">
                {currentProject?.project_type === 'business' ? 'Operating Expenses' : 'Annual Expenses'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatCurrency(metrics.totalAnnualExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 rounded-[2rem] hover:[box-shadow:var(--shadow-leaf)] transition-all duration-500">
            <CardHeader className="pb-3 bg-gradient-to-br from-accent/10 to-transparent rounded-t-[2rem]">
              <CardTitle className="text-sm font-semibold">
                {currentProject?.project_type === 'business' ? 'Net Profit' : 'Annual Surplus'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.annualSurplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ${formatCurrency(metrics.annualSurplus)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 rounded-[2rem] hover:[box-shadow:var(--shadow-leaf)] transition-all duration-500">
            <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 to-transparent rounded-t-[2rem]">
              <CardTitle className="text-sm font-semibold">
                {currentProject?.project_type === 'business' ? 'Profit Margin' : 'Savings Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {metrics.savingsRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentProject?.project_type === 'business' ? 'Net profit / revenue' : 'Surplus / income'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Ratios */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
            <CardTitle>
              {currentProject?.project_type === 'business' ? 'Business Performance Ratios' : 'Financial Ratios'}
            </CardTitle>
            <CardDescription>
              {currentProject?.project_type === 'business' 
                ? 'Key indicators of business health and efficiency'
                : 'Key indicators of your financial health'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={140}>
               <BarChart
                data={[
                  {
                    name: currentProject?.project_type === 'business' ? 'Debt Service Coverage' : 'Debt-to-Income',
                    value: Number(metrics.debtToIncomeRatio.toFixed(1)),
                    target: currentProject?.project_type === 'business' ? 1.25 : 28,
                    max: 100,
                    unit: '%',
                    excellent: currentProject?.project_type === 'business' ? 1.5 : 28,
                    good: currentProject?.project_type === 'business' ? 1.25 : 36,
                    fair: currentProject?.project_type === 'business' ? 1.0 : 43,
                  },
                  {
                    name: currentProject?.project_type === 'business' ? 'Profit Margin' : 'Savings Rate',
                    value: Number(metrics.savingsRate.toFixed(1)),
                    target: currentProject?.project_type === 'business' ? 15 : 20,
                    max: 100,
                    unit: '%',
                    excellent: currentProject?.project_type === 'business' ? 15 : 20,
                    good: currentProject?.project_type === 'business' ? 10 : 15,
                    fair: currentProject?.project_type === 'business' ? 5 : 10,
                  },
                ]}
                layout="vertical"
                margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={13}
                  fontWeight={500}
                  width={110}
                />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isDebtRatio = data.name === 'Debt-to-Income';
                      
                      let status = '';
                      let statusColor = '';
                      
                      if (isDebtRatio) {
                        if (data.value < 28) {
                          status = 'Excellent';
                          statusColor = 'text-primary';
                        } else if (data.value < 36) {
                          status = 'Good';
                          statusColor = 'text-yellow-600';
                        } else if (data.value < 43) {
                          status = 'Fair';
                          statusColor = 'text-orange-600';
                        } else {
                          status = 'Poor';
                          statusColor = 'text-destructive';
                        }
                      } else {
                        if (data.value >= 20) {
                          status = 'Excellent';
                          statusColor = 'text-primary';
                        } else if (data.value >= 15) {
                          status = 'Good';
                          statusColor = 'text-yellow-600';
                        } else if (data.value >= 10) {
                          status = 'Fair';
                          statusColor = 'text-orange-600';
                        } else {
                          status = 'Poor';
                          statusColor = 'text-destructive';
                        }
                      }
                      
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold mb-1">{data.name}</p>
                          <p className="text-2xl font-bold text-primary mb-1">{data.value}%</p>
                          <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: {isDebtRatio ? 'Below' : 'Above'} {data.target}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 8, 8, 0]}
                  maxBarSize={50}
                >
                  {[
                    {
                      name: 'Debt-to-Income',
                      value: Number(metrics.debtToIncomeRatio.toFixed(1)),
                    },
                    {
                      name: 'Savings Rate',
                      value: Number(metrics.savingsRate.toFixed(1)),
                    },
                  ].map((entry, index) => {
                    let fillColor = 'hsl(var(--primary))';
                    
                    if (entry.name === 'Debt-to-Income') {
                      if (entry.value >= 43) fillColor = 'hsl(var(--destructive))';
                      else if (entry.value >= 36) fillColor = 'hsl(20 100% 50%)'; // orange
                      else if (entry.value >= 28) fillColor = 'hsl(45 100% 50%)'; // yellow
                    } else {
                      if (entry.value < 10) fillColor = 'hsl(var(--destructive))';
                      else if (entry.value < 15) fillColor = 'hsl(20 100% 50%)';
                      else if (entry.value < 20) fillColor = 'hsl(45 100% 50%)';
                    }
                    
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    formatter={(value: number) => `${value}%`}
                    style={{ 
                      fill: 'hsl(var(--foreground))',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Legends and Info */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">Debt-to-Income Ratio</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Financial Health Standards:</p>
                        <ul className="text-xs space-y-1">
                          <li>• <strong>Excellent:</strong> Below 28%</li>
                          <li>• <strong>Good:</strong> 28-36%</li>
                          <li>• <strong>Fair:</strong> 36-43%</li>
                          <li>• <strong>Poor:</strong> Above 43%</li>
                        </ul>
                        <p className="text-xs mt-2 text-muted-foreground">
                          Lenders typically prefer DTI below 43%. Lower is better for financial flexibility.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary font-medium">Excellent: &lt;28%</span>
                  <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-medium">Good: 28-36%</span>
                  <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-700 dark:text-orange-400 font-medium">Fair: 36-43%</span>
                  <span className="px-2 py-1 rounded bg-destructive/20 text-destructive font-medium">Poor: &gt;43%</span>
                </div>
                {metrics.debtToIncomeRatio > 43 && (
                  <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Consider debt reduction strategies.</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">Savings Rate</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Financial Health Standards:</p>
                        <ul className="text-xs space-y-1">
                          <li>• <strong>Excellent:</strong> 20% or more</li>
                          <li>• <strong>Good:</strong> 15-20%</li>
                          <li>• <strong>Fair:</strong> 10-15%</li>
                          <li>• <strong>Poor:</strong> Below 10%</li>
                        </ul>
                        <p className="text-xs mt-2 text-muted-foreground">
                          The 50/30/20 rule recommends saving 20% of income. Higher rates accelerate wealth building.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-destructive/20 text-destructive font-medium">Poor: &lt;10%</span>
                  <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-700 dark:text-orange-400 font-medium">Fair: 10-15%</span>
                  <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-medium">Good: 15-20%</span>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary font-medium">Excellent: &gt;20%</span>
                </div>
                {metrics.savingsRate < 20 && (
                  <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Aim for at least 20% for financial security.</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Financial Ratios */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
            <CardTitle>
              {currentProject?.project_type === 'business' ? 'Additional Business Metrics' : 'Additional Financial Metrics'}
            </CardTitle>
            <CardDescription>
              {currentProject?.project_type === 'business' 
                ? 'Financial position and operational efficiency'
                : 'More indicators of your financial health'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Debt-to-Asset Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Debt-to-Asset Ratio</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Financial Health Standards:</p>
                        <ul className="text-xs space-y-1">
                          <li>• <strong>Excellent:</strong> Below 30%</li>
                          <li>• <strong>Good:</strong> 30-50%</li>
                          <li>• <strong>Fair:</strong> 50-70%</li>
                          <li>• <strong>Poor:</strong> Above 70%</li>
                        </ul>
                        <p className="text-xs mt-2 text-muted-foreground">
                          Shows what portion of your assets are financed by debt. Lower is better.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={`font-bold ${(metrics.totalDebts / metrics.totalAssets * 100) > 70 ? 'text-destructive' : 'text-primary'}`}>
                  {metrics.totalAssets > 0 ? ((metrics.totalDebts / metrics.totalAssets) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                ${formatCurrency(metrics.totalDebts)} debt / ${formatCurrency(metrics.totalAssets)} assets
              </div>
            </div>

            {/* Net Worth to Income Ratio / Asset Turnover */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {currentProject?.project_type === 'business' ? 'Asset Efficiency' : 'Net Worth to Income'}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {currentProject?.project_type === 'business' ? (
                          <>
                            <p className="font-semibold mb-1">Asset Efficiency Standards:</p>
                            <ul className="text-xs space-y-1">
                              <li>• <strong>Excellent:</strong> Revenue / Assets &gt; 1.5x</li>
                              <li>• <strong>Good:</strong> 1.0-1.5x</li>
                              <li>• <strong>Fair:</strong> 0.5-1.0x</li>
                              <li>• <strong>Poor:</strong> Below 0.5x</li>
                            </ul>
                            <p className="text-xs mt-2 text-muted-foreground">
                              Measures how efficiently assets generate revenue. Higher is better.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold mb-1">Target by Age:</p>
                            <ul className="text-xs space-y-1">
                              <li>• <strong>Age 30:</strong> 1x annual income</li>
                              <li>• <strong>Age 40:</strong> 3x annual income</li>
                              <li>• <strong>Age 50:</strong> 6x annual income</li>
                              <li>• <strong>Age 60:</strong> 8x annual income</li>
                            </ul>
                            <p className="text-xs mt-2 text-muted-foreground">
                              Measures wealth accumulation relative to income. Higher is better.
                            </p>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-bold text-primary">
                  {metrics.totalAnnualIncome > 0 ? (
                    currentProject?.project_type === 'business' 
                      ? ((metrics.totalAnnualIncome / (metrics.totalAssets || 1))).toFixed(1)
                      : ((metrics.netWorth / metrics.totalAnnualIncome)).toFixed(1)
                  ) : '0.0'}x
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {currentProject?.project_type === 'business' 
                  ? `$${formatCurrency(metrics.totalAnnualIncome)} revenue / $${formatCurrency(metrics.totalAssets)} assets`
                  : `$${formatCurrency(metrics.netWorth)} net worth / $${formatCurrency(metrics.totalAnnualIncome)} income`
                }
              </div>
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

        {/* Debt Payoff Timeline - Collapsible */}
        {metrics.totalDebts > 0 && (
          <Collapsible defaultOpen={false}>
            <Card className="mb-6 border-2 shadow-lg">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="bg-gradient-to-r from-destructive/5 via-destructive/3 to-transparent hover:from-destructive/10 hover:via-destructive/5 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <div className="text-left">
                        <CardTitle>Debt Payoff Timeline</CardTitle>
                        <CardDescription>Your path to becoming debt-free</CardDescription>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 transition-transform ui-expanded:rotate-180" />
                  </div>
                  
                  {/* Summary View (always visible) */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Total Debt</div>
                      <div className="text-lg font-bold text-destructive">
                        ${formatCurrency(metrics.totalDebts)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Monthly Payment</div>
                      <div className="text-lg font-bold">
                        ${formatCurrency(metrics.monthlyDebtPayment)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Months to Freedom</div>
                      <div className="text-lg font-bold text-primary">
                        {metrics.debtFreeMonths > 0 && metrics.debtFreeMonths < 999 ? metrics.debtFreeMonths : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4 pt-4">
                  {/* Individual Debt Breakdown */}
                  {debtBreakdown.length > 0 && (
                    <div className="space-y-3">
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

                  {metrics.debtFreeMonths > 0 && metrics.debtFreeMonths < 999 && (
                    <div className="bg-muted/50 p-3 rounded">
                      <div className="text-sm font-medium mb-1">Projected Debt-Free Date</div>
                      <div className="text-lg font-bold">
                        {new Date(Date.now() + metrics.debtFreeMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
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
