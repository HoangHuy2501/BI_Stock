import { RESERVE_BAND_DEFS, RESERVE_BIN_DEFS, reserveBandIndex } from '@shared/api.interface';

import { DAYS_PER_MONTH } from './format';

export interface ReserveBandStyle {
  key: string;
  zh: string;
  label: string;
  from: number;
  to: number;
  color: string;
  tint: string;
  ink: string;
}

const BAND_STYLE: { color: string; tint: string; ink: string }[] = [
  { color: '#2e9e5b', tint: '#e8f7ee', ink: '#1c7a44' },
  { color: '#e0b100', tint: '#fdf6d6', ink: '#8a6c00' },
  { color: '#f0816f', tint: '#fdeeea', ink: '#b8452f' },
  { color: '#d92d20', tint: '#fde3e1', ink: '#a61b12' },
  { color: '#8f160d', tint: '#f8d7d4', ink: '#75130b' },
];

export const RESERVE_BANDS: ReserveBandStyle[] = RESERVE_BAND_DEFS.map((band, index: number) => ({
  key: band.key,
  zh: band.labelZh,
  label: band.labelEn,
  from: band.fromMonth,
  to: band.toMonth,
  color: BAND_STYLE[index].color,
  tint: BAND_STYLE[index].tint,
  ink: BAND_STYLE[index].ink,
}));

export const reserveBandKeyOf = (label: string | null): string | null => {
  if (!label) return null;
  const normalized = label.trim();
  const band = RESERVE_BANDS.find((item) => item.label === normalized || item.zh === normalized);
  if (band) return band.key;
  return normalized === '12+ months' || normalized === '12+ mo' ? 'gte12' : null;
};

export interface ReserveBinDef {
  label: string;
  from: number;
  to: number;
}

export const RESERVE_BINS: ReserveBinDef[] = RESERVE_BIN_DEFS.map((bin) => ({
  label: bin.label,
  from: bin.fromMonth,
  to: bin.toMonth,
}));

export const bandIndexOf = (months: number): number => reserveBandIndex(months);

export const bandOf = (months: number): ReserveBandStyle => RESERVE_BANDS[bandIndexOf(months)];

export const monthsOfDays = (days: number): number => Math.max(0, days / DAYS_PER_MONTH);
