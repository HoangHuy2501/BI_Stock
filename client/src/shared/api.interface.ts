/* Shared contracts for the stock analysis API and its source proxy client. */

export const STOCK_AGE_BOUNDS = [
  [0, 30],
  [31, 60],
  [61, 90],
  [91, 180],
  [181, 365],
  [366, 100000],
] as const;

export const STOCK_AGE_LABELS = ['0–30', '31–60', '61–90', '91–180', '181–365', '365+'];

export const STOCK_CACHE_KEYS = ['reserve', 'wip'] as const;
export type StockCacheKey = (typeof STOCK_CACHE_KEYS)[number];
export const isStockCacheKey = (value: string): value is StockCacheKey =>
  (STOCK_CACHE_KEYS as readonly string[]).includes(value);
export const STOCK_CACHE_LABELS: Record<StockCacheKey, string> = {
  reserve: 'Reserve dataset',
  wip: 'WIP dataset',
};

export const STOCK_DETAIL_SORTS = ['usd', 'age', 'qty'] as const;
export type StockDetailSort = (typeof STOCK_DETAIL_SORTS)[number];
export const isStockDetailSort = (value: string): value is StockDetailSort =>
  (STOCK_DETAIL_SORTS as readonly string[]).includes(value);

export type StockSortDirection = 'asc' | 'desc';

export const WIP_CAUSE_KEYS = ['bom', 'over', 'scrap', 'quality', 'delay'] as const;
export type WipCause = (typeof WIP_CAUSE_KEYS)[number];
export const isWipCause = (value: string): value is WipCause =>
  (WIP_CAUSE_KEYS as readonly string[]).includes(value);
export const WIP_CAUSE_LABELS: Record<WipCause, string> = {
  bom: 'BOM / spec error',
  over: 'Over-ordered material',
  scrap: 'Cutting scrap / offcut',
  quality: 'Material / quality defect',
  delay: 'Order delayed by buyer',
};

export const RESERVE_BAND_DEFS = [
  { key: 'lt3', labelZh: '3个月内', labelEn: '< 3 months', fromMonth: 0, toMonth: 3 },
  { key: 'm3', labelZh: '3至6个月', labelEn: '3–6 months', fromMonth: 3, toMonth: 6 },
  { key: 'm6', labelZh: '6至9个月', labelEn: '6–9 months', fromMonth: 6, toMonth: 9 },
  { key: 'm9', labelZh: '9至12个月', labelEn: '9–12 months', fromMonth: 9, toMonth: 12 },
  { key: 'gte12', labelZh: '12个月以上', labelEn: '≥ 12 months', fromMonth: 12, toMonth: 999 },
] as const;

export const RESERVE_BIN_DEFS = [
  { label: '0–1 mo', fromMonth: 0, toMonth: 1 },
  { label: '1–2 mo', fromMonth: 1, toMonth: 2 },
  { label: '2–3 mo', fromMonth: 2, toMonth: 3 },
  { label: '3–6 mo', fromMonth: 3, toMonth: 6 },
  { label: '6–9 mo', fromMonth: 6, toMonth: 9 },
  { label: '9–12 mo', fromMonth: 9, toMonth: 12 },
  { label: '12+ mo', fromMonth: 12, toMonth: 999 },
] as const;

export const reserveBandIndex = (months: number): number => {
  const value = Math.max(0, months);
  for (let index = 0; index < RESERVE_BAND_DEFS.length; index += 1) {
    const band = RESERVE_BAND_DEFS[index];
    if (value >= band.fromMonth && value < band.toMonth) return index;
  }
  return RESERVE_BAND_DEFS.length - 1;
};

export interface StockWarehouse {
  idx: number;
  nameZh: string;
  nameEn: string;
  rawName: string;
  totalUsd: number;
}

export interface StockCategory {
  idx: number;
  nameZh: string;
  nameEn: string;
}

export interface StockCubeCell {
  customerIdx: number;
  warehouseIdx: number;
  categoryIdx: number;
  ageIdx: number;
  yearIdx: number;
  monthIdx: number;
  qty: number;
  usd: number;
  lines: number;
}

export interface WipLightBucket {
  usd: number;
  qty: number;
  lines: number;
}

export interface WipWeekBucket {
  label: string;
  usd: number;
  lines: number;
  byLight: number[];
}

export interface StockWipSummary {
  storeIdx: number;
  usd: number;
  qty: number;
  lines: number;
  oldest: number;
  redUsd: number;
  redLines: number;
  registerUsd: number;
  registerLines: number;
  lights: WipLightBucket[];
  weeks: WipWeekBucket[];
  catLight: number[][];
  custLight: number[][];
}

