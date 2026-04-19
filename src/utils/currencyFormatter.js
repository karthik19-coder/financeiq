const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as INR currency string.
 * e.g. 123456 → "₹1,23,456"
 */
export function formatINR(amount) {
  return inrFormatter.format(amount);
}

/**
 * Short-hand INR formatter for large numbers.
 * e.g. 123456 → "₹1.2L", 45000 → "₹45K"
 */
export function formatShort(amount) {
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
}
