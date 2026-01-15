export const useCurrency = () => {
  const { locale } = useI18n();

  const formatCurrency = (amount: number, currencyCode: string = 'EUR') => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return {
    formatCurrency
  };
};
