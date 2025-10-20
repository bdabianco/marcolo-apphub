import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, CalendarIcon, DollarSign, TrendingDown, CreditCard, Wallet, Calculator, PiggyBank, ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { AppHeader } from '@/components/AppHeader';
import { useProject } from '@/contexts/ProjectContext';

interface Income {
  id: string;
  name: string;
  amount: number;
  type: 'gross' | 'net';
  schedule: 'monthly' | 'quarterly' | 'annual';
  grossMargin?: number; // for business revenue streams
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  startDate?: Date;
  duration?: number; // number of months
  expenseType?: 'standard' | 'employee'; // for business expenses
}

function BudgetContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsDialogOpen, setSubscriptionsDialogOpen] = useState(false);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeType, setNewIncomeType] = useState<'gross' | 'net'>('net');
  const [newIncomeSchedule, setNewIncomeSchedule] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [newGrossMargin, setNewGrossMargin] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseStartDate, setNewExpenseStartDate] = useState<Date>();
  const [newExpenseDuration, setNewExpenseDuration] = useState('');
  const [newExpenseType, setNewExpenseType] = useState<'standard' | 'employee'>('standard');
  const [newSubscriptionName, setNewSubscriptionName] = useState('');
  const [newSubscriptionAmount, setNewSubscriptionAmount] = useState('');
  const [newSubscriptionBillingCycle, setNewSubscriptionBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const isBusinessProject = currentProject?.project_type === 'business';

  // Load existing budget data
  useEffect(() => {
    if (currentProject) {
      loadBudgetData();
    }
  }, [currentProject]);

  const loadBudgetData = async () => {
    if (!currentProject) return;

    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('id', currentProject.id)
        .single();

      if (error) throw error;

      if (data) {
        // Load income categories
        if (data.income_categories) {
          const parsedIncomes = typeof data.income_categories === 'string' 
            ? JSON.parse(data.income_categories) 
            : data.income_categories;
          setIncomes(parsedIncomes || []);
        }

        // Load expenses
        if (data.expenses) {
          const parsedExpenses = typeof data.expenses === 'string'
            ? JSON.parse(data.expenses)
            : data.expenses;
          setExpenses(parsedExpenses || []);
        }

        // Load subscriptions
        if (data.subscriptions) {
          const parsedSubscriptions = typeof data.subscriptions === 'string'
            ? JSON.parse(data.subscriptions)
            : data.subscriptions;
          setSubscriptions(parsedSubscriptions || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading budget data:', error);
    }
  };

  // Convert all income to monthly amounts
  const convertToMonthly = (amount: number, schedule: 'monthly' | 'quarterly' | 'annual') => {
    switch (schedule) {
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'annual': return amount / 12;
    }
  };

  // Tax calculations
  const calculateTaxes = (annualIncome: number) => {
    if (isBusinessProject) {
      // Ontario + Federal corporate tax (simplified)
      const federalCorporateTax = annualIncome * 0.15; // 15% federal
      const ontarioCorporateTax = annualIncome * 0.115; // 11.5% Ontario
      return { 
        federalTax: federalCorporateTax, 
        provincialTax: ontarioCorporateTax, 
        cpp: 0, 
        ei: 0 
      };
    } else {
      // Personal tax (simplified Canadian)
      const federalTax = annualIncome * 0.15;
      const provincialTax = annualIncome * 0.10;
      const cpp = Math.min(annualIncome * 0.0595, 3867.50);
      const ei = Math.min(annualIncome * 0.0163, 1049.12);
      return { federalTax, provincialTax, cpp, ei };
    }
  };

  // Calculate employer payroll remittances for employee expenses
  const calculateEmployerRemittances = (employeeSalary: number) => {
    const cppEmployer = Math.min(employeeSalary * 0.0595, 3867.50);
    const eiEmployer = Math.min(employeeSalary * 0.0163 * 1.4, 1468.77); // Employer pays 1.4x employee rate
    return cppEmployer + eiEmployer;
  };

  // Calculate revenue/income
  let monthlyGrossIncome = 0;
  let monthlyGrossProfit = 0;
  let totalRevenue = 0;
  let totalGrossMargin = 0;
  
  if (isBusinessProject) {
    // Business: Calculate revenue and gross profit
    incomes.forEach(inc => {
      const monthlyRev = convertToMonthly(inc.amount, inc.schedule);
      totalRevenue += monthlyRev;
      const margin = inc.grossMargin || 0;
      const grossProfit = monthlyRev * (margin / 100);
      monthlyGrossProfit += grossProfit;
      totalGrossMargin += (monthlyRev * margin);
    });
    monthlyGrossIncome = totalRevenue;
  } else {
    // Personal: Calculate income as before
    monthlyGrossIncome = incomes
      .filter(inc => inc.type === 'gross')
      .reduce((sum, inc) => sum + convertToMonthly(inc.amount, inc.schedule), 0);
  }
  
  const monthlyNetIncome = incomes
    .filter(inc => inc.type === 'net')
    .reduce((sum, inc) => sum + convertToMonthly(inc.amount, inc.schedule), 0);

  const annualGrossIncome = isBusinessProject ? totalRevenue * 12 : monthlyGrossIncome * 12;
  const taxes = calculateTaxes(annualGrossIncome);
  const annualNetFromGross = annualGrossIncome - taxes.federalTax - taxes.provincialTax - taxes.cpp - taxes.ei;
  const totalMonthlyNetIncome = isBusinessProject 
    ? monthlyGrossProfit 
    : (annualNetFromGross / 12) + monthlyNetIncome;
  
  // Calculate total subscriptions as annual amount
  const totalAnnualSubscriptions = subscriptions.reduce((sum, sub) => {
    const annualAmount = sub.billingCycle === 'monthly' ? sub.amount * 12 :
                        sub.billingCycle === 'quarterly' ? sub.amount * 4 :
                        sub.amount;
    return sum + annualAmount;
  }, 0);
  
  // Calculate expenses with employer remittances for business
  let totalExpenses = (totalAnnualSubscriptions / 12);
  expenses.forEach(exp => {
    totalExpenses += exp.amount;
    if (isBusinessProject && exp.expenseType === 'employee') {
      const monthlyRemittances = calculateEmployerRemittances(exp.amount * 12) / 12;
      totalExpenses += monthlyRemittances;
    }
  });
  const surplus = totalMonthlyNetIncome - totalExpenses;

  const addIncome = () => {
    if (newIncomeName && newIncomeAmount) {
      setIncomes([
        ...incomes,
        {
          id: Date.now().toString(),
          name: newIncomeName,
          amount: parseFloat(newIncomeAmount) || 0,
          type: newIncomeType,
          schedule: newIncomeSchedule,
          grossMargin: newGrossMargin ? parseFloat(newGrossMargin) : undefined,
        },
      ]);
      setNewIncomeName('');
      setNewIncomeAmount('');
      setNewIncomeType('net');
      setNewIncomeSchedule('monthly');
      setNewGrossMargin('');
    }
  };

  const removeIncome = (id: string) => {
    setIncomes(incomes.filter((inc) => inc.id !== id));
  };

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          name: newExpenseName,
          amount: parseFloat(newExpenseAmount) || 0,
          startDate: newExpenseStartDate,
          duration: newExpenseDuration ? parseFloat(newExpenseDuration) : undefined,
          expenseType: isBusinessProject ? newExpenseType : undefined,
        },
      ]);
      setNewExpenseName('');
      setNewExpenseAmount('');
      setNewExpenseStartDate(undefined);
      setNewExpenseDuration('');
      setNewExpenseType('standard');
    }
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const addSubscription = () => {
    if (newSubscriptionName && newSubscriptionAmount) {
      setSubscriptions([
        ...subscriptions,
        {
          id: Date.now().toString(),
          name: newSubscriptionName,
          amount: parseFloat(newSubscriptionAmount) || 0,
          billingCycle: newSubscriptionBillingCycle,
        },
      ]);
      setNewSubscriptionName('');
      setNewSubscriptionAmount('');
      setNewSubscriptionBillingCycle('monthly');
    }
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
  };

  const saveBudget = async () => {
    if (!user || !currentProject) {
      toast.error('Please select a project first');
      return;
    }

    try {
      // Update existing budget plan
      const { error } = await supabase
        .from('budget_plans')
        .update({
          gross_income: annualGrossIncome,
          federal_tax: taxes.federalTax,
          provincial_tax: taxes.provincialTax,
          cpp: taxes.cpp,
          ei: taxes.ei,
          net_income: totalMonthlyNetIncome * 12,
          income_categories: JSON.stringify(incomes),
          expenses: JSON.stringify(expenses),
          subscriptions: JSON.stringify(subscriptions),
          total_expenses: totalExpenses * 12,
          surplus: surplus * 12,
        })
        .eq('id', currentProject.id);

      if (error) throw error;

      toast.success('Budget updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save budget plan');
    }
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-sky)] relative overflow-hidden">
      {/* Organic Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <Card className="mb-6 border-2 border-primary/20 rounded-[2rem] [box-shadow:var(--shadow-leaf)] hover:[box-shadow:var(--shadow-canopy)] transition-all duration-500">
          <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-t-[2rem]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <DollarSign className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle>{isBusinessProject ? 'Revenue' : 'Income'}</CardTitle>
                <CardDescription>
                  {isBusinessProject 
                    ? 'Add your revenue streams with gross margins' 
                    : 'Add your income sources (gross or net)'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-[10px]">
            <Accordion type="multiple" defaultValue={['income']} className="w-full">
              <AccordionItem value="income" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex justify-between w-full pr-4">
                    <span>Income Details</span>
                    <span className="font-bold text-primary">${formatCurrency(totalMonthlyNetIncome)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {isBusinessProject ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <Input
                        placeholder="Revenue stream"
                        value={newIncomeName}
                        onChange={(e) => setNewIncomeName(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newIncomeAmount}
                        onChange={(e) => setNewIncomeAmount(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Gross Margin %"
                        value={newGrossMargin}
                        onChange={(e) => setNewGrossMargin(e.target.value)}
                        min="0"
                        max="100"
                      />
                      <Select value={newIncomeSchedule} onValueChange={(val: 'monthly' | 'quarterly' | 'annual') => setNewIncomeSchedule(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addIncome} className="hover:scale-105 transition-transform">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <Input
                        placeholder="Income source"
                        value={newIncomeName}
                        onChange={(e) => setNewIncomeName(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newIncomeAmount}
                        onChange={(e) => setNewIncomeAmount(e.target.value)}
                      />
                      <Select value={newIncomeType} onValueChange={(val: 'gross' | 'net') => setNewIncomeType(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net">Net</SelectItem>
                          <SelectItem value="gross">Gross</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={newIncomeSchedule} onValueChange={(val: 'monthly' | 'quarterly' | 'annual') => setNewIncomeSchedule(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addIncome} className="hover:scale-105 transition-transform">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {incomes.map((income) => (
                      <div key={income.id} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col">
                          <span>{income.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {isBusinessProject 
                              ? `Margin: ${income.grossMargin || 0}% • ${income.schedule}` 
                              : `${income.type.toUpperCase()} • ${income.schedule}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${formatCurrency(income.amount)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIncome(income.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isBusinessProject && incomes.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Revenue Summary</h4>
                      <div className="bg-muted p-3 rounded space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium">${formatCurrency(totalRevenue)}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Gross Margin:</span>
                          <span className="font-medium">{totalRevenue > 0 ? ((totalGrossMargin / totalRevenue) / totalRevenue * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Gross Profit:</span>
                          <span className="text-primary">${formatCurrency(monthlyGrossProfit)}/mo</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isBusinessProject && monthlyGrossIncome > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Tax Deductions (Canadian - Gross Income Only)</h4>
                      <div className="bg-muted p-3 rounded space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Federal Tax:</span>
                          <span className="font-medium">${formatCurrency(taxes.federalTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Provincial Tax:</span>
                          <span className="font-medium">${formatCurrency(taxes.provincialTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CPP:</span>
                          <span className="font-medium">${formatCurrency(taxes.cpp)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">EI:</span>
                          <span className="font-medium">${formatCurrency(taxes.ei)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">{isBusinessProject ? 'Gross Profit:' : 'Total Monthly Net Income:'}</span>
                    <span className="font-bold text-primary">${formatCurrency(totalMonthlyNetIncome)}</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-secondary/20 rounded-[2rem] [box-shadow:var(--shadow-leaf)] hover:[box-shadow:var(--shadow-canopy)] transition-all duration-500">
          <CardHeader className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent rounded-t-[2rem]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <TrendingDown className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Add your monthly expenses with optional start date and duration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-[10px]">
            <Accordion type="multiple" defaultValue={['expenses']} className="w-full">
              <AccordionItem value="expenses" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex items-center gap-2">
                      <span>Expense Details</span>
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex" onClick={(e) => e.stopPropagation()}>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs z-50 bg-popover border">
                            <p className="text-sm">Monthly mortgage/debt payments should be configured in the Cashflow section, not as monthly expenses here.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold">${formatCurrency(totalExpenses)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {isBusinessProject ? (
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                      <Input
                        placeholder="Expense name"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                      />
                      <Select value={newExpenseType} onValueChange={(val: 'standard' | 'employee') => setNewExpenseType(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newExpenseStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newExpenseStartDate ? format(newExpenseStartDate, "MM/dd/yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newExpenseStartDate}
                            onSelect={setNewExpenseStartDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="number"
                        placeholder="Duration"
                        value={newExpenseDuration}
                        onChange={(e) => setNewExpenseDuration(e.target.value)}
                        min="1"
                        max="12"
                      />
                      <Button onClick={addExpense} className="hover:scale-105 transition-transform">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <Input
                        placeholder="Expense name"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newExpenseStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newExpenseStartDate ? format(newExpenseStartDate, "MM/dd/yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newExpenseStartDate}
                            onSelect={setNewExpenseStartDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="number"
                        placeholder="Duration (months)"
                        value={newExpenseDuration}
                        onChange={(e) => setNewExpenseDuration(e.target.value)}
                        min="1"
                        max="12"
                      />
                      <Button onClick={addExpense} className="hover:scale-105 transition-transform">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Subscriptions Special Entry */}
                  <Dialog open={subscriptionsDialogOpen} onOpenChange={setSubscriptionsDialogOpen}>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between bg-primary/10 p-3 rounded cursor-pointer hover:bg-primary/20 transition-colors border-2 border-primary/30">
                        <div className="flex flex-col">
                          <span className="font-semibold">Subscriptions</span>
                          <span className="text-xs text-muted-foreground">
                            {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} • Click to manage
                          </span>
                        </div>
                        <span className="font-medium">${formatCurrency(totalAnnualSubscriptions / 12)}/mo</span>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Manage Subscriptions</DialogTitle>
                        <DialogDescription>
                          Add and manage your recurring subscriptions. Total is calculated annually.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Input
                            placeholder="Subscription name"
                            value={newSubscriptionName}
                            onChange={(e) => setNewSubscriptionName(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={newSubscriptionAmount}
                            onChange={(e) => setNewSubscriptionAmount(e.target.value)}
                          />
                          <Select value={newSubscriptionBillingCycle} onValueChange={(val: 'monthly' | 'quarterly' | 'annual') => setNewSubscriptionBillingCycle(val)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={addSubscription} className="hover:scale-105 transition-transform">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
                              <div className="flex flex-col">
                                <span>{sub.name}</span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {sub.billingCycle}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">${formatCurrency(sub.amount)}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSubscription(sub.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between border-t pt-3">
                          <span className="font-semibold">Total Annual Cost:</span>
                          <span className="font-bold text-primary">${formatCurrency(totalAnnualSubscriptions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Equivalent:</span>
                          <span className="text-sm font-medium">${formatCurrency(totalAnnualSubscriptions / 12)}</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    {expenses.map((expense) => {
                      const employerRemittances = (isBusinessProject && expense.expenseType === 'employee') 
                        ? calculateEmployerRemittances(expense.amount * 12) / 12 
                        : 0;
                      return (
                        <div key={expense.id} className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex flex-col">
                            <span>{expense.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {isBusinessProject && expense.expenseType === 'employee' && 'Employee • '}
                              {isBusinessProject && expense.expenseType === 'standard' && 'Standard • '}
                              {expense.startDate && format(expense.startDate, "MM/dd/yyyy")}
                              {expense.duration && ` • ${expense.duration} months`}
                              {employerRemittances > 0 && ` • +$${formatCurrency(employerRemittances)} payroll`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${formatCurrency(expense.amount + employerRemittances)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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

        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Monthly financial overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-[10px]">
            {isBusinessProject ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border">
                    <span className="font-medium">Gross Profit:</span>
                    <span className="font-bold text-lg">${formatCurrency(totalMonthlyNetIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border">
                    <span className="font-medium">Total Expenses:</span>
                    <span className="font-bold text-lg">${formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="font-medium">Operating Income:</span>
                    <span className="font-bold text-lg">${formatCurrency(totalMonthlyNetIncome - totalExpenses)}</span>
                  </div>
                  
                  {annualGrossIncome > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <h4 className="font-semibold text-sm">Corporate Taxes (Ontario + Federal)</h4>
                      <div className="bg-muted p-3 rounded space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Federal Corporate Tax (15%):</span>
                          <span className="font-medium">${formatCurrency(taxes.federalTax / 12)}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ontario Corporate Tax (11.5%):</span>
                          <span className="font-medium">${formatCurrency(taxes.provincialTax / 12)}/mo</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "flex justify-between items-center p-4 rounded-lg border-2 shadow-md",
                    surplus >= 0 
                      ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800" 
                      : "bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-900/20 border-red-200 dark:border-red-800"
                  )}>
                    <span className="font-bold">Net Income (After Tax):</span>
                    <span className={cn("text-2xl font-bold", surplus >= 0 ? "text-blue-600" : "text-red-600")}>
                      ${formatCurrency(surplus)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <div className="text-sm text-muted-foreground">Total Income</div>
                  </div>
                  <div className="text-2xl font-bold">${formatCurrency(totalMonthlyNetIncome)}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/30 dark:to-red-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                  <div className="text-2xl font-bold">${formatCurrency(totalExpenses)}</div>
                </div>
                <div className={cn(
                  "p-4 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-300",
                  surplus >= 0 
                    ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800" 
                    : "bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-900/20 border-red-200 dark:border-red-800"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className={cn("h-4 w-4", surplus >= 0 ? "text-blue-600" : "text-red-600")} />
                    <div className="text-sm text-muted-foreground">Surplus/Deficit</div>
                  </div>
                  <div className={cn("text-2xl font-bold", surplus >= 0 ? "text-blue-600" : "text-red-600")}>
                    ${formatCurrency(surplus)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={saveBudget} className="w-full shadow-md hover:shadow-lg transition-all duration-300" size="lg">
          <DollarSign className="h-4 w-4 mr-2" />
          Save Budget Plan
        </Button>
      </main>
    </div>
  );
}

export default function Budget() {
  return (
    <ProtectedRoute>
      <BudgetContent />
    </ProtectedRoute>
  );
}
