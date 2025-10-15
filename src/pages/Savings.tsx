import { useState } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import marcoloLogo from '@/assets/marcolo-logo.png';

function SavingsContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const target = parseFloat(targetAmount) || 0;
  const current = parseFloat(currentAmount) || 0;
  const monthly = parseFloat(monthlyContribution) || 0;
  const remaining = target - current;
  const monthsToGoal = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const progress = target > 0 ? (current / target) * 100 : 0;

  const saveSavingsGoal = async () => {
    if (!user || !goalName || !targetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        goal_name: goalName,
        target_amount: target,
        current_amount: current,
        monthly_contribution: monthly,
        target_date: targetDate || null,
      });

      if (error) throw error;

      toast.success('Savings goal created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create savings goal');
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
            Savings Goals
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Savings Goal</CardTitle>
            <CardDescription>Set a target and track your progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Emergency Fund, Vacation, New Car"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyContribution">Monthly Contribution ($)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="targetDate">Target Date (Optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {target > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Goal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-xl font-bold">${remaining.toFixed(2)}</div>
                </div>
                {monthly > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground">Months to Goal</div>
                    <div className="text-xl font-bold">{monthsToGoal}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={saveSavingsGoal} className="w-full" size="lg">
          Create Savings Goal
        </Button>
      </main>
    </div>
  );
}

export default function Savings() {
  return (
    <ProtectedRoute>
      <SavingsContent />
    </ProtectedRoute>
  );
}
