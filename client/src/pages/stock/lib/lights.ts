import type { WipCause } from '@shared/api.interface';
import { WIP_CAUSE_LABELS } from '@shared/api.interface';

export interface LightMeta {
  key: string;
  zh: string;
  name: string;
  rule: string;
  color: string;
  tint: string;
}

export const LIGHT_META: LightMeta[] = [
  { key: 'track', zh: '正常', name: 'On track', rule: '≤ 14 days on the line', color: '#12855a', tint: '#e9f7ef' },
  { key: 'yellow', zh: '黄灯', name: 'Yellow', rule: '15–21 days · > 2 weeks', color: '#c79a12', tint: '#fdf6e0' },
  { key: 'orange', zh: '橙灯', name: 'Orange', rule: '22–28 days · > 3 weeks', color: '#dd7724', tint: '#fdf0e6' },
  { key: 'red', zh: '红灯', name: 'Red', rule: '29+ days · > 4 weeks', color: '#c0301f', tint: '#fdeceb' },
  { key: 'blue', zh: '蓝标', name: 'Blue flag', rule: 'red lot needing attention', color: '#2a6fdb', tint: '#eaf1ff' },
];

export interface CauseMeta {
  key: WipCause;
  zh: string;
  name: string;
  tone: string;
}

const CAUSE_ZH: Record<WipCause, string> = {
  bom: 'BOM错算',
  over: '超订',
  scrap: '裁剪碎布',
  quality: '来料不良',
  delay: '订单延期',
};

const CAUSE_TONE: Record<WipCause, string> = {
  bom: '#7b5bd6',
  over: '#c07a10',
  scrap: '#1596a8',
  quality: '#8a6a4f',
  delay: '#2a6fdb',
};

export const WIP_CAUSES: CauseMeta[] = (Object.keys(WIP_CAUSE_LABELS) as WipCause[]).map((key: WipCause) => ({
  key,
  zh: CAUSE_ZH[key],
  name: WIP_CAUSE_LABELS[key],
  tone: CAUSE_TONE[key],
}));

export const lightOf = (days: number): number => {
  if (days <= 14) return 0;
  if (days <= 21) return 1;
  if (days <= 28) return 2;
  return 3;
};

export const isBlueTag = (cause: string | null, blueFlag: boolean): boolean => cause === 'delay' || blueFlag;

export const WEEK_RANGES: number[][] = [
  [0, 7],
  [7, 14],
  [14, 21],
  [21, 28],
  [28, 42],
  [42, 56],
  [56, 84],
  [84, Number.POSITIVE_INFINITY],
];
