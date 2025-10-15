import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { useProject } from '@/contexts/ProjectContext';
import { formatCurrency } from '@/lib/utils';
import { Pencil, ChevronDown, PiggyBank } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function SavingsContent() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [availableSurplus, setAvailableSurplus] = useState(0);
  const [existingGoals, setExistingGoals] = useState<any[]>([]);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(true);

  useEffect(() => {
    loadCashflowSurplus();
    loadExistingGoals();
  }, [currentProject]);

  const loadExistingGoals = async () => {
    if (!currentProject || !user) return;

    try {
      const { data } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_plan_id', currentProject.id)
        .order('created_at', { ascending: false });

      setExistingGoals(data || []);
    } catch (error) {
      console.error('Error loading savings goals:', error);
    }
  };

  const loadCashflowSurplus = async () => {
    if (!currentProject || !user) return;

    try {
      // Get budget data
      const { data: budgetData } = await supabase
        .from('budget_plans')
        .select('net_income, total_expenses')
        .eq('id', currentProject.id)
        .single();

      // Get cashflow data for debt payments
      const { data: cashflowData } = await supabase
        .from('cashflow_records')
        .select('monthly_debt_payment')
        .eq('budget_plan_id', currentProject.id)
        .maybeSingle();

      // Get existing savings goals to calculate committed contributions
      const { data: savingsData } = await supabase
        .from('savings_goals')
        .select('monthly_contribution')
        .eq('user_id', user.id)
        .eq('budget_plan_id', currentProject.id)
        .eq('is_active', true);

      const totalCommittedSavings = (savingsData || []).reduce(
        (sum, goal) => sum + Number(goal.monthly_contribution || 0),
        0
      );

      if (budgetData) {
        const monthlyNetIncome = Number(budgetData.net_income || 0) / 12;
        const monthlyExpenses = Number(budgetData.total_expenses || 0) / 12;
        const monthlyDebtPayment = Number(cashflowData?.monthly_debt_payment || 0);
        
        const surplus = monthlyNetIncome - monthlyExpenses - monthlyDebtPayment - totalCommittedSavings;
        setAvailableSurplus(Math.max(0, surplus));
      }
    } catch (error) {
      console.error('Error loading cashflow surplus:', error);
    }
  };

  const target = parseFloat(targetAmount) || 0;
  const current = parseFloat(currentAmount) || 0;
  const monthly = parseFloat(monthlyContribution) || 0;
  const remaining = target - current;
  const monthsToGoal = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const progress = target > 0 ? (current / target) * 100 : 0;

  const saveSavingsGoal = async () => {
    if (!user || !currentProject) {
      toast.error('Please select a project first');
      return;
    }

    if (!goalName || !targetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (availableSurplus <= 0) {
      toast.error('No surplus available. You need positive cashflow surplus to create savings goals.');
      return;
    }

    if (monthly > availableSurplus) {
      toast.error(`Monthly contribution cannot exceed available surplus of $${formatCurrency(availableSurplus)}`);
      return;
    }

    try {
      console.log('Attempting to save savings goal:', {
        user_id: user.id,
        budget_plan_id: currentProject.id,
        goal_name: goalName,
        target_amount: target,
        current_amount: current,
        monthly_contribution: monthly,
        target_date: targetDate || null,
      });

      const { data, error } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        budget_plan_id: currentProject.id,
        goal_name: goalName,
        target_amount: target,
        current_amount: current,
        monthly_contribution: monthly,
        target_date: targetDate || null,
      }).select();

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      console.log('Savings goal created successfully:', data);
      toast.success('Savings goal created successfully!');
      
      // Clear form
      setGoalName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setMonthlyContribution('');
      setTargetDate('');
      
      // Reload goals
      loadExistingGoals();
    } catch (error: any) {
      console.error('Failed to create savings goal:', error);
      toast.error(error.message || 'Failed to create savings goal');
    }
  };

  const updateSavingsGoal = async () => {
    if (!editingGoal || !user || !currentProject) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({
          goal_name: editingGoal.goal_name,
          target_amount: Number(editingGoal.target_amount),
          current_amount: Number(editingGoal.current_amount),
          monthly_contribution: Number(editingGoal.monthly_contribution),
          target_date: editingGoal.target_date || null,
        })
        .eq('id', editingGoal.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Savings goal updated successfully!');
      setIsEditDialogOpen(false);
      setEditingGoal(null);
      loadExistingGoals();
      loadCashflowSurplus();
    } catch (error: any) {
      console.error('Failed to update savings goal:', error);
      toast.error(error.message || 'Failed to update savings goal');
    }
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal({
      ...goal,
      target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold text-foreground">Savings Goals</h2>
              <p className="text-muted-foreground mt-1">Set and track your savings targets</p>
            </div>
          </div>
        </div>

        {/* Available Surplus Card */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
            <CardTitle>Available Surplus</CardTitle>
            <CardDescription>
              {availableSurplus > 0 
                ? 'Monthly surplus available for savings after income, expenses, and debt payments'
                : 'No surplus available. Create a budget and manage cashflow to generate surplus for savings.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">
              ${formatCurrency(availableSurplus)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">per month</p>
          </CardContent>
        </Card>

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
                <Label htmlFor="monthlyContribution">
                  Monthly Contribution ($)
                  {availableSurplus > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Max: ${formatCurrency(availableSurplus)})
                    </span>
                  )}
                </Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="0.00"
                  max={availableSurplus}
                  disabled={availableSurplus <= 0}
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
                  <div className="text-xl font-bold">${formatCurrency(remaining)}</div>
                </div>
                {monthly > 0 && monthsToGoal > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground">Months to Goal</div>
                    <div className="text-xl font-bold">{monthsToGoal}</div>
                  </div>
                )}
              </div>

              {targetDate && monthly > 0 && (
                <div className="pt-3 border-t space-y-2">
                  {(() => {
                    const today = new Date();
                    const targetDateObj = new Date(targetDate);
                    const monthsUntilTarget = Math.max(0, Math.round((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                    const projectedAmount = current + (monthly * monthsUntilTarget);
                    const variance = projectedAmount - target;

                    return (
                      <>
                        <div className="text-sm font-medium">Projection by Target Date</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Months Until Target</div>
                            <div className="text-lg font-semibold">{monthsUntilTarget}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Projected Amount</div>
                            <div className="text-lg font-semibold">${formatCurrency(projectedAmount)}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-muted-foreground">Variance at Target Date</div>
                            <div className={`text-xl font-bold ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {variance >= 0 ? '+' : ''}${formatCurrency(variance)}
                            </div>
                            <p className={`text-xs mt-1 ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {variance >= 0 ? 'On track to exceed goal by target date' : 'Will be short of goal by target date'}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button 
          onClick={saveSavingsGoal} 
          className="w-full mb-6" 
          size="lg"
          disabled={availableSurplus <= 0}
        >
          Create Savings Goal
        </Button>

        {/* Existing Savings Goals */}
        {existingGoals.length > 0 && (
          <Collapsible open={isGoalsOpen} onOpenChange={setIsGoalsOpen}>
            <Card className="border-2 shadow-lg">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="bg-gradient-to-r from-accent/5 via-accent/3 to-transparent cursor-pointer hover:bg-accent/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <CardTitle>Your Savings Goals</CardTitle>
                      <CardDescription>Track and manage your savings progress</CardDescription>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isGoalsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-6">
              {existingGoals.map((goal) => {
                const progress = goal.target_amount > 0 ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 : 0;
                const remaining = Number(goal.target_amount) - Number(goal.current_amount);
                const monthsToReach = Number(goal.monthly_contribution) > 0 
                  ? Math.ceil(remaining / Number(goal.monthly_contribution)) 
                  : 0;

                // Calculate variance based on target date
                let monthsUntilTarget = 0;
                let projectedAmount = Number(goal.current_amount);
                let variance = 0;
                
                if (goal.target_date && Number(goal.monthly_contribution) > 0) {
                  const today = new Date();
                  const targetDateObj = new Date(goal.target_date);
                  monthsUntilTarget = Math.max(0, Math.round((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                  projectedAmount = Number(goal.current_amount) + (Number(goal.monthly_contribution) * monthsUntilTarget);
                  variance = projectedAmount - Number(goal.target_amount);
                }

                return (
                  <div key={goal.id} className="bg-gradient-to-r from-muted/50 to-background p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{goal.goal_name}</h3>
                        {goal.target_date && (
                          <p className="text-sm text-muted-foreground">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGoal(goal)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Progress</div>
                          <div className="text-lg font-bold text-primary">{progress.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-semibold">${formatCurrency(Number(goal.current_amount))}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-semibold">${formatCurrency(Number(goal.target_amount))}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly</div>
                        <div className="font-semibold">${formatCurrency(Number(goal.monthly_contribution))}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Months to Reach</div>
                        <div className="font-semibold">{monthsToReach > 0 ? monthsToReach : 'N/A'}</div>
                      </div>
                    </div>

                    {goal.target_date && Number(goal.monthly_contribution) > 0 && (
                      <div className="pt-3 border-t grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Months Until Target</div>
                          <div className="font-semibold">{monthsUntilTarget}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Projected Amount</div>
                          <div className="font-semibold">${formatCurrency(projectedAmount)}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Variance at Target Date</div>
                          <div className={`text-lg font-bold ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {variance >= 0 ? '+' : ''}${formatCurrency(variance)}
                          </div>
                          <p className={`text-xs mt-1 ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {variance >= 0 ? 'On track to exceed goal' : 'Will be short of goal'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Edit Goal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Savings Goal</DialogTitle>
            </DialogHeader>
            {editingGoal && (
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="edit-goalName">Goal Name</Label>
                  <Input
                    id="edit-goalName"
                    value={editingGoal.goal_name}
                    onChange={(e) => setEditingGoal({ ...editingGoal, goal_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-targetAmount">Target Amount ($)</Label>
                    <Input
                      id="edit-targetAmount"
                      type="number"
                      value={editingGoal.target_amount}
                      onChange={(e) => setEditingGoal({ ...editingGoal, target_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-currentAmount">Current Amount ($)</Label>
                    <Input
                      id="edit-currentAmount"
                      type="number"
                      value={editingGoal.current_amount}
                      onChange={(e) => setEditingGoal({ ...editingGoal, current_amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-monthlyContribution">Monthly Contribution ($)</Label>
                    <Input
                      id="edit-monthlyContribution"
                      type="number"
                      value={editingGoal.monthly_contribution}
                      onChange={(e) => setEditingGoal({ ...editingGoal, monthly_contribution: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-targetDate">Target Date</Label>
                    <Input
                      id="edit-targetDate"
                      type="date"
                      value={editingGoal.target_date}
                      onChange={(e) => setEditingGoal({ ...editingGoal, target_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={updateSavingsGoal} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
