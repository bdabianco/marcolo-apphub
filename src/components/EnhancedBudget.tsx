import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface IncomeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'custom';
  periods?: number;
  isGrossIncome: boolean;
}

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'custom';
  periods?: number;
}

interface Deduction {
  id: string;
  name: string;
  amount: number;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate?: string;
  type: 'monthly' | 'annual';
}

const categorySchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  amount: z.number().min(0).max(999999999),
  frequency: z.enum(['monthly', 'quarterly', 'annual', 'custom']),
});

export function EnhancedBudget({ onSave, onBack }: { onSave?: () => void; onBack?: () => void }) {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('My Budget');
  
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'monthly' as const, isGross: false });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'monthly' as const });
  const [newDeduction, setNewDeduction] = useState({ name: '', amount: '' });
  const [newSubscription, setNewSubscription] = useState({ name: '', amount: '', type: 'monthly' as const });

  const addIncome = () => {
    if (!newIncome.name || !newIncome.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      categorySchema.parse({
        name: newIncome.name,
        amount: parseFloat(newIncome.amount),
        frequency: newIncome.frequency,
      });

      setIncomeCategories([
        ...incomeCategories,
        {
          id: Date.now().toString(),
          name: newIncome.name,
          amount: parseFloat(newIncome.amount),
          frequency: newIncome.frequency,
          isGrossIncome: newIncome.isGross,
        },
      ]);
      setNewIncome({ name: '', amount: '', frequency: 'monthly', isGross: false });
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || 'Invalid input');
    }
  };

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      categorySchema.parse({
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        frequency: newExpense.frequency,
      });

      setExpenseCategories([
        ...expenseCategories,
        {
          id: Date.now().toString(),
          name: newExpense.name,
          amount: parseFloat(newExpense.amount),
          frequency: newExpense.frequency,
        },
      ]);
      setNewExpense({ name: '', amount: '', frequency: 'monthly' });
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || 'Invalid input');
    }
  };

  const addDeduction = () => {
    if (!newDeduction.name || !newDeduction.amount) return;
    
    setDeductions([
      ...deductions,
      {
        id: Date.now().toString(),
        name: newDeduction.name,
        amount: parseFloat(newDeduction.amount),
      },
    ]);
    setNewDeduction({ name: '', amount: '' });
  };

  const addSubscription = () => {
    if (!newSubscription.name || !newSubscription.amount) return;
    
    setSubscriptions([
      ...subscriptions,
      {
        id: Date.now().toString(),
        name: newSubscription.name,
        amount: parseFloat(newSubscription.amount),
        type: newSubscription.type,
      },
    ]);
    setNewSubscription({ name: '', amount: '', type: 'monthly' });
  };

  const calculateTotals = () => {
    const grossIncome = incomeCategories
      .filter(cat => cat.isGrossIncome)
      .reduce((sum, cat) => sum + cat.amount * 12, 0);
    
    const netIncomeFromCategories = incomeCategories
      .filter(cat => !cat.isGrossIncome)
      .reduce((sum, cat) => sum + cat.amount * 12, 0);
    
    const totalDeductions = deductions.reduce((sum, ded) => sum + ded.amount, 0);
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount * 12, 0);
    
    const netIncome = grossIncome + netIncomeFromCategories - totalDeductions;
    const surplus = netIncome - totalExpenses;

    return { grossIncome, netIncome, totalExpenses, surplus, totalDeductions };
  };

  const saveBudget = async () => {
    if (!user) return;

    const totals = calculateTotals();

    try {
      const { error } = await supabase.from('budget_plans').insert({
        user_id: user.id,
        project_name: projectName,
        gross_income: totals.grossIncome,
        net_income: totals.netIncome,
        total_expenses: totals.totalExpenses,
        surplus: totals.surplus,
        income_categories: JSON.stringify(incomeCategories),
        expense_categories: JSON.stringify(expenseCategories),
        deductions: JSON.stringify(deductions),
        subscriptions: JSON.stringify(subscriptions),
      });

      if (error) throw error;

      toast.success('Budget saved successfully!');
      if (onSave) onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save budget');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., 2024 Family Budget"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Category name"
              value={newIncome.name}
              onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newIncome.amount}
              onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
            />
            <Select
              value={newIncome.frequency}
              onValueChange={(val: any) => setNewIncome({ ...newIncome, frequency: val })}
            >
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

          {incomeCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-muted p-3 rounded">
              <div>
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ${cat.amount}/{cat.frequency}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIncomeCategories(incomeCategories.filter((c) => c.id !== cat.id))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Category name"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />
            <Select
              value={newExpense.frequency}
              onValueChange={(val: any) => setNewExpense({ ...newExpense, frequency: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addExpense}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {expenseCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-muted p-3 rounded">
              <div>
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ${cat.amount}/{cat.frequency}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpenseCategories(expenseCategories.filter((c) => c.id !== cat.id))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Gross Annual Income:</span>
            <span className="font-bold">${totals.grossIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Deductions:</span>
            <span className="font-bold">${totals.totalDeductions.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Net Annual Income:</span>
            <span className="font-bold text-primary">${totals.netIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Annual Expenses:</span>
            <span className="font-bold">${totals.totalExpenses.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-lg font-semibold">Annual Surplus:</span>
            <span className={`text-lg font-bold ${totals.surplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${totals.surplus.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={saveBudget} className="flex-1">
          Save Budget
        </Button>
      </div>
    </div>
  );
}
