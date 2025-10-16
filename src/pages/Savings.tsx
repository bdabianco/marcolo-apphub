import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { useProject } from '@/contexts/ProjectContext';
import { formatCurrency } from '@/lib/utils';
import { Pencil, ChevronDown, PiggyBank, TrendingUp, Home, Briefcase, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ONTARIO_CITIES, ONTARIO_CITY_RATES, MARKET_INVESTMENT_RATE, calculateFutureValue } from '@/lib/investmentCalculations';

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
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  
  // Assets state
  const [assets, setAssets] = useState<any[]>([]);
  const [isAssetsOpen, setIsAssetsOpen] = useState(true);
  const [futureYears, setFutureYears] = useState<number>(5);
  
  // Property form
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [propertyCity, setPropertyCity] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  
  // Investment form
  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);
  const [investmentType, setInvestmentType] = useState('');
  const [investmentValue, setInvestmentValue] = useState('');
  
  // Other asset form
  const [isAddOtherOpen, setIsAddOtherOpen] = useState(false);
  const [otherAssetName, setOtherAssetName] = useState('');
  const [otherAssetValue, setOtherAssetValue] = useState('');
  const [otherAssetRate, setOtherAssetRate] = useState('');

  useEffect(() => {
    loadCashflowSurplus();
    loadExistingGoals();
    loadAssets();
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

  const loadAssets = async () => {
    if (!user || !currentProject) return;

    try {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_plan_id', currentProject.id)
        .order('created_at', { ascending: false });

      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const saveProperty = async () => {
    if (!user || !propertyCity || !propertyValue) {
      toast.error('Please fill in all fields');
      return;
    }

    const propertiesCount = assets.filter(a => a.asset_type === 'property').length;
    if (propertiesCount >= 2) {
      toast.error('Maximum 2 properties allowed');
      return;
    }

    try {
      console.log('Saving property:', { user_id: user.id, propertyCity, propertyValue, rate: ONTARIO_CITY_RATES[propertyCity] });
      
      const { data, error } = await supabase.from('assets').insert({
        user_id: user.id,
        budget_plan_id: currentProject.id,
        asset_type: 'property',
        name: propertyCity,
        current_value: Number(propertyValue),
        appreciation_rate: ONTARIO_CITY_RATES[propertyCity],
      }).select();

      if (error) {
        console.error('Property save error:', error);
        throw error;
      }

      console.log('Property saved successfully:', data);
      toast.success('Property added successfully!');
      setPropertyCity('');
      setPropertyValue('');
      setIsAddPropertyOpen(false);
      loadAssets();
    } catch (error: any) {
      console.error('Failed to add property:', error);
      toast.error(error.message || 'Failed to add property');
    }
  };

  const saveInvestment = async () => {
    if (!user || !investmentType || !investmentValue) {
      toast.error('Please fill in all fields');
      return;
    }

    const investmentsCount = assets.filter(a => 
      ['tfsa', 'rrsp', 'group_retirement'].includes(a.asset_type)
    ).length;
    
    if (investmentsCount >= 3) {
      toast.error('Maximum 3 standard investments allowed');
      return;
    }

    const typeExists = assets.some(a => a.asset_type === investmentType);
    if (typeExists) {
      toast.error('This investment type already exists');
      return;
    }

    const investmentNames: Record<string, string> = {
      tfsa: 'TFSA',
      rrsp: 'RRSP',
      group_retirement: 'Group Retirement Plan',
    };

    try {
      console.log('Saving investment:', { 
        user_id: user.id, 
        type: investmentType, 
        name: investmentNames[investmentType],
        value: investmentValue,
        rate: MARKET_INVESTMENT_RATE 
      });

      const { data, error } = await supabase.from('assets').insert({
        user_id: user.id,
        budget_plan_id: currentProject.id,
        asset_type: investmentType,
        name: investmentNames[investmentType],
        current_value: Number(investmentValue),
        appreciation_rate: MARKET_INVESTMENT_RATE,
      }).select();

      if (error) {
        console.error('Investment save error:', error);
        throw error;
      }

      console.log('Investment saved successfully:', data);
      toast.success('Investment added successfully!');
      setInvestmentType('');
      setInvestmentValue('');
      setIsAddInvestmentOpen(false);
      loadAssets();
    } catch (error: any) {
      console.error('Failed to add investment:', error);
      toast.error(error.message || 'Failed to add investment');
    }
  };

  const saveOtherAsset = async () => {
    if (!user || !otherAssetName || !otherAssetValue || !otherAssetRate) {
      toast.error('Please fill in all fields');
      return;
    }

    const otherAssetsCount = assets.filter(a => a.asset_type === 'other_investment').length;
    if (otherAssetsCount >= 2) {
      toast.error('Maximum 2 other investments allowed');
      return;
    }

    try {
      console.log('Saving other asset:', { 
        user_id: user.id, 
        name: otherAssetName, 
        value: otherAssetValue,
        rate: Number(otherAssetRate) / 100 
      });

      const { data, error } = await supabase.from('assets').insert({
        user_id: user.id,
        budget_plan_id: currentProject.id,
        asset_type: 'other_investment',
        name: otherAssetName,
        current_value: Number(otherAssetValue),
        appreciation_rate: Number(otherAssetRate) / 100,
      }).select();

      if (error) {
        console.error('Other asset save error:', error);
        throw error;
      }

      console.log('Other asset saved successfully:', data);
      toast.success('Asset added successfully!');
      setOtherAssetName('');
      setOtherAssetValue('');
      setOtherAssetRate('');
      setIsAddOtherOpen(false);
      loadAssets();
    } catch (error: any) {
      console.error('Failed to add asset:', error);
      toast.error(error.message || 'Failed to add asset');
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await supabase.from('assets').delete().eq('id', id).eq('user_id', user?.id);
      toast.success('Asset deleted successfully!');
      loadAssets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete asset');
    }
  };

  const properties = assets.filter(a => a.asset_type === 'property');
  const investments = assets.filter(a => ['tfsa', 'rrsp', 'group_retirement'].includes(a.asset_type));
  const otherAssets = assets.filter(a => a.asset_type === 'other_investment');
  
  const totalCurrentValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const totalFutureValue = assets.reduce((sum, a) => {
    const rate = Number(a.appreciation_rate || 0);
    return sum + calculateFutureValue(Number(a.current_value || 0), rate, futureYears);
  }, 0);

  return (
    <div className="min-h-screen bg-[image:var(--gradient-sky)] relative overflow-hidden">
      {/* Organic Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <PiggyBank className="h-9 w-9 text-accent" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">Savings Goals</h2>
              <p className="text-muted-foreground mt-1 text-lg">Set and track your savings targets</p>
            </div>
          </div>
        </div>

        {/* Available Surplus Card */}
        <Card className="mb-6 border-2 border-accent/20 rounded-[2rem] [box-shadow:var(--shadow-leaf)]">
          <CardHeader className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-t-[2rem]">
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

        {/* Create Savings Goal - Collapsible */}
        <Collapsible open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
          <Card className="mb-6 border-2 shadow-lg">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle>Create Savings Goal</CardTitle>
                    <CardDescription>Set a target and track your progress</CardDescription>
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isCreateGoalOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-6">
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
        {existingGoals.length > 0 && (() => {
          // Calculate summary stats
          const totalGoals = existingGoals.length;
          const totalTarget = existingGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
          const totalCurrent = existingGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);
          const totalMonthly = existingGoals.reduce((sum, g) => sum + Number(g.monthly_contribution), 0);
          const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

          return (
            <Collapsible open={isGoalsOpen} onOpenChange={setIsGoalsOpen}>
              <Card className="border-2 shadow-lg">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="bg-gradient-to-r from-accent/5 via-accent/3 to-transparent cursor-pointer hover:bg-accent/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <CardTitle>Your Savings Goals</CardTitle>
                        <CardDescription>Track and manage your savings progress</CardDescription>
                        
                        {/* Summary when collapsed */}
                        {!isGoalsOpen && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-background/50 p-2 rounded-lg">
                              <div className="text-xs text-muted-foreground">Goals</div>
                              <div className="font-bold text-lg">{totalGoals}</div>
                            </div>
                            <div className="bg-background/50 p-2 rounded-lg">
                              <div className="text-xs text-muted-foreground">Progress</div>
                              <div className="font-bold text-lg text-primary">{overallProgress.toFixed(0)}%</div>
                            </div>
                            <div className="bg-background/50 p-2 rounded-lg">
                              <div className="text-xs text-muted-foreground">Saved</div>
                              <div className="font-bold text-lg text-green-600 dark:text-green-400">
                                ${formatCurrency(totalCurrent)}
                              </div>
                            </div>
                            <div className="bg-background/50 p-2 rounded-lg">
                              <div className="text-xs text-muted-foreground">Target</div>
                              <div className="font-bold text-lg">${formatCurrency(totalTarget)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform flex-shrink-0 ml-2 ${isGoalsOpen ? 'rotate-180' : ''}`} />
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
                        <div className="flex flex-col gap-0.5">
                          {goal.target_date && (
                            <p className="text-sm text-muted-foreground">
                              Target: {new Date(goal.target_date).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(goal.updated_at).toLocaleDateString()} at {new Date(goal.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
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
          );
        })()}

        {/* Investments & Assets Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold text-foreground">Investments & Assets</h2>
              <p className="text-muted-foreground mt-1">Track your properties, investments, and other assets</p>
            </div>
          </div>
        </div>

        {/* Assets Summary Card - Collapsible */}
        <Collapsible open={isAssetsOpen} onOpenChange={setIsAssetsOpen}>
          <Card className="mb-6 border-2 shadow-lg">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-left flex-1">
                    <CardTitle>Portfolio Overview</CardTitle>
                    <CardDescription>Your total investment and asset value</CardDescription>
                  </div>
                  {!isAssetsOpen && (
                    <div className="flex items-center gap-4 mr-4">
                      <div className="grid grid-cols-3 gap-3">
                        {/* Properties Summary */}
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Home className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">Properties ({properties.length})</div>
                          </div>
                          <div className="font-bold text-sm">
                            ${formatCurrency(properties.reduce((sum, a) => sum + Number(a.current_value || 0), 0))}
                          </div>
                        </div>
                        
                        {/* Standard Investments Summary */}
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">Standard ({investments.length})</div>
                          </div>
                          <div className="font-bold text-sm">
                            ${formatCurrency(investments.reduce((sum, a) => sum + Number(a.current_value || 0), 0))}
                          </div>
                        </div>
                        
                        {/* Other Investments Summary */}
                        <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">Other ({otherAssets.length})</div>
                          </div>
                          <div className="font-bold text-sm">
                            ${formatCurrency(otherAssets.reduce((sum, a) => sum + Number(a.current_value || 0), 0))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Summary */}
                      <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                        <div className="text-xs text-muted-foreground mb-1">Total ({futureYears}Y)</div>
                        <div className="font-bold text-base text-primary">
                          ${formatCurrency(totalFutureValue)}
                        </div>
                      </div>
                    </div>
                  )}
                  <ChevronDown className={`h-5 w-5 transition-transform flex-shrink-0 ml-2 ${isAssetsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6">
                <div className="mb-6 flex justify-end">
                  <Tabs value={futureYears.toString()} onValueChange={(v) => setFutureYears(Number(v))}>
                    <TabsList>
                      <TabsTrigger value="5">5Y</TabsTrigger>
                      <TabsTrigger value="10">10Y</TabsTrigger>
                      <TabsTrigger value="15">15Y</TabsTrigger>
                      <TabsTrigger value="20">20Y</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Total Value</p>
                    <div className="text-3xl font-bold text-primary">
                      ${formatCurrency(totalCurrentValue)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Projected Value ({futureYears} years)
                    </p>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${formatCurrency(totalFutureValue)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Growth: +${formatCurrency(totalFutureValue - totalCurrentValue)}
                    </p>
                  </div>
                </div>

        {/* Properties Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Properties (Max 2)
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs z-50 bg-popover border">
                    <p className="text-sm">Properties use 10-year average compounded appreciation rates specific to each Ontario city.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Track real estate investments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {properties.map((property) => {
              const futureValue = calculateFutureValue(
                Number(property.current_value),
                Number(property.appreciation_rate),
                futureYears
              );
              return (
                <div key={property.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{property.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Rate: {(Number(property.appreciation_rate) * 100).toFixed(1)}% annually
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteAsset(property.id)}>
                      Delete
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="text-lg font-bold">${formatCurrency(Number(property.current_value))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{futureYears}Y Projection</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${formatCurrency(futureValue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {properties.length < 2 && (
              <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Add Property</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Property</DialogTitle>
                    <DialogDescription>Add a property to track its appreciation over time</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>City</Label>
                      <Select value={propertyCity} onValueChange={setPropertyCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {ONTARIO_CITIES.map(city => (
                            <SelectItem key={city} value={city}>
                              {city} ({(ONTARIO_CITY_RATES[city] * 100).toFixed(1)}% avg)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current Value ($)</Label>
                      <Input
                        type="number"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <Button onClick={saveProperty} className="w-full">Add Property</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Standard Investments Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Standard Investments (Max 3)
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs z-50 bg-popover border">
                    <p className="text-sm">Uses combined 10-year average of S&P 500, TSX, and Dow Jones ({(MARKET_INVESTMENT_RATE * 100).toFixed(1)}% annually).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>TFSA, RRSP, and Group Retirement Plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {investments.map((investment) => {
              const futureValue = calculateFutureValue(
                Number(investment.current_value),
                MARKET_INVESTMENT_RATE,
                futureYears
              );
              return (
                <div key={investment.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{investment.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Market rate: {(MARKET_INVESTMENT_RATE * 100).toFixed(1)}% annually
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteAsset(investment.id)}>
                      Delete
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="text-lg font-bold">${formatCurrency(Number(investment.current_value))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{futureYears}Y Projection</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${formatCurrency(futureValue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {investments.length < 3 && (
              <Dialog open={isAddInvestmentOpen} onOpenChange={setIsAddInvestmentOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Add Investment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Standard Investment</DialogTitle>
                    <DialogDescription>Add a TFSA, RRSP, or Group Retirement Plan</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Investment Type</Label>
                      <Select value={investmentType} onValueChange={setInvestmentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {!investments.some(i => i.asset_type === 'tfsa') && (
                            <SelectItem value="tfsa">TFSA</SelectItem>
                          )}
                          {!investments.some(i => i.asset_type === 'rrsp') && (
                            <SelectItem value="rrsp">RRSP</SelectItem>
                          )}
                          {!investments.some(i => i.asset_type === 'group_retirement') && (
                            <SelectItem value="group_retirement">Group Retirement Plan</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current Value ($)</Label>
                      <Input
                        type="number"
                        value={investmentValue}
                        onChange={(e) => setInvestmentValue(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <Button onClick={saveInvestment} className="w-full">Add Investment</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Other Assets Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Other Investments (Max 2)
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs z-50 bg-popover border">
                    <p className="text-sm">Define your own custom growth rates for specialized assets.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Custom assets with user-defined growth rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherAssets.map((asset) => {
              const futureValue = calculateFutureValue(
                Number(asset.current_value),
                Number(asset.appreciation_rate),
                futureYears
              );
              return (
                <div key={asset.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{asset.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Custom rate: {(Number(asset.appreciation_rate) * 100).toFixed(1)}% annually
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteAsset(asset.id)}>
                      Delete
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="text-lg font-bold">${formatCurrency(Number(asset.current_value))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{futureYears}Y Projection</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${formatCurrency(futureValue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {otherAssets.length < 2 && (
              <Dialog open={isAddOtherOpen} onOpenChange={setIsAddOtherOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Add Other Investment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Other Investment</DialogTitle>
                    <DialogDescription>Add a custom investment with your own growth rate</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Asset Name</Label>
                      <Input
                        value={otherAssetName}
                        onChange={(e) => setOtherAssetName(e.target.value)}
                        placeholder="e.g., Cryptocurrency, Art Collection"
                      />
                    </div>
                    <div>
                      <Label>Current Value ($)</Label>
                      <Input
                        type="number"
                        value={otherAssetValue}
                        onChange={(e) => setOtherAssetValue(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Expected Annual Growth Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={otherAssetRate}
                        onChange={(e) => setOtherAssetRate(e.target.value)}
                        placeholder="e.g., 5.0"
                      />
                    </div>
                    <Button onClick={saveOtherAsset} className="w-full">Add Asset</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
