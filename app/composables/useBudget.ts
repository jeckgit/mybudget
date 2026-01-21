export const useBudget = () => {
  const profileStore = useProfileStore();
  const txStore = useTransactionsStore();
  const monthStore = useMonthsStore();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  };

  const getCurrentMonthKey = () => {
    return getMonthKey(new Date());
  };

  const calculateBudgetData = (targetDate: Date = new Date()) => {
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === targetDate.getFullYear() && today.getMonth() === targetDate.getMonth();

    const dateKey = getMonthKey(targetDate);
    const { budget: monthlyLimit } = monthStore.getMonthConfig(targetDate);

    const daysInMonth = getDaysInMonth(targetDate);
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;
    const daysRemaining = isCurrentMonth ? daysInMonth - currentDay + 1 : 1;

    const monthTransactions = txStore.transactions.value.filter((t) => {
      const d = new Date(t.date);
      // Constructing key manually to match getMonthKey output
      const tKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      return tKey === dateKey;
    });

    const totalSpentMonth = monthTransactions.reduce((acc, t) => acc + t.amount, 0);
    const remainingMonthly = monthlyLimit - totalSpentMonth;

    const spentToday = isCurrentMonth
      ? monthTransactions.filter((t) => new Date(t.date).getDate() === currentDay).reduce((acc, t) => acc + t.amount, 0)
      : 0;

    const avgDaily = monthlyLimit / daysInMonth;

    // Feature: Adaptive Smart Start
    let effectiveRemainingForDailyCalc = remainingMonthly;

    if (isCurrentMonth) {
      let startDayOfMonth = 1;

      if (monthTransactions.length > 0) {
        const sorted = [...monthTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        startDayOfMonth = sorted[0] ? new Date(sorted[0].date).getDate() : 1;
      } else {
        startDayOfMonth = currentDay;
      }

      if (startDayOfMonth > 1) {
        const skippedDays = startDayOfMonth - 1;
        const assumedPastSpending = skippedDays * avgDaily;
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
      currentMonthKey: dateKey,
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
