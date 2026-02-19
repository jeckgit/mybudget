import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Transaction } from '../../shared/types';

// --- Shared state containers (mutated in-place so references stay valid) ---

const state = {
  transactions: [] as Transaction[],
  monthlyBudget: 0,
  monthlyLimit: 0
};

// Nuxt auto-imports are globals — stub them before import
vi.stubGlobal('useProfileStore', () => ({
  config: {
    value: {
      get monthlyLimit() {
        return state.monthlyLimit;
      }
    }
  }
}));

vi.stubGlobal('useTransactionsStore', () => ({
  transactions: {
    get value() {
      return state.transactions;
    }
  }
}));

vi.stubGlobal('useMonthsStore', () => ({
  getMonthConfig: () => ({
    get budget() {
      return state.monthlyBudget;
    }
  })
}));

import { useBudget } from './useBudget';

// --- Helpers ---

/** Create a transaction on a specific day within February 2026 */
function tx(day: number, amount: number, id?: string): Transaction {
  return {
    id: id || `tx-${day}-${Math.random().toString(36).slice(2, 6)}`,
    amount,
    date: new Date(2026, 1, day, 12, 0, 0).toISOString(),
    category: 'test-cat'
  };
}

const FEB_2026 = new Date(2026, 1, 15);

describe('calculateMonthlyBreakdown', () => {
  let calculateMonthlyBreakdown: ReturnType<typeof useBudget>['calculateMonthlyBreakdown'];

  beforeEach(() => {
    state.transactions = [];
    state.monthlyBudget = 0;
    state.monthlyLimit = 0;
    ({ calculateMonthlyBreakdown } = useBudget());
  });

  describe('basic rollover calculation', () => {
    it('calculates correct rollover for the user example (30$/3-day equivalent)', () => {
      // Budget: 280$ for 28 days = 10$/day
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [
        tx(1, 5), // Day 1: spend 5$
        tx(2, 3) // Day 2: spend 3$
        // Day 3: no spending
      ];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      expect(result.avgDaily).toBe(10);

      // Day 1: available = 1×10 - 5 = 5
      expect(days[0]!.available).toBe(5);
      expect(days[0]!.dailyBalance).toBe(5);

      // Day 2: available = 2×10 - (5+3) = 12
      expect(days[1]!.available).toBe(12);
      expect(days[1]!.dailyBalance).toBe(7);

      // Day 3: available = 3×10 - 8 = 22 (rollover accumulates)
      expect(days[2]!.available).toBe(22);
      expect(days[2]!.dailyBalance).toBe(10);
    });

    it('shows negative available when overspending', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [
        tx(1, 15), // Day 1: overspend by 5$
        tx(2, 5) // Day 2: spend normal
      ];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      // Day 1: available = 10 - 15 = -5
      expect(days[0]!.available).toBe(-5);

      // Day 2: available = 20 - 20 = 0
      expect(days[1]!.available).toBe(0);
    });

    it('handles days with no spending — rollover accumulates', () => {
      state.monthlyBudget = 310; // 31 days = 10$/day
      state.monthlyLimit = 310;
      state.transactions = [];

      // Use a past month so getEffectiveStartDate defaults to day 1
      const JAN_2026 = new Date(2026, 0, 15);
      const result = calculateMonthlyBreakdown(JAN_2026);
      const days = result.dailyBreakdown;

      expect(days[0]!.available).toBe(10);
      expect(days[1]!.available).toBe(20);
      expect(days[2]!.available).toBe(30);
      expect(days[30]!.available).toBe(310);
    });
  });

  describe('income handling in rollover', () => {
    it('income increases available budget (rollover mode)', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [
        tx(1, 5), // Expense: 5$
        tx(1, -20) // Income: 20$
      ];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      // netSpent = 5 + (-20) = -15, available = 10 - (-15) = 25
      expect(days[0]!.netSpent).toBe(-15);
      expect(days[0]!.available).toBe(25);
      expect(days[0]!.expensesOnly).toBe(5);
    });

    it('separates expensesOnly from netSpent correctly', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [
        tx(1, 30), // Expense
        tx(1, -10), // Income
        tx(2, 5) // Expense
      ];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      expect(days[0]!.netSpent).toBe(20);
      expect(days[0]!.expensesOnly).toBe(30);

      expect(days[1]!.netSpent).toBe(5);
      expect(days[1]!.expensesOnly).toBe(5);
    });

    it('income-only day increases rollover', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [
        tx(1, -50) // Income only
      ];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      // available = 10 - (-50) = 60
      expect(days[0]!.available).toBe(60);
      expect(days[0]!.expensesOnly).toBe(0);

      // Day 2: available = 20 - (-50) = 70
      expect(days[1]!.available).toBe(70);
    });
  });

  describe('dailyBalance (non-rollover mode)', () => {
    it('dailyBalance is independent per day — no rollover', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [tx(1, 5), tx(2, 15), tx(3, 2)];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      expect(days[0]!.dailyBalance).toBe(5); // 10 - 5
      expect(days[1]!.dailyBalance).toBe(-5); // 10 - 15
      expect(days[2]!.dailyBalance).toBe(8); // 10 - 2
    });
  });

  describe('multiple transactions per day', () => {
    it('aggregates multiple expenses on the same day', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [tx(1, 3, 'tx-1a'), tx(1, 4, 'tx-1b'), tx(1, 1, 'tx-1c')];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      expect(days[0]!.netSpent).toBe(8);
      expect(days[0]!.expensesOnly).toBe(8);
      expect(days[0]!.available).toBe(2);
    });

    it('handles mixed income and expenses on same day', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;

      state.transactions = [tx(1, 10, 'exp'), tx(1, -3, 'inc'), tx(1, 5, 'exp2')];

      const result = calculateMonthlyBreakdown(FEB_2026);
      const days = result.dailyBreakdown;

      expect(days[0]!.netSpent).toBe(12); // 10 + (-3) + 5
      expect(days[0]!.expensesOnly).toBe(15); // 10 + 5
      expect(days[0]!.available).toBe(-2); // 10 - 12
    });
  });

  describe('edge cases', () => {
    it('handles zero budget gracefully', () => {
      state.monthlyBudget = 0;
      state.monthlyLimit = 0;
      state.transactions = [tx(1, 5)];

      const result = calculateMonthlyBreakdown(FEB_2026);
      expect(result.avgDaily).toBe(0);
      expect(result.dailyBreakdown[0]!.available).toBe(-5);
    });

    it('all 28 days are generated for February', () => {
      state.monthlyBudget = 280;
      state.monthlyLimit = 280;
      state.transactions = [];

      const result = calculateMonthlyBreakdown(FEB_2026);
      expect(result.dailyBreakdown).toHaveLength(28);
    });

    it('generates 31 days for January', () => {
      state.monthlyBudget = 310;
      state.monthlyLimit = 310;
      state.transactions = [];

      const result = calculateMonthlyBreakdown(new Date(2026, 0, 15));
      expect(result.dailyBreakdown).toHaveLength(31);
      expect(result.avgDaily).toBe(10);
    });
  });
});
