export const useCurrency = () => {
  const { locale } = useI18n();

  const formatCurrency = (
    amount: number,
    currencyCode: string = 'EUR',
    excludeSymbol: boolean = false,
    options: Intl.NumberFormatOptions = {}
  ) => {
    return new Intl.NumberFormat(locale.value, {
      style: excludeSymbol ? 'decimal' : 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    }).format(amount);
  };

  const getCurrencySymbol = (currencyCode: string = 'EUR') => {
    const parts = new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).formatToParts(0);

    return parts.find((part) => part.type === 'currency')?.value ?? currencyCode;
  };

  return {
    formatCurrency,
    getCurrencySymbol
  };
};
