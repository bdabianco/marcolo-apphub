import { useState } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import marcoloLogo from '@/assets/marcolo-logo.png';

interface Income {
  id: string;
  name: string;
  amount: number;
  type: 'gross' | 'net';
  schedule: 'monthly' | 'quarterly' | 'annual';
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  startDate?: Date;
  duration?: number; // number of months
}

function BudgetContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeType, setNewIncomeType] = useState<'gross' | 'net'>('net');
  const [newIncomeSchedule, setNewIncomeSchedule] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseStartDate, setNewExpenseStartDate] = useState<Date>();
  const [newExpenseDuration, setNewExpenseDuration] = useState('');

  // Convert all income to monthly amounts
  const convertToMonthly = (amount: number, schedule: 'monthly' | 'quarterly' | 'annual') => {
    switch (schedule) {
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'annual': return amount / 12;
    }
  };

  // Canadian tax calculations (simplified) - only for gross income
  const calculateTaxes = (annualIncome: number) => {
    const federalTax = annualIncome * 0.15;
    const provincialTax = annualIncome * 0.10;
    const cpp = Math.min(annualIncome * 0.0595, 3867.50);
    const ei = Math.min(annualIncome * 0.0163, 1049.12);
    return { federalTax, provincialTax, cpp, ei };
  };

  // Calculate total monthly income
  const monthlyGrossIncome = incomes
    .filter(inc => inc.type === 'gross')
    .reduce((sum, inc) => sum + convertToMonthly(inc.amount, inc.schedule), 0);
  
  const monthlyNetIncome = incomes
    .filter(inc => inc.type === 'net')
    .reduce((sum, inc) => sum + convertToMonthly(inc.amount, inc.schedule), 0);

  const annualGrossIncome = monthlyGrossIncome * 12;
  const taxes = calculateTaxes(annualGrossIncome);
  const annualNetFromGross = annualGrossIncome - taxes.federalTax - taxes.provincialTax - taxes.cpp - taxes.ei;
  const totalMonthlyNetIncome = (annualNetFromGross / 12) + monthlyNetIncome;
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
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
        },
      ]);
      setNewIncomeName('');
      setNewIncomeAmount('');
      setNewIncomeType('net');
      setNewIncomeSchedule('monthly');
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
        },
      ]);
      setNewExpenseName('');
      setNewExpenseAmount('');
      setNewExpenseStartDate(undefined);
      setNewExpenseDuration('');
    }
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const saveBudget = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('budget_plans').insert({
        user_id: user.id,
        project_name: 'Budget Plan',
        gross_income: annualGrossIncome,
        federal_tax: taxes.federalTax,
        provincial_tax: taxes.provincialTax,
        cpp: taxes.cpp,
        ei: taxes.ei,
        net_income: totalMonthlyNetIncome * 12,
        income_categories: JSON.stringify(incomes),
        expenses: JSON.stringify(expenses),
        total_expenses: totalExpenses * 12,
        surplus: surplus * 12,
      });

      if (error) throw error;

      toast.success('Budget plan saved successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save budget plan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={marcoloLogo} alt="Marcolo" className="h-8 w-8" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Budget Planning
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Income</CardTitle>
            <CardDescription>Add your income sources (gross or net)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button onClick={addIncome}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between bg-muted p-3 rounded">
                  <div className="flex flex-col">
                    <span>{income.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {income.type.toUpperCase()} • {income.schedule}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${income.amount.toFixed(2)}</span>
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
          </CardContent>
        </Card>

        {monthlyGrossIncome > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tax Deductions (Canadian - Gross Income Only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Federal Tax:</span>
                <span className="font-medium">${taxes.federalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provincial Tax:</span>
                <span className="font-medium">${taxes.provincialTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPP:</span>
                <span className="font-medium">${taxes.cpp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EI:</span>
                <span className="font-medium">${taxes.ei.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Monthly Net Income:</span>
              <span className="text-2xl font-bold text-primary">
                ${totalMonthlyNetIncome.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Add your monthly expenses with optional start date and duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button onClick={addExpense}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between bg-muted p-3 rounded">
                  <div className="flex flex-col">
                    <span>{expense.name}</span>
                    {(expense.startDate || expense.duration) && (
                      <span className="text-xs text-muted-foreground">
                        {expense.startDate && format(expense.startDate, "MM/dd/yyyy")}
                        {expense.duration && ` • ${expense.duration} months`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${expense.amount.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">Total Expenses:</span>
              <span className="font-bold">${totalExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Monthly Surplus:</span>
              <span className={`text-2xl font-bold ${surplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ${surplus.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={saveBudget} className="w-full" size="lg">
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
