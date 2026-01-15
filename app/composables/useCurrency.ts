export const useCurrency = () => {
  const { locale } = useI18n();

  const formatCurrency = (amount: number, currencyCode: string = 'EUR', excludeSymbol: boolean = false) => {
    return new Intl.NumberFormat(locale.value, {
      style: excludeSymbol ? 'decimal' : 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return {
    formatCurrency
  };
};
