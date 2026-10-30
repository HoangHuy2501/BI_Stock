export const usd = (value: number): string => `$${Math.round(value).toLocaleString('en-US')}`;

export const num = (value: number): string => Math.round(value).toLocaleString('en-US');

export const usdCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
};

export const pct = (value: number, total: number): string => {
  if (!total) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const axisNum = (value: number): string => {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${(millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${(thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)).replace(/\.0$/, '')}K`;
  }
  return String(Math.round(value));
};

export const DAYS_PER_MONTH = 30.44;
