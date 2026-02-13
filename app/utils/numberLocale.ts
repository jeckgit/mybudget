export const getDecimalSeparator = (locale: string) => {
  const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
  return parts.find((part) => part.type === 'decimal')?.value || '.';
};

export const normalizeDecimalInput = (raw: string) => {
  const input = raw.replace(/\s+/g, '');
  let output = '';
  let hasDecimal = false;
  let hasSign = false;

  for (const ch of input) {
    if (/\d/.test(ch)) {
      output += ch;
      continue;
    }

    if ((ch === '.' || ch === ',') && !hasDecimal) {
      output += ch;
      hasDecimal = true;
      continue;
    }

    if (ch === '-' && output.length === 0 && !hasSign) {
      output += ch;
      hasSign = true;
    }
  }

  return output;
};

export const hasMaxTwoDecimals = (raw: string) => {
  const normalized = normalizeDecimalInput(raw);
  const decimalIndex = Math.max(normalized.lastIndexOf('.'), normalized.lastIndexOf(','));
  if (decimalIndex === -1) return true;

  return normalized.slice(decimalIndex + 1).length <= 2;
};

export const parseLocalizedDecimal = (raw: string, _locale: string) => {
  const normalized = normalizeDecimalInput(raw);

  if (!normalized || normalized === '-' || normalized === '.' || normalized === ',' || normalized.endsWith('.')
    || normalized.endsWith(',')) {
    return null;
  }

  const canonical = normalized.replace(',', '.');
  const parsed = Number(canonical);
  return Number.isFinite(parsed) ? parsed : null;
};

export const roundTo2 = (value: number) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const formatLocalized2 = (value: number, locale: string) => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  }).format(roundTo2(value));
};
