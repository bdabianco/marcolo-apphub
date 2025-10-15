import { useState } from 'react';
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

interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
}

function CashflowContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtPayment, setNewDebtPayment] = useState('');

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyPayment = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);

  const addDebt = () => {
    if (newDebtName && newDebtBalance && newDebtPayment) {
      setDebts([
        ...debts,
        {
          id: Date.now().toString(),
          name: newDebtName,
          balance: parseFloat(newDebtBalance) || 0,
          monthlyPayment: parseFloat(newDebtPayment) || 0,
        },
      ]);
      setNewDebtName('');
      setNewDebtBalance('');
      setNewDebtPayment('');
    }
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  const saveCashflow = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('cashflow_records').insert({
        user_id: user.id,
        debts: JSON.stringify(debts),
        total_debt: totalDebt,
        monthly_debt_payment: monthlyPayment,
        available_cashflow: 0, // Will be calculated based on budget
      });

      if (error) throw error;

      toast.success('Cashflow data saved successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save cashflow data');
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
            Cashflow Analysis
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debt Tracking</CardTitle>
            <CardDescription>Manage your debts and monthly payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Monthly payment"
                  value={newDebtPayment}
                  onChange={(e) => setNewDebtPayment(e.target.value)}
                />
                <Button onClick={addDebt}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {debts.map((debt) => (
                <div key={debt.id} className="bg-muted p-4 rounded space-y-2">
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="ml-2 font-medium">${debt.balance.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="ml-2 font-medium">${debt.monthlyPayment.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {debts.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Debt:</span>
                  <span className="font-bold text-destructive">${totalDebt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Monthly Debt Payment:</span>
                  <span className="font-bold">${monthlyPayment.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={saveCashflow} className="w-full" size="lg">
          Save Cashflow Data
        </Button>
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
