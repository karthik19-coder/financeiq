import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function useBudget() {
  const {
    budget,
    remainingBudget,
    budgetPercentage,
    currentMonthExpenses,
    setBudget,
  } = useFinance();

  const budgetStatus = useMemo(() => {
    if (budgetPercentage > 90) return 'danger';
    if (budgetPercentage >= 70) return 'warning';
    return 'safe';
  }, [budgetPercentage]);

  return {
    monthlyBudget: budget.monthlyBudget,
    remainingBudget,
    budgetPercentage,
    currentMonthExpenses,
    setBudget,
    budgetStatus,
  };
}
