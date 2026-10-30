import { STOCK_AGE_LABELS } from '@shared/api.interface';
import type { StockCubeCell, StockMeta } from '@shared/api.interface';

export const AGE_RANGES: string[] = [...STOCK_AGE_LABELS];
export const AGE_SHORT: string[] = STOCK_AGE_LABELS.map((label: string) => `${label} d`);
export const AGE_COLORS: string[] = ['#4fb8c9', '#63c3a0', '#9cc97a', '#e0b45c', '#e08a52', '#d95f4b'];
export const AGE_BOUNDS: number[][] = [
  [0, 30],
  [31, 60],
  [61, 90],
  [91, 180],
  [181, 365],
  [366, 100000],
];

export interface StockFilters {
  cust: number;
  wh: number;
  cat: number;
  age: number;
  year: number;
  agedFrom: number;
}

export interface Bucket {
  idx: number;
  usd: number;
  qty: number;
  lines: number;
}

export interface NamedBucket extends Bucket {
  name: string;
  aged: number;
}

export interface AgedBucket extends Bucket {
  aged: number;
}

export interface YearBucket extends Bucket {
  year: string;
}

export interface AggregateResult {
  usd: number;
  qty: number;
  lines: number;
  agedUsd: number;
  agedLines: number;
  byAge: Bucket[];
  byYear: YearBucket[];
  byWh: AgedBucket[];
  byCat: AgedBucket[];
  byCust: NamedBucket[];
}

export const aggregate = (cube: StockCubeCell[], meta: StockMeta, filters: StockFilters): AggregateResult => {
  const byWh: AgedBucket[] = meta.warehouses.map((_item, index: number) => ({
    idx: index, usd: 0, qty: 0, lines: 0, aged: 0,
  }));
  const byCat: AgedBucket[] = meta.categories.map((_item, index: number) => ({
    idx: index, usd: 0, qty: 0, lines: 0, aged: 0,
  }));
  const byCust: NamedBucket[] = meta.customers.map((name: string, index: number) => ({
    idx: index, name, usd: 0, qty: 0, lines: 0, aged: 0,
  }));
  const byAge: Bucket[] = AGE_BOUNDS.map((_bounds: number[], index: number) => ({
    idx: index, usd: 0, qty: 0, lines: 0,
  }));
  const byYear: YearBucket[] = meta.years.map((year: string, index: number) => ({
    idx: index, year, usd: 0, qty: 0, lines: 0,
  }));

  let usdTotal = 0;
  let qtyTotal = 0;
  let linesTotal = 0;
  let agedUsd = 0;
  let agedLines = 0;

  cube.forEach((cell: StockCubeCell) => {
    if (filters.cust >= 0 && cell.customerIdx !== filters.cust) return;
    if (filters.wh >= 0 && cell.warehouseIdx !== filters.wh) return;
    if (filters.cat >= 0 && cell.categoryIdx !== filters.cat) return;
    if (filters.age >= 0 && cell.ageIdx !== filters.age) return;
    if (filters.year >= 0 && cell.yearIdx !== filters.year) return;

    const aged = cell.ageIdx >= filters.agedFrom;
    usdTotal += cell.usd;
    qtyTotal += cell.qty;
    linesTotal += cell.lines;
    if (aged) {
      agedUsd += cell.usd;
      agedLines += cell.lines;
    }

    const warehouse = byWh[cell.warehouseIdx];
    if (warehouse) {
      warehouse.usd += cell.usd;
      warehouse.qty += cell.qty;
      warehouse.lines += cell.lines;
      if (aged) warehouse.aged += cell.usd;
    }

    const category = byCat[cell.categoryIdx];
    if (category) {
      category.usd += cell.usd;
      category.qty += cell.qty;
      category.lines += cell.lines;
      if (aged) category.aged += cell.usd;
    }

    const customer = byCust[cell.customerIdx];
    if (customer) {
      customer.usd += cell.usd;
      customer.qty += cell.qty;
      customer.lines += cell.lines;
      if (aged) customer.aged += cell.usd;
    }

    const age = byAge[cell.ageIdx];
    if (age) {
      age.usd += cell.usd;
      age.qty += cell.qty;
      age.lines += cell.lines;
    }

    const year = byYear[cell.yearIdx];
    if (year) {
      year.usd += cell.usd;
      year.qty += cell.qty;
      year.lines += cell.lines;
    }
  });

  return { usd: usdTotal, qty: qtyTotal, lines: linesTotal, agedUsd, agedLines, byAge, byYear, byWh, byCat, byCust };
};

