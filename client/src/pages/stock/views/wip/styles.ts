import type { CSSProperties } from 'react';

export interface VarsStyle extends CSSProperties {
  '--light': string;
  '--tint'?: string;
}

export const lightVars = (color: string, tint: string): VarsStyle => ({
  '--light': color,
  '--tint': tint,
});

export const dayPillVars = (color: string, tint: string): VarsStyle => ({
  '--light': color,
  background: tint,
  color,
});
