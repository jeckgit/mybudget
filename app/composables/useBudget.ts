import type { AppState, Transaction, BudgetConfig } from '~/../shared/types';

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

    const avgDaily = state.config.monthlyLimit / daysInMonth;

    // Feature: Adaptive Smart Start
    // Rule: The budget "starts" on the day of the first transaction of the month,
    // or "today" if no transactions exist yet. Days before this are "skipped".
    let effectiveRemainingForDailyCalc = remainingMonthly;

    if (isCurrentMonth) {
      let startDayOfMonth = 1;

      if (monthTransactions.length > 0) {
        // Find earliest transaction date
        const sorted = [...monthTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        startDayOfMonth = sorted[0] ? new Date(sorted[0].date).getDate() : 1;
      } else {
        // No transactions yet -> Start today
        startDayOfMonth = currentDay;
      }

      // If we are starting late (after the 1st), deduct implied spending for skipped days
      if (startDayOfMonth > 1) {
        const skippedDays = startDayOfMonth - 1;
        const assumedPastSpending = skippedDays * avgDaily;
        // We only adjust the *calculation base* for the daily target, not the actual remaining money
        effectiveRemainingForDailyCalc = Math.max(0, remainingMonthly - assumedPastSpending);
      }
    }

    const budgetAvailableForTodayAndFuture = effectiveRemainingForDailyCalc + spentToday;
    const dailyTarget = budgetAvailableForTodayAndFuture / daysRemaining;
    const remainingToday = dailyTarget - spentToday;
    const isOverBudget = remainingToday < 0;

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

    calculateBudgetData
  };
};
