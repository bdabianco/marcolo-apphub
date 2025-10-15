import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { useProject } from '@/contexts/ProjectContext';

interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  interestRate: number;
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
  
  // Mortgage states
  const [primaryMortgageBalance, setPrimaryMortgageBalance] = useState('');
  const [primaryMortgageInterest, setPrimaryMortgageInterest] = useState('');
  const [secondaryMortgageBalance, setSecondaryMortgageBalance] = useState('');
  const [secondaryMortgageInterest, setSecondaryMortgageInterest] = useState('');

  // Load existing cashflow data
  useEffect(() => {
    if (currentProject) {
      loadCashflowData();
    }
  }, [currentProject]);

  const loadCashflowData = async () => {
    if (!currentProject) return;

    try {
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
        setDebts(parsedDebts || []);
      }

      // Load mortgage data
      if (data && data.mortgage) {
        const mortgageData = typeof data.mortgage === 'string'
          ? JSON.parse(data.mortgage)
          : data.mortgage;
        setPrimaryMortgageBalance(mortgageData.primary?.balance?.toString() || '');
        setPrimaryMortgageInterest(mortgageData.primary?.interestRate?.toString() || '');
        setSecondaryMortgageBalance(mortgageData.secondary?.balance?.toString() || '');
        setSecondaryMortgageInterest(mortgageData.secondary?.interestRate?.toString() || '');
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
  const secondaryMortgageBalanceNum = parseFloat(secondaryMortgageBalance) || 0;
  const secondaryMortgageInterestNum = parseFloat(secondaryMortgageInterest) || 0;
  
  const primaryAnnualInterest = (primaryMortgageBalanceNum * primaryMortgageInterestNum) / 100;
  const secondaryAnnualInterest = (secondaryMortgageBalanceNum * secondaryMortgageInterestNum) / 100;
  const otherDebtsAnnualInterest = debts.reduce((sum, debt) => {
    return sum + ((debt.balance * debt.interestRate) / 100);
  }, 0);
  const totalAnnualInterest = primaryAnnualInterest + secondaryAnnualInterest + otherDebtsAnnualInterest;
  const totalMonthlyInterest = totalAnnualInterest / 12;

  const addDebt = () => {
    if (newDebtName && newDebtBalance && newDebtPayment) {
      setDebts([
        ...debts,
        {
          id: Date.now().toString(),
          name: newDebtName,
          balance: parseFloat(newDebtBalance) || 0,
          monthlyPayment: parseFloat(newDebtPayment) || 0,
          interestRate: parseFloat(newDebtInterest) || 0,
        },
      ]);
      setNewDebtName('');
      setNewDebtBalance('');
      setNewDebtPayment('');
      setNewDebtInterest('');
    }
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  const saveCashflow = async () => {
    if (!user || !currentProject) {
      toast.error('Please select a project first');
      return;
    }

    try {
      // Check if a cashflow record already exists for this project
      const { data: existingRecord } = await supabase
        .from('cashflow_records')
        .select('id')
        .eq('budget_plan_id', currentProject.id)
        .maybeSingle();

      const mortgageData = {
        primary: {
          balance: primaryMortgageBalanceNum,
          interestRate: primaryMortgageInterestNum,
        },
        secondary: {
          balance: secondaryMortgageBalanceNum,
          interestRate: secondaryMortgageInterestNum,
        },
      };

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('cashflow_records')
          .update({
            debts: JSON.stringify(debts),
            mortgage: JSON.stringify(mortgageData),
            total_debt: totalDebt,
            monthly_debt_payment: monthlyPayment,
            available_cashflow: 0,
          })
          .eq('budget_plan_id', currentProject.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('cashflow_records')
          .insert({
            user_id: user.id,
            budget_plan_id: currentProject.id,
            debts: JSON.stringify(debts),
            mortgage: JSON.stringify(mortgageData),
            total_debt: totalDebt,
            monthly_debt_payment: monthlyPayment,
            available_cashflow: 0,
          });

        if (error) throw error;
      }

      toast.success('Cashflow data saved successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save cashflow data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Debt Tracking</CardTitle>
                <CardDescription>Manage your debts and monthly payments</CardDescription>
              </div>
              <Button onClick={saveCashflow}>
                Save Cashflow Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="multiple" defaultValue={['mortgages', 'other-debts']} className="w-full">
              {/* Mortgage Section */}
              <AccordionItem value="mortgages">
                <AccordionTrigger className="text-lg font-semibold">Mortgages</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Primary Mortgage */}
                  <div className="bg-muted p-4 rounded space-y-2">
                    <div className="font-medium">Primary Mortgage</div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </div>

                  {/* Secondary Mortgage */}
                  <div className="bg-muted p-4 rounded space-y-2">
                    <div className="font-medium">Secondary Mortgage</div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Other Debts Section */}
              <AccordionItem value="other-debts">
                <AccordionTrigger className="text-lg font-semibold">Other Debts</AccordionTrigger>
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
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="ml-2 font-medium">${debt.balance.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Interest:</span>
                          <span className="ml-2 font-medium">{debt.interestRate.toFixed(2)}%</span>
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Interest Summary Card */}
        {(primaryMortgageBalanceNum > 0 || secondaryMortgageBalanceNum > 0 || debts.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Interest Summary</CardTitle>
              <CardDescription>Total interest calculations for all debts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded">
                  <div className="text-sm text-muted-foreground mb-1">Monthly Interest</div>
                  <div className="text-2xl font-bold">${totalMonthlyInterest.toFixed(2)}</div>
                </div>
                <div className="bg-muted p-4 rounded">
                  <div className="text-sm text-muted-foreground mb-1">Annual Interest</div>
                  <div className="text-2xl font-bold">${totalAnnualInterest.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
