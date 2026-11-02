import type { ReserveDataset, ReserveRegisterLine } from '@shared/api.interface';

import { RESERVE_BANDS, RESERVE_BINS, reserveBandKeyOf } from '../../lib/reserve';

export type ReserveDim = 'band' | 'bin' | 'cust';

export interface ReserveFocus {
  band: number | null;
  bin: number | null;
  cust: string | null;
}

export interface ReserveChip {
  key: string;
  dim: ReserveDim;
  dimLabel: string;
  label: string;
  value: number | string;
}

export interface ReserveBalance {
  usd: number;
  label: string;
}

export type ReservePick = (dim: ReserveDim, value: number | string) => void;

export const EMPTY_FOCUS: ReserveFocus = { band: null, bin: null, cust: null };

export const toggleFocus = (focus: ReserveFocus, dim: ReserveDim, value: number | string): ReserveFocus => {
  const next: ReserveFocus = { band: focus.band, bin: focus.bin, cust: focus.cust };
  if (dim === 'cust') {
    next.cust = focus.cust === String(value) ? null : String(value);
  } else {
    next[dim] = focus[dim] === value ? null : Number(value);
  }
  return next;
};

const normalizedBuyer = (buyer: string | null): string => buyer?.trim() || '-';

export const filterReserveRows = (dataset: ReserveDataset, focus: ReserveFocus): ReserveRegisterLine[] =>
  dataset.rows.filter((line: ReserveRegisterLine): boolean => {
    if (
      focus.band !== null &&
      reserveBandKeyOf(line.ageBand) !== RESERVE_BANDS[focus.band]?.key
    ) return false;
    const bin = focus.bin !== null ? RESERVE_BINS[focus.bin] : null;
    if (
      bin &&
      (line.ageMonths == null || line.ageMonths < bin.from || line.ageMonths >= bin.to)
    ) return false;
    if (focus.cust !== null && normalizedBuyer(line.buyer) !== normalizedBuyer(focus.cust)) return false;
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
      label: focus.cust,
      value: focus.cust,
    });
  }
  return chips;
};

export const focusKeyOf = (chips: ReserveChip[]): string =>
  chips.map((chip: ReserveChip) => `${chip.key}:${chip.value}`).join('|');

export const buildBalance = (
  dataset: ReserveDataset,
  focus: ReserveFocus,
  rows: ReserveRegisterLine[],
): ReserveBalance | null => {
  if (
    focus.cust !== null ||
    (focus.band === null && focus.bin === null) ||
    (focus.band !== null && focus.bin !== null)
  ) return null;
  const signalUsd = focus.band !== null
    ? dataset.bands[focus.band]?.usd
    : dataset.hist[focus.bin ?? 0]?.usd;
  const label = focus.band !== null
    ? RESERVE_BANDS[focus.band]?.label
    : RESERVE_BINS[focus.bin ?? 0]?.label;
  if (signalUsd === undefined || label === undefined) return null;
  const itemised = rows.reduce((total: number, line: ReserveRegisterLine): number => total + line.usd, 0);
  const rest = signalUsd - itemised;
  return rest > 1 ? { usd: rest, label } : null;
};
