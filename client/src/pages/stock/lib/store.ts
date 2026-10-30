import type { StockWarehouse } from '@shared/api.interface';

interface StoreIconRule {
  re: RegExp;
  icon: IconName;
}

export type IconName =
  | 'wip'
  | 'raw'
  | 'sfg'
  | 'finished'
  | 'scrap'
  | 'leftover'
  | 'reserve'
  | 'other'
  | 'alert'
  | 'clock'
  | 'shield'
  | 'search'
  | 'chevron'
  | 'chevronUp'
  | 'chevronDown'
  | 'external';

const STORE_ICON_RULES: StoreIconRule[] = [
  { re: /^(WIP|在制)$/i, icon: 'wip' },
  { re: /原材料|Raw Material/i, icon: 'raw' },
  { re: /半成品|sFG/i, icon: 'sfg' },
  { re: /成品|Finished/i, icon: 'finished' },
  { re: /报废|Scrap/i, icon: 'scrap' },
  { re: /尾货|Left Over/i, icon: 'leftover' },
  { re: /保留|Reserve/i, icon: 'reserve' },
  { re: /不良|Defective/i, icon: 'alert' },
  { re: /品牌|Brand/i, icon: 'shield' },
  { re: /行政|Admin|总务|Non-Manufacturing/i, icon: 'other' },
  { re: /机修|Maintenance/i, icon: 'wip' },
  { re: /裁床|Cutting/i, icon: 'finished' },
  { re: /货仓部|Warehouse Dept/i, icon: 'leftover' },
];

const STORE_TINTS = [
  { tint: 'var(--blue-50)', tone: 'var(--blue)' },
  { tint: 'var(--teal-50)', tone: '#1596a8' },
  { tint: 'var(--purple-50)', tone: '#7b5bd6' },
  { tint: 'var(--amber-50)', tone: '#c07a10' },
  { tint: 'var(--green-50)', tone: '#12855a' },
  { tint: '#eef2ff', tone: '#4f6ef7' },
  { tint: '#e9f7f5', tone: '#0f9384' },
  { tint: '#f5f0ff', tone: '#8b5cf6' },
];

export interface StoreStyle {
  icon: IconName;
  tint: string;
  tone: string;
}

export const storeStyle = (idx: number, warehouse: StockWarehouse): StoreStyle => {
  const haystack = `${warehouse.nameZh} ${warehouse.nameEn}`;
  const hit = STORE_ICON_RULES.find((rule: StoreIconRule) => rule.re.test(haystack));
  const tint = STORE_TINTS[idx % STORE_TINTS.length];
  return { icon: hit ? hit.icon : 'other', tint: tint.tint, tone: tint.tone };
};

export const storeLabel = (warehouse: StockWarehouse): { primary: string; secondary: string } => ({
  primary: warehouse.nameZh || warehouse.nameEn,
  secondary: warehouse.nameEn && warehouse.nameEn !== warehouse.nameZh ? warehouse.nameEn : '',
});
