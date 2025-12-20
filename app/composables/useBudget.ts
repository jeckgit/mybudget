import type { AppState, Transaction, BudgetConfig } from '~/types';

export const useBudget = () => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}`;
  };

  const getCurrentMonthKey = () => {
    return getMonthKey(new Date());
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol}${Math.abs(amount).toFixed(0)}`;
  };

  const calculateBudgetData = (state: AppState, targetDate: Date = new Date()) => {
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === targetDate.getFullYear() && today.getMonth() === targetDate.getMonth();

    const monthKey = getMonthKey(targetDate);
    const daysInMonth = getDaysInMonth(targetDate);
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;
    const daysRemaining = isCurrentMonth ? daysInMonth - currentDay + 1 : 1;

    const monthTransactions = state.transactions.filter((t) => {
      const d = new Date(t.date);
      return getMonthKey(d) === monthKey;
    });

    const totalSpentMonth = monthTransactions.reduce((acc, t) => acc + t.amount, 0);
    const remainingMonthly = state.config.monthlyLimit - totalSpentMonth;

    const spentToday = isCurrentMonth
      ? monthTransactions.filter((t) => new Date(t.date).getDate() === currentDay).reduce((acc, t) => acc + t.amount, 0)
      : 0;

    const budgetAvailableForTodayAndFuture = remainingMonthly + spentToday;
    const dailyTarget = budgetAvailableForTodayAndFuture / daysRemaining;
    const remainingToday = dailyTarget - spentToday;
    const isOverBudget = remainingToday < 0;

    const avgDaily = state.config.monthlyLimit / daysInMonth;

    return {
      today,
      targetDate,
      currentMonthKey: monthKey,
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
    getMonthKey,
    getCurrentMonthKey,
    formatCurrency,
    calculateBudgetData
  };
};
