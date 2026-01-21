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

  const getEffectiveStartDate = (targetDate: Date) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

    const monthTransactions = txStore.transactions.value.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    if (monthTransactions.length > 0) {
      const sorted = [...monthTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return new Date(year, month, new Date(sorted[0]!.date).getDate());
    } else if (isCurrentMonth) {
      return new Date(year, month, now.getDate());
    } else {
      return new Date(year, month, 1);
    }
  };

  const calculateMonthlyBreakdown = (targetDate: Date) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = getDaysInMonth(targetDate);
    const startDate = getEffectiveStartDate(targetDate);
    const { budget: monthlyLimit } = monthStore.getMonthConfig(targetDate);
    const avgDaily = monthlyLimit / daysInMonth;

    const dayMoneyMap = new Map<string, number>();
    txStore.transactions.value.forEach((tx) => {
      if (!tx.date) return;
      const localDate = new Date(tx.date);
      if (localDate.getFullYear() === year && localDate.getMonth() === month) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
        dayMoneyMap.set(key, (dayMoneyMap.get(key) || 0) + tx.amount);
      }
    });

    const dailyBreakdown: Array<{
      date: Date;
      key: string;
      spent: number;
      available: number;
      dailyBalance: number;
      isSkipped: boolean;
    }> = [];

    let totalSpentSinceStart = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const daySpent = dayMoneyMap.get(key) || 0;

      if (date.getTime() < startDate.getTime()) {
        dailyBreakdown.push({
          date,
          key,
          spent: daySpent,
          available: 0,
          dailyBalance: 0,
          isSkipped: true
        });
      } else {
        const daysActive = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalSpentSinceStart += daySpent;
        const available = daysActive * avgDaily - totalSpentSinceStart;
        dailyBreakdown.push({
          date,
          key,
          spent: daySpent,
          available,
          dailyBalance: avgDaily - daySpent,
          isSkipped: false
        });
      }
    }

    return {
      dailyBreakdown,
      startDate,
      monthlyLimit,
      avgDaily
    };
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

    // Feature: Adaptive Smart Start (Consolidated)
    let effectiveRemainingForDailyCalc = remainingMonthly;

    if (isCurrentMonth) {
      const startDate = getEffectiveStartDate(targetDate);
      const startDayOfMonth = startDate.getDate();

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

    // Calculate total saved from previous days in the budget period
    let totalSaved = 0;
    if (isCurrentMonth) {
      const startDate = getEffectiveStartDate(targetDate);
      const startDay = startDate.getDate();
      const currentDayNum = today.getDate();

      if (currentDayNum > startDay) {
        const daysPassed = currentDayNum - startDay;
        const transactionsUntilYesterday = monthTransactions.filter((t) => new Date(t.date).getDate() < currentDayNum);
        const spentUntilYesterday = transactionsUntilYesterday.reduce((acc, t) => acc + t.amount, 0);
        totalSaved = daysPassed * avgDaily - spentUntilYesterday;
      }
    }

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
      avgDaily,
      totalSaved
    };
  };

  return {
    getDaysInMonth,
    getMonthKey,
    getCurrentMonthKey,
    getEffectiveStartDate,
    calculateMonthlyBreakdown,
    calculateBudgetData
  };
};
