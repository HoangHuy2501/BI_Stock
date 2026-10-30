import type { ReserveDataset, StockDetailLine } from '@shared/api.interface';

import { RESERVE_BANDS, RESERVE_BINS, bandIndexOf, monthsOfDays } from '../../lib/reserve';

export type ReserveDim = 'band' | 'bin' | 'cust';

export interface ReserveFocus {
  band: number | null;
  bin: number | null;
  cust: number | null;
}

export interface ReserveChip {
  key: string;
  dim: ReserveDim;
  dimLabel: string;
  label: string;
  value: number;
}

export interface ReserveBalance {
  usd: number;
  label: string;
}

export type ReservePick = (dim: ReserveDim, value: number) => void;

export const EMPTY_FOCUS: ReserveFocus = { band: null, bin: null, cust: null };

export const toggleFocus = (focus: ReserveFocus, dim: ReserveDim, value: number): ReserveFocus => {
  const next: ReserveFocus = { band: focus.band, bin: focus.bin, cust: focus.cust };
  next[dim] = focus[dim] === value ? null : value;
  return next;
};

export const buyerNameOf = (dataset: ReserveDataset, idx: number): string => {
  const buyers = dataset.bandBuyers.flat();
  const buyer = dataset.buyers.find((item) => item.idx === idx) ?? buyers.find((item) => item.idx === idx);
  if (buyer) return buyer.name;
  const line = dataset.rows.find((item: StockDetailLine) => item.customerIdx === idx);
  return line ? line.customerName : `Buyer ${idx}`;
};

export const filterReserveRows = (dataset: ReserveDataset, focus: ReserveFocus): StockDetailLine[] =>
  dataset.rows.filter((line: StockDetailLine): boolean => {
    const months = monthsOfDays(line.ageDays);
    if (focus.band !== null && bandIndexOf(months) !== focus.band) return false;
    const bin = focus.bin !== null ? RESERVE_BINS[focus.bin] : null;
    if (bin && (months < bin.from || months >= bin.to)) return false;
    if (focus.cust !== null && line.customerIdx !== focus.cust) return false;
    return true;
  });

export const buildChips = (dataset: ReserveDataset, focus: ReserveFocus): ReserveChip[] => {
  const chips: ReserveChip[] = [];
  if (focus.band !== null) {
    const band = RESERVE_BANDS[focus.band];
    chips.push({ key: 'band', dim: 'band', dimLabel: 'Age band', label: band ? band.label : '', value: focus.band });
  }
  if (focus.bin !== null) {
    const bin = RESERVE_BINS[focus.bin];
    chips.push({ key: 'bin', dim: 'bin', dimLabel: 'Age', label: bin ? bin.label : '', value: focus.bin });
  }
  if (focus.cust !== null) {
    chips.push({
      key: 'cust',
      dim: 'cust',
      dimLabel: 'Buyer',
      label: buyerNameOf(dataset, focus.cust),
      value: focus.cust,
    });
  }
  return chips;
};

export const focusKeyOf = (chips: ReserveChip[]): string => chips.map((chip: ReserveChip) => chip.key).join('|');

export const buildBalance = (
  dataset: ReserveDataset,
  focus: ReserveFocus,
  rows: StockDetailLine[],
): ReserveBalance | null => {
  if (focus.band === null && focus.bin === null) return null;
  const signalUsd = focus.band !== null
    ? dataset.bands[focus.band]?.usd
    : dataset.hist[focus.bin ?? 0]?.usd;
  const label = focus.band !== null
    ? RESERVE_BANDS[focus.band]?.label
    : RESERVE_BINS[focus.bin ?? 0]?.label;
  if (signalUsd === undefined || label === undefined) return null;
  const itemised = rows.reduce((total: number, line: StockDetailLine): number => total + line.usd, 0);
  const rest = signalUsd - itemised;
  return rest > 1 ? { usd: rest, label } : null;
};
