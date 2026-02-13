import { describe, expect, it } from 'vitest';
import {
  formatLocalized2,
  getDecimalSeparator,
  hasMaxTwoDecimals,
  normalizeDecimalInput,
  parseLocalizedDecimal,
  roundTo2
} from './numberLocale';

describe('numberLocale utils', () => {
  it('returns locale decimal separator', () => {
    expect(getDecimalSeparator('de-DE')).toBe(',');
    expect(getDecimalSeparator('en-US')).toBe('.');
  });

  it('normalizes input while keeping single decimal separator', () => {
    expect(normalizeDecimalInput(' 12,34 ')).toBe('12,34');
    expect(normalizeDecimalInput('1a2.3.4')).toBe('12.34');
    expect(normalizeDecimalInput('--1,2')).toBe('-1,2');
  });

  it('checks max two decimals', () => {
    expect(hasMaxTwoDecimals('900,34')).toBe(true);
    expect(hasMaxTwoDecimals('900.34')).toBe(true);
    expect(hasMaxTwoDecimals('900,344')).toBe(false);
    expect(hasMaxTwoDecimals('900.344')).toBe(false);
  });

  it('parses localized decimals tolerant for comma and dot', () => {
    expect(parseLocalizedDecimal('900,34', 'de-DE')).toBe(900.34);
    expect(parseLocalizedDecimal('900.34', 'de-DE')).toBe(900.34);
    expect(parseLocalizedDecimal('900,34', 'en-US')).toBe(900.34);
    expect(parseLocalizedDecimal('900.34', 'en-US')).toBe(900.34);
    expect(parseLocalizedDecimal('', 'de-DE')).toBeNull();
    expect(parseLocalizedDecimal('12,', 'de-DE')).toBeNull();
  });

  it('rounds to two decimals and formats locale-aware', () => {
    expect(roundTo2(10.005)).toBe(10.01);
    expect(roundTo2(10.004)).toBe(10);
    expect(formatLocalized2(12.3, 'de-DE')).toBe('12,30');
    expect(formatLocalized2(12.3, 'en-US')).toBe('12.30');
  });
});
