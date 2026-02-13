import { describe, expect, it } from 'vitest';
import { budgetSchema, positiveAmountSchema } from './numeric';

describe('numeric schemas', () => {
  describe('budgetSchema', () => {
    it('accepts valid values with up to two decimals', () => {
      expect(budgetSchema('de-DE').safeParse('0,00').success).toBe(true);
      expect(budgetSchema('de-DE').safeParse('12,30').success).toBe(true);
      expect(budgetSchema('en-US').safeParse('12.30').success).toBe(true);
      expect(budgetSchema('en-US').safeParse('12,30').success).toBe(true);
    });

    it('rejects negative values', () => {
      const result = budgetSchema('de-DE').safeParse('-1');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('validation.min_zero');
      }
    });

    it('rejects more than two decimals', () => {
      const result = budgetSchema('de-DE').safeParse('12,345');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('validation.max_two_decimals');
      }
    });
  });

  describe('positiveAmountSchema', () => {
    it('accepts positive amount', () => {
      expect(positiveAmountSchema('de-DE').safeParse('1,25').success).toBe(true);
      expect(positiveAmountSchema('en-US').safeParse('1.25').success).toBe(true);
    });

    it('rejects zero and negative', () => {
      const zeroResult = positiveAmountSchema('de-DE').safeParse('0');
      expect(zeroResult.success).toBe(false);
      if (!zeroResult.success) {
        expect(zeroResult.error.issues[0]?.message).toBe('validation.must_be_positive');
      }

      const negativeResult = positiveAmountSchema('de-DE').safeParse('-2');
      expect(negativeResult.success).toBe(false);
      if (!negativeResult.success) {
        expect(negativeResult.error.issues[0]?.message).toBe('validation.must_be_positive');
      }
    });

    it('rejects invalid number strings', () => {
      const result = positiveAmountSchema('de-DE').safeParse('abc');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('validation.number_invalid');
      }
    });
  });
});
