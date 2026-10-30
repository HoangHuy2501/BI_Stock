export type WipSort = 'days' | 'value';

export type WipFocusDim = 'light' | 'week' | 'cust' | 'cause';

export interface WipFocus {
  light: number | null;
  week: number | null;
  cust: number | null;
  cause: string | null;
}

export interface WipChip {
  key: WipFocusDim;
  dimLabel: string;
  label: string;
  value: number | string;
}

export interface LotTag {
  cause: string | null;
  blueFlag: boolean;
}

export type LotTagMap = Record<string, LotTag>;

export type WipTagPatch = Partial<Pick<LotTag, 'cause' | 'blueFlag'>>;
