import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Home, DollarSign, TrendingUp, Wallet, ChevronRight, Sparkles, Calculator, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { formatCurrency } from '@/lib/utils';
import { useProject } from '@/contexts/ProjectContext';

interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  interestRate: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  startDate?: string;
  duration?: number;
}

interface ExpenseAdjustment {
  id: string;
  expenseId: string;
  expenseName: string;
  newAmount: number | '';
}

interface DebtConsolidation {
  debt1Id: string;
  debt2Id: string;
  newDebtName: string;
  newBalance: number;
  newInterestRate: number;
  newMonthlyPayment: number;
}

interface Adjustments {
  incomeAdjustment?: {
    amount: number;
    type: 'gross' | 'net';
    description: string;
  };
  expenseAdjustments: ExpenseAdjustment[];
  debtConsolidation?: DebtConsolidation;
}

function CashflowContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtPayment, setNewDebtPayment] = useState('');
  const [newDebtInterest, setNewDebtInterest] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [monthlyNetIncome, setMonthlyNetIncome] = useState(0);
  
  // Mortgage states
  const [primaryMortgageBalance, setPrimaryMortgageBalance] = useState('');
  const [primaryMortgageInterest, setPrimaryMortgageInterest] = useState('');
  const [primaryMortgagePayment, setPrimaryMortgagePayment] = useState('');
  const [secondaryMortgageBalance, setSecondaryMortgageBalance] = useState('');
  const [secondaryMortgageInterest, setSecondaryMortgageInterest] = useState('');
  const [secondaryMortgagePayment, setSecondaryMortgagePayment] = useState('');
  
  // Adjustments states
  const [adjustments, setAdjustments] = useState<Adjustments>({
    expenseAdjustments: [],
  });
  const [incomeAdjAmount, setIncomeAdjAmount] = useState('');
  const [incomeAdjType, setIncomeAdjType] = useState<'gross' | 'net'>('net');
  const [incomeAdjDesc, setIncomeAdjDesc] = useState('');
  const [expenseAdjustments, setExpenseAdjustments] = useState<ExpenseAdjustment[]>([]);
  const [consolidateDebt1, setConsolidateDebt1] = useState('');
  const [consolidateDebt2, setConsolidateDebt2] = useState('');
  const [consolidatedName, setConsolidatedName] = useState('');
  const [consolidatedBalance, setConsolidatedBalance] = useState('');
  const [consolidatedRate, setConsolidatedRate] = useState('');
  const [consolidatedPayment, setConsolidatedPayment] = useState('');

  // Calculate expenses for a specific month (0-indexed)
  const calculateMonthlyExpense = (monthIndex: number) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = monthIndex; // 0-11
    
    let totalExpense = 0;
    
    // Add regular expenses (those without startDate or duration, or within their active period)
    expenses.forEach(expense => {
      if (!expense.startDate || !expense.duration) {
        // No start date/duration means it's a recurring monthly expense
        totalExpense += expense.amount;
      } else {
        const startDate = new Date(expense.startDate);
        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();
        
        // Calculate months since start (assuming current year for simplicity)
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
        
        // Check if current month is within the duration
        if (monthsSinceStart >= 0 && monthsSinceStart < expense.duration) {
          totalExpense += expense.amount;
        }
      }
    });
    
    // Add subscription costs (monthly equivalent)
    const totalAnnualSubscriptions = subscriptions.reduce((sum, sub) => {
      const annualAmount = sub.billingCycle === 'monthly' ? sub.amount * 12 :
                          sub.billingCycle === 'quarterly' ? sub.amount * 4 :
                          sub.amount;
      return sum + annualAmount;
    }, 0);
    totalExpense += totalAnnualSubscriptions / 12;
    
    return totalExpense;
  };

  // Load existing cashflow data
  useEffect(() => {
    if (currentProject) {
      loadCashflowData();
    }
  }, [currentProject]);

  const loadCashflowData = async () => {
    if (!currentProject) return;

    try {
      // Load budget plan data for expenses
      const { data: budgetData } = await supabase
        .from('budget_plans')
        .select('total_expenses, net_income, expenses, subscriptions')
        .eq('id', currentProject.id)
        .single();

      if (budgetData) {
        // Convert annual values to monthly
        setMonthlyExpenses(Number(budgetData.total_expenses) / 12 || 0);
        setMonthlyNetIncome(Number(budgetData.net_income) / 12 || 0);
        
        // Load individual expenses
        if (budgetData.expenses) {
          const parsedExpenses = typeof budgetData.expenses === 'string'
            ? JSON.parse(budgetData.expenses)
            : budgetData.expenses;
          setExpenses(parsedExpenses || []);
        }
        
        // Load subscriptions
        if (budgetData.subscriptions) {
          const parsedSubscriptions = typeof budgetData.subscriptions === 'string'
            ? JSON.parse(budgetData.subscriptions)
            : budgetData.subscriptions;
          setSubscriptions(parsedSubscriptions || []);
        }
      }

      // Load cashflow records
      const { data, error } = await supabase
        .from('cashflow_records')
        .select('*')
        .eq('budget_plan_id', currentProject.id)
        .maybeSingle();

      if (error) throw error;

      if (data && data.debts) {
        const parsedDebts = typeof data.debts === 'string'
          ? JSON.parse(data.debts)
          : data.debts;
        console.log('Loaded debts from database:', parsedDebts);
        setDebts(parsedDebts || []);
      }

      // Load mortgage data
      if (data && data.mortgage) {
        const mortgageData = typeof data.mortgage === 'string'
          ? JSON.parse(data.mortgage)
          : data.mortgage;
        setPrimaryMortgageBalance(mortgageData.primary?.balance?.toString() || '');
        setPrimaryMortgageInterest(mortgageData.primary?.interestRate?.toString() || '');
        setPrimaryMortgagePayment(mortgageData.primary?.monthlyPayment?.toString() || '');
        setSecondaryMortgageBalance(mortgageData.secondary?.balance?.toString() || '');
        setSecondaryMortgageInterest(mortgageData.secondary?.interestRate?.toString() || '');
        setSecondaryMortgagePayment(mortgageData.secondary?.monthlyPayment?.toString() || '');
      }
      
      // Load adjustments
      if (data && data.adjustments) {
        const parsedAdjustments = typeof data.adjustments === 'string'
          ? JSON.parse(data.adjustments)
          : data.adjustments;
        setAdjustments(parsedAdjustments || { expenseAdjustments: [] });
        
        if (parsedAdjustments.incomeAdjustment) {
          setIncomeAdjAmount(parsedAdjustments.incomeAdjustment.amount?.toString() || '');
          setIncomeAdjType(parsedAdjustments.incomeAdjustment.type || 'net');
          setIncomeAdjDesc(parsedAdjustments.incomeAdjustment.description || '');
        }
        
        if (parsedAdjustments.expenseAdjustments) {
          setExpenseAdjustments(parsedAdjustments.expenseAdjustments);
        }
        
        if (parsedAdjustments.debtConsolidation) {
          const dc = parsedAdjustments.debtConsolidation;
          console.log('Loading debt consolidation from database:', dc);
          setConsolidateDebt1(dc.debt1Id || '');
          setConsolidateDebt2(dc.debt2Id || '');
          setConsolidatedName(dc.newDebtName || '');
          setConsolidatedBalance(dc.newBalance?.toString() || '');
          setConsolidatedRate(dc.newInterestRate?.toString() || '');
          setConsolidatedPayment(dc.newMonthlyPayment?.toString() || '');
        } else {
          console.log('No debt consolidation data found in database');
        }
      }
    } catch (error: any) {
      console.error('Error loading cashflow data:', error);
    }
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyPayment = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  
  // Calculate mortgage totals
  const primaryMortgageBalanceNum = parseFloat(primaryMortgageBalance) || 0;
  const primaryMortgageInterestNum = parseFloat(primaryMortgageInterest) || 0;
  const primaryMortgagePaymentNum = parseFloat(primaryMortgagePayment) || 0;
  const secondaryMortgageBalanceNum = parseFloat(secondaryMortgageBalance) || 0;
  const secondaryMortgageInterestNum = parseFloat(secondaryMortgageInterest) || 0;
  const secondaryMortgagePaymentNum = parseFloat(secondaryMortgagePayment) || 0;
  
  const primaryAnnualInterest = (primaryMortgageBalanceNum * primaryMortgageInterestNum) / 100;
  const secondaryAnnualInterest = (secondaryMortgageBalanceNum * secondaryMortgageInterestNum) / 100;
  const otherDebtsAnnualInterest = debts.reduce((sum, debt) => {
    const debtInterest = (debt.balance * debt.interestRate) / 100;
    console.log(`Debt: ${debt.name}, Balance: ${debt.balance}, Rate: ${debt.interestRate}%, Annual Interest: ${debtInterest}`);
    return sum + debtInterest;
  }, 0);
  
  console.log('Interest Breakdown:', {
    primaryAnnual: primaryAnnualInterest,
    secondaryAnnual: secondaryAnnualInterest,
    otherDebtsAnnual: otherDebtsAnnualInterest,
    totalAnnual: primaryAnnualInterest + secondaryAnnualInterest + otherDebtsAnnualInterest
  });
  
  const totalAnnualInterest = primaryAnnualInterest + secondaryAnnualInterest + otherDebtsAnnualInterest;
  const totalMonthlyInterest = totalAnnualInterest / 12;
  
  // Total monthly payment includes mortgages and other debts
  const totalMonthlyPayment = monthlyPayment + primaryMortgagePaymentNum + secondaryMortgagePaymentNum;

  const addDebt = () => {
    if (newDebtName && newDebtBalance && newDebtPayment) {
      const newDebt = {
        id: Date.now().toString(),
        name: newDebtName,
        balance: parseFloat(newDebtBalance) || 0,
        monthlyPayment: parseFloat(newDebtPayment) || 0,
        interestRate: parseFloat(newDebtInterest) || 0,
      };
      
      setDebts([...debts, newDebt]);
      
      // Clear input fields after adding
      setNewDebtName('');
      setNewDebtBalance('');
      setNewDebtPayment('');
      setNewDebtInterest('');
    }
  };

  const clearIncomeAdjustment = () => {
    setIncomeAdjDesc('');
    setIncomeAdjAmount('');
    setIncomeAdjType('net');
  };

  const clearExpenseAdjustments = () => {
    setExpenseAdjustments([]);
  };

  const clearDebtConsolidation = () => {
    setConsolidateDebt1('');
    setConsolidateDebt2('');
    setConsolidatedName('');
    setConsolidatedBalance('');
    setConsolidatedRate('');
    setConsolidatedPayment('');
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  const saveCashflow = async () => {
    if (!user || !currentProject) {
      toast.error('Please select a project first');
      return;
    }

    console.log('Saving cashflow data...', { 
      debtsCount: debts.length,
      debts, 
      primaryMortgageBalanceNum, 
      secondaryMortgageBalanceNum 
    });

    try {
      // Check if a cashflow record already exists for this project
      const { data: existingRecord, error: checkError } = await supabase
        .from('cashflow_records')
        .select('id')
        .eq('budget_plan_id', currentProject.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing record:', checkError);
        throw checkError;
      }

      console.log('Existing record:', existingRecord);

      const mortgageData = {
        primary: {
          balance: primaryMortgageBalanceNum,
          interestRate: primaryMortgageInterestNum,
          monthlyPayment: primaryMortgagePaymentNum,
        },
        secondary: {
          balance: secondaryMortgageBalanceNum,
          interestRate: secondaryMortgageInterestNum,
          monthlyPayment: secondaryMortgagePaymentNum,
        },
      };
      
      // Prepare adjustments data
      const adjustmentsData: Adjustments = {
        expenseAdjustments,
      };
      
      if (incomeAdjAmount) {
        adjustmentsData.incomeAdjustment = {
          amount: parseFloat(incomeAdjAmount),
          type: incomeAdjType,
          description: incomeAdjDesc,
        };
      }
      
      if (consolidateDebt1 && consolidateDebt2 && consolidatedName) {
        adjustmentsData.debtConsolidation = {
          debt1Id: consolidateDebt1,
          debt2Id: consolidateDebt2,
          newDebtName: consolidatedName,
          newBalance: parseFloat(consolidatedBalance) || 0,
          newInterestRate: parseFloat(consolidatedRate) || 0,
          newMonthlyPayment: parseFloat(consolidatedPayment) || 0,
        };
        console.log('Saving debt consolidation:', adjustmentsData.debtConsolidation);
      } else {
        console.log('Debt consolidation not saved. Values:', { consolidateDebt1, consolidateDebt2, consolidatedName });
      }

      if (existingRecord) {
        // Update existing record
        console.log('Updating existing record...');
        const debtsToSave = JSON.stringify(debts);
        console.log('Debts being saved:', debtsToSave);
        const { data, error } = await supabase
          .from('cashflow_records')
          .update({
            debts: debtsToSave,
            mortgage: JSON.stringify(mortgageData),
            adjustments: JSON.stringify(adjustmentsData),
            total_debt: totalDebt,
            monthly_debt_payment: totalMonthlyPayment,
            available_cashflow: 0,
          })
          .eq('budget_plan_id', currentProject.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update successful:', data);
      } else {
        // Create new record
        console.log('Creating new record...');
        const debtsToSave = JSON.stringify(debts);
        console.log('Debts being saved:', debtsToSave);
        const { data, error } = await supabase
          .from('cashflow_records')
          .insert({
            user_id: user.id,
            budget_plan_id: currentProject.id,
            debts: debtsToSave,
            mortgage: JSON.stringify(mortgageData),
            adjustments: JSON.stringify(adjustmentsData),
            total_debt: totalDebt,
            monthly_debt_payment: totalMonthlyPayment,
            available_cashflow: 0,
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert successful:', data);
      }

      toast.success('Cashflow data saved successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Save cashflow error:', error);
      toast.error(error.message || 'Failed to save cashflow data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6 border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Debt Tracking</CardTitle>
                </div>
                <CardDescription>Manage your debts and monthly payments</CardDescription>
              </div>
              <Button onClick={saveCashflow} className="shadow-md hover:shadow-lg transition-all duration-300">
                <DollarSign className="h-4 w-4 mr-2" />
                Save Cashflow Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="multiple" defaultValue={['mortgages', 'other-debts']} className="w-full">
              {/* Mortgage Section */}
              <AccordionItem value="mortgages" className="border rounded-lg px-4 mb-3">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    <span>Mortgages</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Primary Mortgage */}
                  <div className="bg-gradient-to-br from-muted via-muted/50 to-background p-4 rounded-lg border shadow-sm space-y-2">
                    <div className="font-medium flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      Primary Mortgage
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Total Balance</Label>
                        <Input
                          type="number"
                          placeholder="Total balance"
                          value={primaryMortgageBalance}
                          onChange={(e) => setPrimaryMortgageBalance(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Interest Rate (%)</Label>
                        <Input
                          type="number"
                          placeholder="Interest rate"
                          value={primaryMortgageInterest}
                          onChange={(e) => setPrimaryMortgageInterest(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Monthly Payment</Label>
                        <Input
                          type="number"
                          placeholder="Monthly payment"
                          value={primaryMortgagePayment}
                          onChange={(e) => setPrimaryMortgagePayment(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Mortgage */}
                  <div className="bg-gradient-to-br from-muted via-muted/50 to-background p-4 rounded-lg border shadow-sm space-y-2">
                    <div className="font-medium flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      Secondary Mortgage
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Total Balance</Label>
                        <Input
                          type="number"
                          placeholder="Total balance"
                          value={secondaryMortgageBalance}
                          onChange={(e) => setSecondaryMortgageBalance(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Interest Rate (%)</Label>
                        <Input
                          type="number"
                          placeholder="Interest rate"
                          value={secondaryMortgageInterest}
                          onChange={(e) => setSecondaryMortgageInterest(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Monthly Payment</Label>
                        <Input
                          type="number"
                          placeholder="Monthly payment"
                          value={secondaryMortgagePayment}
                          onChange={(e) => setSecondaryMortgagePayment(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Other Debts Section */}
              <AccordionItem value="other-debts" className="border rounded-lg px-4 mb-3">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Other Debts</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Debt name (e.g., Car Loan)"
                value={newDebtName}
                onChange={(e) => setNewDebtName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Total balance"
                value={newDebtBalance}
                onChange={(e) => setNewDebtBalance(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Interest rate (%)"
                value={newDebtInterest}
                onChange={(e) => setNewDebtInterest(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Monthly payment"
                  value={newDebtPayment}
                  onChange={(e) => setNewDebtPayment(e.target.value)}
                />
                <Button onClick={addDebt} className="hover:scale-105 transition-transform">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {debts.map((debt) => (
                    <div key={debt.id} className="bg-gradient-to-r from-muted/80 to-muted/40 p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{debt.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDebt(debt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="ml-2 font-medium">${formatCurrency(debt.balance)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Interest:</span>
                          <span className="ml-2 font-medium">{debt.interestRate.toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Monthly:</span>
                          <span className="ml-2 font-medium">${formatCurrency(debt.monthlyPayment)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {debts.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Debt:</span>
                      <span className="font-bold text-destructive">${formatCurrency(totalDebt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Monthly Debt Payment:</span>
                      <span className="font-bold">${formatCurrency(monthlyPayment)}</span>
                    </div>
                  </div>
                )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Interest Summary Section - moved under Debt Tracking */}
            {(primaryMortgageBalanceNum > 0 || secondaryMortgageBalanceNum > 0 || debts.length > 0) && (
              <div className="mt-6 pt-6 border-t-2 border-dashed">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Interest Summary</h3>
                </div>
                <div className="text-sm text-muted-foreground mb-4">Total interest calculations for all debts</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="text-sm text-muted-foreground mb-1">Monthly Interest</div>
                    <div className="text-2xl font-bold">${formatCurrency(totalMonthlyInterest)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="text-sm text-muted-foreground mb-1">Annual Interest</div>
                    <div className="text-2xl font-bold">${formatCurrency(totalAnnualInterest)}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Cashflow Table */}
        {currentProject && (() => {
          // Calculate monthly adjustment impact
          const calculateMonthlyAdjustment = () => {
            let adjustment = 0;
            
            // Income adjustment
            if (incomeAdjAmount) {
              const adjAmount = parseFloat(incomeAdjAmount) || 0;
              if (incomeAdjType === 'net') {
                adjustment += adjAmount;
              } else {
                // Approximate net from gross (assuming 25% deductions)
                adjustment += adjAmount * 0.75;
              }
            }
            
            // Expense adjustments
            expenseAdjustments.forEach(adj => {
              const originalExpense = expenses.find(e => e.id === adj.expenseId);
              if (originalExpense && adj.newAmount !== '') {
                adjustment += (originalExpense.amount - (typeof adj.newAmount === 'number' ? adj.newAmount : parseFloat(adj.newAmount) || 0));
              }
            });
            
            // Debt consolidation
            if (consolidateDebt1 && consolidateDebt2 && consolidatedPayment) {
              const debt1 = debts.find(d => d.id === consolidateDebt1);
              const debt2 = debts.find(d => d.id === consolidateDebt2);
              const oldPayments = (debt1?.monthlyPayment || 0) + (debt2?.monthlyPayment || 0);
              const newPayment = parseFloat(consolidatedPayment) || 0;
              adjustment += (oldPayments - newPayment);
            }
            
            return adjustment;
          };
          
          const monthlyAdjustment = calculateMonthlyAdjustment();
          const totalAdjustment = monthlyAdjustment * 12;
          
          return (
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Cashflow Projection</CardTitle>
                    <CardDescription>Monthly breakdown of income and expenses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={['total']}>
                  {/* Total Row - Shown by Default */}
                <AccordionItem value="total">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-primary/5 px-4 py-3 rounded-lg">
                      <div className="grid grid-cols-8 gap-3 w-full pr-4 text-sm">
                        <div className="font-bold text-primary">Annual Totals</div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Net Income</div>
                          <div className="font-bold text-primary">${formatCurrency(monthlyNetIncome * 12)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Expenses</div>
                          <div className="font-bold text-destructive">${formatCurrency(monthlyExpenses * 12)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Debt</div>
                          <div className="font-bold">${formatCurrency((totalMonthlyPayment - totalMonthlyInterest) * 12)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Interest</div>
                          <div className="font-bold">${formatCurrency(totalMonthlyInterest * 12)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Cum. Surplus</div>
                          <div className={`font-bold ${(monthlyNetIncome - monthlyExpenses - totalMonthlyPayment) * 12 >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${formatCurrency((monthlyNetIncome - monthlyExpenses - totalMonthlyPayment) * 12)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Adjustments</div>
                          <div className={`font-bold ${totalAdjustment >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${formatCurrency(totalAdjustment)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Adj. Surplus</div>
                          <div className={`font-bold ${((monthlyNetIncome - monthlyExpenses - totalMonthlyPayment) * 12 + totalAdjustment) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${formatCurrency((monthlyNetIncome - monthlyExpenses - totalMonthlyPayment) * 12 + totalAdjustment)}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                        {/* Header Row */}
                        <div className="grid grid-cols-8 gap-3 text-sm font-semibold border-b-2 border-primary/20 pb-3 mb-2">
                          <div className="text-primary">Month</div>
                          <div className="text-right">Net Income</div>
                          <div className="text-right">Expenses</div>
                          <div className="text-right">Debt</div>
                          <div className="text-right">Interest</div>
                          <div className="text-right">Surplus</div>
                          <div className="text-right">Adjustment</div>
                          <div className="text-right">Adj. Surplus</div>
                        </div>
                        
                        {/* Monthly Rows */}
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                          const expenses = calculateMonthlyExpense(index);
                          const monthlyDebtPrincipal = totalMonthlyPayment - totalMonthlyInterest;
                          const monthlyInterest = totalMonthlyInterest;
                          const surplus = monthlyNetIncome - expenses - totalMonthlyPayment;
                          const adjustedSurplus = surplus + monthlyAdjustment;
                          
                          return (
                            <div key={month} className="grid grid-cols-8 gap-3 text-sm py-3 hover:bg-primary/5 rounded-lg px-3 transition-colors border-b border-muted">
                              <div className="font-medium">{month}</div>
                              <div className="text-right">${formatCurrency(monthlyNetIncome)}</div>
                              <div className="text-right text-destructive">${formatCurrency(expenses)}</div>
                              <div className="text-right">${formatCurrency(monthlyDebtPrincipal)}</div>
                              <div className="text-right">${formatCurrency(monthlyInterest)}</div>
                              <div className={`text-right font-semibold ${surplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                ${formatCurrency(surplus)}
                              </div>
                              <div className={`text-right ${monthlyAdjustment >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                ${formatCurrency(monthlyAdjustment)}
                              </div>
                              <div className={`text-right font-semibold ${adjustedSurplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                ${formatCurrency(adjustedSurplus)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })()}

        {/* Adjustments Section - moved after Cashflow Projection */}
        <Card className="mb-6 border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-accent/5 via-accent/3 to-transparent">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Adjustments</CardTitle>
                <CardDescription>Create "what if" scenarios without affecting your budget</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {/* Income Adjustment */}
              <AccordionItem value="income-adj" className="border rounded-lg px-4 mb-3">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Income Adjustment</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 p-4 rounded-lg border shadow-sm space-y-3">
                    <div className="flex justify-end mb-2">
                      <Button variant="outline" size="sm" onClick={clearIncomeAdjustment} className="hover:scale-105 transition-transform">
                        Clear
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Description</Label>
                        <Input
                          placeholder="e.g., Uber driving 2 nights/week"
                          value={incomeAdjDesc}
                          onChange={(e) => setIncomeAdjDesc(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Monthly Amount</Label>
                        <Input
                          type="number"
                          placeholder="Additional income"
                          value={incomeAdjAmount}
                          onChange={(e) => setIncomeAdjAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Income Type</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={incomeAdjType}
                          onChange={(e) => setIncomeAdjType(e.target.value as 'gross' | 'net')}
                        >
                          <option value="net">Net (After Tax)</option>
                          <option value="gross">Gross (Before Tax)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Expense Adjustments */}
              <AccordionItem value="expense-adj" className="border rounded-lg px-4 mb-3">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <span>Expense Adjustments (up to 5)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {expenseAdjustments.length > 0 && (
                    <div className="flex justify-end mb-2">
                      <Button variant="outline" size="sm" onClick={clearExpenseAdjustments} className="hover:scale-105 transition-transform">
                        Clear All
                      </Button>
                    </div>
                  )}
                  {expenseAdjustments.map((adj, index) => (
                    <div key={adj.id} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 p-4 rounded-lg border shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Adjustment {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpenseAdjustments(expenseAdjustments.filter(a => a.id !== adj.id))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Select Expense</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={adj.expenseId}
                            onChange={(e) => {
                              const selectedExpense = expenses.find(exp => exp.id === e.target.value);
                              setExpenseAdjustments(expenseAdjustments.map(a =>
                                a.id === adj.id
                                  ? { ...a, expenseId: e.target.value, expenseName: selectedExpense?.name || '' }
                                  : a
                              ));
                            }}
                          >
                            <option value="">Select an expense</option>
                            {expenses.map(exp => (
                              <option key={exp.id} value={exp.id}>{exp.name} (${formatCurrency(exp.amount)})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>New Monthly Amount</Label>
                          <Input
                            type="number"
                            placeholder="Adjusted amount"
                            value={adj.newAmount}
                            onChange={(e) => setExpenseAdjustments(expenseAdjustments.map(a =>
                              a.id === adj.id ? { ...a, newAmount: e.target.value ? parseFloat(e.target.value) : '' } : a
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {expenseAdjustments.length < 5 && (
                    <Button
                      onClick={() => setExpenseAdjustments([
                        ...expenseAdjustments,
                        { id: Date.now().toString(), expenseId: '', expenseName: '', newAmount: '' }
                      ])}
                      className="w-full hover:scale-105 transition-transform"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense Adjustment
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Debt Consolidation */}
              <AccordionItem value="debt-consolidation" className="border rounded-lg px-4 mb-3">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-blue-600" />
                    <span>Debt Consolidation</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 p-4 rounded-lg border shadow-sm space-y-3">
                    <div className="flex justify-end mb-2">
                      <Button variant="outline" size="sm" onClick={clearDebtConsolidation} className="hover:scale-105 transition-transform">
                        Clear
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Debt to Consolidate</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={consolidateDebt1}
                          onChange={(e) => setConsolidateDebt1(e.target.value)}
                        >
                          <option value="">Select first debt</option>
                          {debts.map(debt => (
                            <option key={debt.id} value={debt.id}>
                              {debt.name} (${formatCurrency(debt.balance)} @ {debt.interestRate}%)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Second Debt to Consolidate</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={consolidateDebt2}
                          onChange={(e) => setConsolidateDebt2(e.target.value)}
                        >
                          <option value="">Select second debt</option>
                          {debts.filter(d => d.id !== consolidateDebt1).map(debt => (
                            <option key={debt.id} value={debt.id}>
                              {debt.name} (${formatCurrency(debt.balance)} @ {debt.interestRate}%)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 space-y-3">
                      <div className="font-medium">New Consolidated Debt</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Debt Name</Label>
                          <Input
                            placeholder="Consolidated Loan"
                            value={consolidatedName}
                            onChange={(e) => setConsolidatedName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Total Balance</Label>
                          <Input
                            type="number"
                            placeholder="Combined balance"
                            value={consolidatedBalance}
                            onChange={(e) => setConsolidatedBalance(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>New Interest Rate (%)</Label>
                          <Input
                            type="number"
                            placeholder="Lower rate"
                            value={consolidatedRate}
                            onChange={(e) => setConsolidatedRate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Monthly Payment</Label>
                          <Input
                            type="number"
                            placeholder="New payment"
                            value={consolidatedPayment}
                            onChange={(e) => setConsolidatedPayment(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Cashflow() {
  return (
    <ProtectedRoute>
      <CashflowContent />
    </ProtectedRoute>
  );
}
