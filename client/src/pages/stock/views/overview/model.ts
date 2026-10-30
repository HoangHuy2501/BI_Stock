import type { StockCubeCell, StockMeta } from '@shared/api.interface';

import type { BarItem } from '../../components/BarChart';
import { aggregate, buildMonthAxis, buildPivot } from '../../lib/model';
import type { AgedBucket, AggregateResult, MonthAxis, PivotStore, StockFilters } from '../../lib/model';
import type { RankRow } from './RankList';

export interface OverviewModel {
  scoped: AggregateResult;
  yearBars: BarItem[];
  catBars: BarItem[];
  storeRows: AgedBucket[];
  buyerRows: RankRow[];
  agedRows: RankRow[];
  pivotStores: PivotStore[];
  axis: MonthAxis;
  noYearUsd: number;
  noCatUsd: number;
}

export const buildOverviewModel = (
  cube: StockCubeCell[],
  meta: StockMeta,
  filters: StockFilters,
): OverviewModel => {
  const scoped = aggregate(cube, meta, filters);
  const noYear = aggregate(cube, meta, { ...filters, year: -1 });
  const noWh = aggregate(cube, meta, { ...filters, wh: -1 });
  const noCat = aggregate(cube, meta, { ...filters, cat: -1 });
  const noCust = aggregate(cube, meta, { ...filters, cust: -1 });
  const axis = buildMonthAxis(cube, meta);

  return {
    scoped,
    yearBars: noYear.byYear
      .filter((bucket) => bucket.usd > 0 || bucket.lines > 0)
      .map((bucket) => ({
        key: bucket.idx,
        label: bucket.year,
        en: null,
        value: bucket.usd,
        color: '#3ec6d2',
      })),
    catBars: noCat.byCat
      .filter((bucket) => bucket.usd > 0)
      .sort((a, b) => b.usd - a.usd)
      .map((bucket) => ({
        key: bucket.idx,
        label: meta.categories[bucket.idx]?.nameZh ?? '',
        en: meta.categories[bucket.idx]?.nameEn ?? null,
        value: bucket.usd,
      })),
    storeRows: noWh.byWh.filter((bucket) => bucket.usd > 0).sort((a, b) => b.usd - a.usd),
    buyerRows: noCust.byCust
      .filter((bucket) => bucket.usd > 0)
      .sort((a, b) => b.usd - a.usd)
      .map((bucket) => ({ key: bucket.idx, label: bucket.name, en: null, value: bucket.usd })),
    agedRows: noCat.byCat
      .filter((bucket) => bucket.aged > 0)
      .sort((a, b) => b.aged - a.aged)
      .map((bucket) => ({
        key: bucket.idx,
        label: meta.categories[bucket.idx]?.nameZh ?? '',
        en: meta.categories[bucket.idx]?.nameEn ?? null,
        value: bucket.aged,
      })),
    pivotStores: buildPivot(cube, meta, axis, {
      cust: filters.cust,
      cat: filters.cat,
      year: filters.year,
    }),
    axis,
    noYearUsd: noYear.usd,
    noCatUsd: noCat.usd,
  };
};

/* Adapt the SQL summaries for the existing UI. Never manufacture cube cells:
 * the API has no age buckets, line counts or cross-filtered summary totals. */
