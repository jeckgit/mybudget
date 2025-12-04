import type { AppState, Transaction, BudgetConfig } from '~/types';

export const useBudget = () => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol}${Math.abs(amount).toFixed(0)}`;
  };

  const calculateBudgetData = (state: AppState) => {
    const today = new Date();
    const currentMonthKey = getCurrentMonthKey();
    const daysInMonth = getDaysInMonth(today);
    const currentDay = today.getDate();
    const daysRemaining = daysInMonth - currentDay + 1;

    const monthTransactions = state.transactions.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey;
    });

    const totalSpentMonth = monthTransactions.reduce((acc, t) => acc + t.amount, 0);
    const remainingMonthly = state.config.monthlyLimit - totalSpentMonth;
    const spentToday = monthTransactions
      .filter(t => new Date(t.date).getDate() === currentDay)
      .reduce((acc, t) => acc + t.amount, 0);

    const budgetAvailableForTodayAndFuture = remainingMonthly + spentToday;
    const dailyTarget = budgetAvailableForTodayAndFuture / daysRemaining;
    const remainingToday = dailyTarget - spentToday;
    const isOverBudget = remainingToday < 0;
    
    const avgDaily = state.config.monthlyLimit / daysInMonth;

    return {
      today,
      currentMonthKey,
      daysInMonth,
      currentDay,
      daysRemaining,
      monthTransactions,
      totalSpentMonth,
      remainingMonthly,
      spentToday,
      dailyTarget,
      remainingToday,
      isOverBudget,
      avgDaily
    };
  };

  return {
    getDaysInMonth,
    getCurrentMonthKey,
    formatCurrency,
    calculateBudgetData
  };
};