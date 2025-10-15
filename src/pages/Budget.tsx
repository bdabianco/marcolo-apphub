import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import marcoloLogo from '@/assets/marcolo-logo.png';

interface Expense {
  id: string;
  name: string;
  amount: number;
}

function BudgetContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('My Budget');
  const [grossIncome, setGrossIncome] = useState('0');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Canadian tax calculations (simplified)
  const calculateTaxes = (income: number) => {
    const federalTax = income * 0.15; // Simplified 15% federal
    const provincialTax = income * 0.10; // Simplified 10% provincial
    const cpp = Math.min(income * 0.0595, 3867.50); // 2024 max
    const ei = Math.min(income * 0.0163, 1049.12); // 2024 max
    return { federalTax, provincialTax, cpp, ei };
  };

  const income = parseFloat(grossIncome) || 0;
  const taxes = calculateTaxes(income);
  const netIncome = income - taxes.federalTax - taxes.provincialTax - taxes.cpp - taxes.ei;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const surplus = netIncome - totalExpenses;

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          name: newExpenseName,
          amount: parseFloat(newExpenseAmount) || 0,
        },
      ]);
      setNewExpenseName('');
      setNewExpenseAmount('');
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
        project_name: projectName,
        gross_income: income,
        federal_tax: taxes.federalTax,
        provincial_tax: taxes.provincialTax,
        cpp: taxes.cpp,
        ei: taxes.ei,
        net_income: netIncome,
        expenses: JSON.stringify(expenses),
        total_expenses: totalExpenses,
        surplus: surplus,
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
            <CardTitle>Budget Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., 2024 Family Budget"
              />
            </div>
            <div>
              <Label htmlFor="grossIncome">Gross Annual Income ($)</Label>
              <Input
                id="grossIncome"
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tax Deductions (Canadian)</CardTitle>
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
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold">Net Income:</span>
              <span className="font-bold text-primary">${netIncome.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Add your monthly expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
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
                className="w-32"
              />
              <Button onClick={addExpense}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between bg-muted p-3 rounded">
                  <span>{expense.name}</span>
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