export interface PivotCell {
  qty: number;
  usd: number;
}

export interface PivotBuyer {
  idx: number;
  qty: number;
  usd: number;
  cells: PivotCell[];
}

export interface PivotCategory {
  idx: number;
  qty: number;
  usd: number;
  buyers: PivotBuyer[];
}

export interface PivotStore {
  idx: number;
  qty: number;
  usd: number;
  cats: PivotCategory[];
}

export interface MonthAxis {
  positions: number[];
  labels: string[];
  positionOf: Record<number, number>;
}

export const buildMonthAxis = (cube: StockCubeCell[], meta: StockMeta): MonthAxis => {
  const totals: Record<number, number> = {};
  cube.forEach((cell: StockCubeCell) => {
    if (cell.monthIdx < 0) return;
    totals[cell.monthIdx] = (totals[cell.monthIdx] ?? 0) + cell.usd + cell.qty;
  });
  const positions: number[] = Object.keys(totals)
    .map((key: string) => Number(key))
    .filter((idx: number) => totals[idx] > 0)
    .sort((a: number, b: number) => a - b);
  const positionOf: Record<number, number> = {};
  positions.forEach((monthIdx: number, pos: number) => {
    positionOf[monthIdx] = pos;
  });
  return {
    positions,
    labels: positions.map((monthIdx: number) => meta.months[monthIdx] ?? ''),
    positionOf,
  };
};

export const buildPivot = (
  cube: StockCubeCell[],
  meta: StockMeta,
  axis: MonthAxis,
  filters: { cust: number; cat: number; year: number },
): PivotStore[] => {
  const emptyCells = (): PivotCell[] => axis.positions.map(() => ({ qty: 0, usd: 0 }));
  const stores: PivotStore[] = meta.warehouses.map((_item, index: number) => ({
    idx: index,
    qty: 0,
    usd: 0,
    cats: meta.categories.map((_cat, catIndex: number) => ({
      idx: catIndex,
      qty: 0,
      usd: 0,
      buyers: meta.customers.map((_name, custIndex: number) => ({
        idx: custIndex, qty: 0, usd: 0, cells: emptyCells(),
      })),
    })),
  }));

  cube.forEach((cell: StockCubeCell) => {
    if (filters.cust >= 0 && cell.customerIdx !== filters.cust) return;
    if (filters.cat >= 0 && cell.categoryIdx !== filters.cat) return;
    if (filters.year >= 0 && cell.yearIdx !== filters.year) return;
    const pos = axis.positionOf[cell.monthIdx];
    if (pos === undefined) return;
    const store = stores[cell.warehouseIdx];
    const category = store?.cats[cell.categoryIdx];
    const buyer = category?.buyers[cell.customerIdx];
    if (!buyer) return;

    const pivotCell = buyer.cells[pos];
    pivotCell.qty += cell.qty;
    pivotCell.usd += cell.usd;
    buyer.qty += cell.qty;
    buyer.usd += cell.usd;
    category.qty += cell.qty;
    category.usd += cell.usd;
    store.qty += cell.qty;
    store.usd += cell.usd;
  });

  return stores
    .filter((store: PivotStore) => store.usd > 0)
    .map((store: PivotStore) => ({
      idx: store.idx,
      qty: store.qty,
      usd: store.usd,
      cats: store.cats
        .filter((category: PivotCategory) => category.usd > 0 || category.qty > 0)
        .map((category: PivotCategory) => ({
          idx: category.idx,
          qty: category.qty,
          usd: category.usd,
          buyers: category.buyers.filter((buyer: PivotBuyer) => buyer.usd > 0 || buyer.qty > 0),
        }))
        .filter((category: PivotCategory) => category.buyers.length > 0),
    }))
    .filter((store: PivotStore) => store.cats.length > 0)
    .sort((a: PivotStore, b: PivotStore) => b.usd - a.usd);
};

export const agedFromThreshold = (threshold: number): number => {
  if (threshold >= 180) return 4;
  if (threshold >= 90) return 3;
  return 2;
};