export interface StockMeta {
  snapshotDate: string;
  lineCount: number;
  skuCount: number;
  totalUsd: number;
  totalQty: number;
  detailCount: number;
  detailUsd: number;
  spanFrom: string;
  spanTo: string;
  months: string[];
  years: string[];
  ages: string[];
  warehouses: StockWarehouse[];
  categories: StockCategory[];
  customers: string[];
}

export interface ReserveBand {
  key: string;
  labelZh: string;
  labelEn: string;
  fromMonth: number;
  toMonth: number;
  usd: number;
  qty: number;
  lines: number;
}

export interface ReserveSummary {
  warehouseIdx: number;
  nameZh: string;
  nameEn: string;
  usd: number;
  qty: number;
  lines: number;
  atRiskUsd: number;
  atRiskLines: number;
  oldestMonths: number;
  oldestLines: number;
  oldestBandIndex: number;
  bands: ReserveBand[];
}

export interface StockOverviewResponse {
  meta: StockMeta;
  cube: StockCubeCell[];
  wipSummary: StockWipSummary;
  reserveSummary: ReserveSummary;
}

export interface StockDetailLine {
  id: string;
  goodsNo: string;
  itemName: string;
  categoryIdx: number;
  categoryZh: string;
  categoryEn: string;
  customerIdx: number;
  customerName: string;
  warehouseIdx: number;
  warehouseZh: string;
  warehouseEn: string;
  qty: number;
  unit: string;
  usd: number;
  ageDays: number;
  batchNo: string;
  lotDate: string | null;
  reasonWh: string;
  reasonDl: string;
}

export interface StockDetailResponse {
  items: StockDetailLine[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WipLotItem {
  id: string;
  goodsNo: string;
  itemName: string;
  customerIdx: number;
  customerName: string;
  qty: number;
  unit: string;
  usd: number;
  days: number;
  batchNo: string;
  lotDate: string;
  cause: string | null;
  blueFlag: boolean;
}

export interface WipDataset {
  summary: StockWipSummary;
  customers: string[];
  lots: WipLotItem[];
}

export interface ReserveHistBar {
  label: string;
  fromMonth: number;
  toMonth: number;
  bandIndex: number;
  usd: number;
  lines: number;
}

export interface ReserveBuyer {
  idx: number;
  name: string;
  usd: number;
  lines: number;
}

export interface ReserveDataset {
  warehouseIdx: number;
  nameZh: string;
  nameEn: string;
  usd: number;
  qty: number;
  lines: number;
  itemisedUsd: number;
  bands: ReserveBand[];
  hist: ReserveHistBar[];
  atRiskUsd: number;
  atRiskLines: number;
  oldestMonths: number;
  oldestLines: number;
  oldestBandIndex: number;
  buyers: ReserveBuyer[];
  bandBuyers: ReserveBuyer[][];
  rows: StockDetailLine[];
}

export type StockCacheOrigin = 'upstream' | 'snapshot';

export interface StockCacheMeta {
  key: StockCacheKey;
  label: string;
  origin: StockCacheOrigin;
  hit: boolean;
  fetchedAt: string;
  expiresAt: string;
  ageSeconds: number;
  ttlSeconds: number;
  stale: boolean;
  itemCount: number;
  buildMs: number;
  upstreamError: string | null;
}

export interface WipDatasetResponse {
  data: WipDataset;
  cache: StockCacheMeta;
}

export interface ReserveDatasetResponse {
  data: ReserveDataset;
  cache: StockCacheMeta;
}

export interface WipTagUpdateRequest {
  cause: string | null;
  blueFlag: boolean;
}

export interface WipTag {
  lotId: string;
  cause: string | null;
  blueFlag: boolean;
}

export interface StockSourceEndpoint {
  name: string;
  method: 'GET';
  path: string;
  description: string;
}

export interface StockSourceCall {
  id: string;
  endpoint: string;
  method: string;
  outcome: 'ok' | 'error' | 'skipped';
  httpStatus: number | null;
  durationMs: number;
  message: string;
  calledAt: string;
}

export interface StockSourceStatusResponse {
  configured: boolean;
  baseUrl: string | null;
  tokenMasked: string | null;
  cacheTtlSeconds: number;
  timeoutMs: number;
  endpoints: StockSourceEndpoint[];
  cache: StockCacheMeta[];
  recentCalls: StockSourceCall[];
  envVars: {
    baseUrl: string;
    token: string;
    cacheTtl: string;
    timeout: string;
  };
}

export interface StockCacheRefreshResponse {
  refreshed: StockCacheMeta[];
  failures: { key: StockCacheKey; message: string }[];
}
