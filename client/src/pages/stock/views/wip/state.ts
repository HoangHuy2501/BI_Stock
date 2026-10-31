import type { WipLotItem } from '@shared/api.interface';

import type { CauseMeta } from '../../lib/lights';
import { WEEK_RANGES, WIP_CAUSES, isBlueTag, lightOf } from '../../lib/lights';
import type { LotTag, LotTagMap, WipFocus, WipFocusDim } from './types';

export const EMPTY_TAG: LotTag = { cause: null, blueFlag: false };

export const EMPTY_FOCUS: WipFocus = { light: null, week: null, cust: null, cause: null };

export const OPEN_CAUSE_KEY = 'open';

export const normalizeBuyerName = (name: string | null | undefined): string => {
  const normalized = name?.trim();
  return !normalized || normalized === '-' ? 'Other / unbranded' : normalized;
};

export const seedTags = (lots: WipLotItem[]): LotTagMap => {
  const map: LotTagMap = {};
  lots.forEach((lot: WipLotItem) => {
    if (!lot.cause && !lot.blueFlag) return;
    map[lot.id] = { cause: lot.cause, blueFlag: lot.blueFlag };
  });
  return map;
};

export const tagFor = (tags: LotTagMap, lotId: string): LotTag => tags[lotId] ?? EMPTY_TAG;

export const isBlueLot = (tag: LotTag): boolean => isBlueTag(tag.cause, tag.blueFlag);

export const causeLabel = (key: string): string => {
  if (key === OPEN_CAUSE_KEY) return '未分类 · Not yet classified';
  const hit = WIP_CAUSES.find((cause: CauseMeta) => cause.key === key);
  return hit ? `${hit.zh} · ${hit.name}` : key;
};

/* clicking the active dimension clears it, exactly like the source board */
export const toggleFocus = (focus: WipFocus, dim: WipFocusDim, value: number | string): WipFocus => {
  const clearing = focus[dim] === value;
  if (dim === 'light') return { ...focus, light: clearing ? null : Number(value) };
  if (dim === 'week') return { ...focus, week: clearing ? null : Number(value) };
  if (dim === 'cust') return { ...focus, cust: clearing ? null : Number(value) };
  return { ...focus, cause: clearing ? null : String(value) };
};

export const filterLots = (lots: WipLotItem[], tags: LotTagMap, focus: WipFocus): WipLotItem[] =>
  lots.filter((lot: WipLotItem) => {
    const tag = tagFor(tags, lot.id);
    if (focus.light !== null) {
      if (focus.light === 4) {
        if (!isBlueLot(tag)) return false;
      } else if (lightOf(lot.days) !== focus.light) {
        return false;
      }
    }
    if (focus.week !== null) {
      const range: number[] = WEEK_RANGES[focus.week] ?? [0, Number.POSITIVE_INFINITY];
      if (lot.days < range[0] || lot.days >= range[1]) return false;
    }
    if (focus.cust !== null && lot.customerIdx !== focus.cust) return false;
    if (focus.cause !== null) {
      if (focus.cause === OPEN_CAUSE_KEY) {
        if (tag.cause !== null) return false;
      } else if (tag.cause !== focus.cause) {
        return false;
      }
    }
    return true;
  });

export const focusKeyOf = (focus: WipFocus): string =>
  [focus.light, focus.week, focus.cust, focus.cause]
    .map((value: number | string | null) => (value === null ? '' : String(value)))
    .join('|');
