import { useCallback } from 'react';

export default function useCurrency() {
  const formatCurrency = useCallback((amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatCurrencyShort = useCallback((amount) => {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(1)}L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)}K`;
    }
    return `${sign}₹${abs}`;
  }, []);

  return { formatCurrency, formatCurrencyShort };
}
