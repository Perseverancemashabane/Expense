export function formatZAR(amount: number | string | undefined | null): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
  if (isNaN(num)) return 'R 0.00';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(num)
    .replace('ZAR', 'R');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatPercentage(val: number): string {
  return `${(Math.round(val * 10) / 10).toFixed(1)}%`;
}

