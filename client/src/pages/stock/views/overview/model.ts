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
