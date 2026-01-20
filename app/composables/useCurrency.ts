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

  return {
    formatCurrency
  };
};
