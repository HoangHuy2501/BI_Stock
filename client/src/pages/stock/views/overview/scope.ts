export interface OverviewScope {
  cust: number;
  wh: number;
  cat: number;
  age: number;
  year: number;
}

export type ScopeDimension = keyof OverviewScope;

export const SCOPE_DIMENSIONS: ScopeDimension[] = ['cust', 'wh', 'cat', 'age', 'year'];

export const hasScope = (scope: OverviewScope): boolean =>
  SCOPE_DIMENSIONS.some((dimension: ScopeDimension) => scope[dimension] >= 0);
