import { z } from 'zod';
import { hasMaxTwoDecimals, parseLocalizedDecimal, roundTo2 } from '../utils/numberLocale';

const toParsedNumber = (input: unknown, locale: string) => {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return { ok: false as const, key: 'validation.number_invalid' };
    if (roundTo2(input) !== input) return { ok: false as const, key: 'validation.max_two_decimals' };
    return { ok: true as const, value: input };
  }

  if (typeof input !== 'string') return { ok: false as const, key: 'validation.number_invalid' };

  if (!hasMaxTwoDecimals(input)) {
    return { ok: false as const, key: 'validation.max_two_decimals' };
  }

  const parsed = parseLocalizedDecimal(input, locale);
  if (parsed === null) {
    return { ok: false as const, key: 'validation.number_invalid' };
  }

  return { ok: true as const, value: parsed };
};

const numericSchema = (locale: string) =>
  z.union([z.string(), z.number()]).transform((input, ctx) => {
    const parsed = toParsedNumber(input, locale);

    if (!parsed.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: parsed.key
      });
      return z.NEVER;
    }

    return parsed.value;
  });

export const budgetSchema = (locale: string) =>
  numericSchema(locale).refine((value) => value >= 0, {
    message: 'validation.min_zero'
  });

export const positiveAmountSchema = (locale: string) =>
  numericSchema(locale).refine((value) => value > 0, {
    message: 'validation.must_be_positive'
  });