export const buildSummaryOverviewModel = (
  data: import('@shared/api.interface').StockSummaryResponse,
  filters: StockFilters,
  threshold: number,
) => {
  const value = (input: number | null | undefined): number | null =>
    typeof input === 'number' && Number.isFinite(input) ? input : null;
  const name = (input: string | number | null | undefined): string =>
    input == null ? '—' : String(input);
  const annual = data.annualSummary?.items ?? [];
  const categories = data.categorySummary?.items ?? [];
  const warehouses = data.warehouseSummary?.items ?? [];
  const customers = data.buyerRank?.items ?? [];
  const aged = data.agedRank?.items ?? [];
  const ledgerItems = data.monthWarehouseLedger ?? data.monthWarehouseLedge;
  const ledger = ledgerItems ?? [];

  // Match names, not ROW_NUMBER IDs: AgedRank uses a separate numbering scope.
  const warehouseNames = [...new Set([...warehouses.map(x => name(x.nameZh)), ...ledger.map(x => name(x.warehouseName))])];
  const categoryNames = [...new Set([...categories.map(x => name(x.nameZh)), ...aged.map(x => name(x.nameZh)), ...ledger.map(x => name(x.categoryName))])];
  const customerNames = [...new Set([...customers.map(x => name(x.name)), ...ledger.map(x => name(x.customerName))])];
  const years = [...new Set([...annual.map(x => name(x.year)), ...ledger.filter(x => x.month != null).map(x => x.month.slice(0, 4))])];
  const months = [...new Set(ledger.map(x => name(x.month)))].sort();
  const whIndex = new Map(warehouseNames.map((label, idx) => [label, idx]));
  const catIndex = new Map(categoryNames.map((label, idx) => [label, idx]));
  const custIndex = new Map(customerNames.map((label, idx) => [label, idx]));
  const monthIndex = new Map(months.map((label, idx) => [label, idx]));
  const meta: import('@shared/api.interface').OverviewMeta = {
    warehouses: warehouseNames.map((label, idx) => ({
      idx, rawName: label, nameZh: label,
      nameEn: warehouses.find(x => name(x.nameZh) === label)?.nameEn ?? '',
      totalUsd: value(warehouses.find(x => name(x.nameZh) === label)?.usd),
    })),
    categories: categoryNames.map((label, idx) => ({
      idx, nameZh: label, nameEn: categories.find(x => name(x.nameZh) === label)?.nameEn ?? '',
    })),
    customers: customerNames,
    years,
  };
  const axis: MonthAxis = {
    labels: months,
    positions: months.map((_, idx) => idx),
    positionOf: Object.fromEntries(months.map((_, idx) => [idx, idx])),
  };

  const stores = new Map<number, PivotStore>();
  const add = (a: number | null, b: number | null): number | null =>
    a == null || b == null ? null : a + b;
  for (const item of ledger) {
    const wh = whIndex.get(name(item.warehouseName))!;
    const cat = catIndex.get(name(item.categoryName))!;
    const cust = custIndex.get(name(item.customerName))!;
    const year = item.month == null ? years.indexOf('—') : years.indexOf(item.month.slice(0, 4));
    // These are the same dimensions consumed by the original buildPivot.
    if (filters.cat >= 0 && cat !== filters.cat) continue;
    if (filters.cust >= 0 && cust !== filters.cust) continue;
    if (filters.year >= 0 && year !== filters.year) continue;
    let store = stores.get(wh);
    if (!store) {
      store = { idx: wh, qty: 0, usd: 0, cats: [] };
      stores.set(wh, store);
    }
    let category = store.cats.find(x => x.idx === cat);
    if (!category) {
      category = { idx: cat, qty: 0, usd: 0, buyers: [] };
      store.cats.push(category);
    }
    let buyer = category.buyers.find(x => x.idx === cust);
    if (!buyer) {
      buyer = { idx: cust, qty: 0, usd: 0, cells: months.map(() => ({ qty: 0, usd: 0 })) };
      category.buyers.push(buyer);
    }
    const cell = buyer.cells[monthIndex.get(name(item.month))!];
    const qty = value(item.qty);
    const usd = value(item.usd);
    cell.qty = add(cell.qty, qty);
    cell.usd = add(cell.usd, usd);
    for (const bucket of [buyer, category, store]) {
      bucket.qty = add(bucket.qty, qty);
      bucket.usd = add(bucket.usd, usd);
    }
  }
  const exceptYear = [filters.cust, filters.wh, filters.cat, filters.age].some(x => x >= 0);
  const exceptCat = [filters.cust, filters.wh, filters.age, filters.year].some(x => x >= 0);
  const exceptWh = [filters.cust, filters.cat, filters.age, filters.year].some(x => x >= 0);
  const exceptCust = [filters.wh, filters.cat, filters.age, filters.year].some(x => x >= 0);
  const totalUsd = value(data.annualSummary?.totalUsd);
  // A single selected dimension has a total supplied directly by the API.
  // Intersections of dimensions are not supplied and remain null.
  const suppliedTotal = (omit?: keyof StockFilters): number | null => {
    const active = (['cust', 'wh', 'cat', 'age', 'year'] as const)
      .filter(key => key !== omit && filters[key] >= 0);
    if (active.length === 0) return totalUsd;
    if (active.length !== 1) return null;
    switch (active[0]) {
      case 'year': return value(annual.find(x => name(x.year) === years[filters.year])?.usd);
      case 'cat': return value(categories.find(x => name(x.nameZh) === categoryNames[filters.cat])?.usd);
      case 'wh': return value(warehouses.find(x => name(x.nameZh) === warehouseNames[filters.wh])?.usd);
      case 'cust': return value(customers.find(x => name(x.name) === customerNames[filters.cust])?.usd);
      default: return null;
    }
  };
  return {
    meta,
    totalUsd,
    scoped: { usd: suppliedTotal(), lines: null },
    noYearUsd: suppliedTotal('year'),
    noCatUsd: exceptCat ? suppliedTotal('cat') : value(data.categorySummary?.totalUsd),
    yearBars: annual.map(x => ({ key: years.indexOf(name(x.year)), label: name(x.year), en: null, value: exceptYear ? null : value(x.usd), color: '#3ec6d2' })),
    catBars: categories.map(x => ({ key: catIndex.get(name(x.nameZh))!, label: name(x.nameZh), en: x.nameEn ?? null, value: exceptCat ? null : value(x.usd) })).sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    storeRows: warehouses.map(x => ({ idx: whIndex.get(name(x.nameZh))!, usd: exceptWh ? null : value(x.usd), qty: null, lines: null, aged: null })).sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0)),
    buyerRows: customers.map(x => ({ key: custIndex.get(name(x.name))!, label: name(x.name), en: null, value: exceptCust ? null : value(x.usd) })).sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    agedRows: aged.map(x => ({ key: catIndex.get(name(x.nameZh))!, label: name(x.nameZh), en: x.nameEn ?? null, value: exceptCat || threshold !== data.agedRank?.thresholdDays ? null : value(x.agedUsd) })).sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    pivotStores: [...stores.values()].sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0)),
    axis,
    ledgerAvailable: ledgerItems != null,
  };
};
