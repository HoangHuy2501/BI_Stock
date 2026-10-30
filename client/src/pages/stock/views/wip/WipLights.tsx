import type { StockWipSummary, WipLotItem, WipLightBucket } from '@shared/api.interface';

import { pct, usd } from '../../lib/format';
import type { LightMeta } from '../../lib/lights';
import { LIGHT_META } from '../../lib/lights';
import { isBlueLot, tagFor } from './state';
import { lightVars } from './styles';
import type { LotTagMap } from './types';

interface WipLightsProps {
  summary: StockWipSummary;
  lots: WipLotItem[];
  tags: LotTagMap;
  focusLight: number | null;
  onPick: (value: number) => void;
}

const WipLights = ({ summary, lots, tags, focusLight, onPick }: WipLightsProps) => {
  const blueLots: WipLotItem[] = lots.filter((lot: WipLotItem) => isBlueLot(tagFor(tags, lot.id)));
  const blueUsd: number = blueLots.reduce((sum: number, lot: WipLotItem) => sum + lot.usd, 0);
  const total: number = summary.usd || 1;
  const redUsd: number = summary.lights[3] ? summary.lights[3].usd : 0;

  return (
    <div className="light-grid">
      {LIGHT_META.map((meta: LightMeta, index: number) => {
        const bucket: WipLightBucket = summary.lights[index] ?? { usd: 0, qty: 0, lines: 0 };
        const value: number = index < 4 ? bucket.usd : blueUsd;

        return (
          <button
            key={meta.key}
            type="button"
            className={focusLight === index ? 'light-tile is-on' : 'light-tile'}
            style={lightVars(meta.color, meta.tint)}
            aria-pressed={focusLight === index}
            onClick={() => onPick(index)}
            title={
              'Filter the register to ' +
              meta.name +
              ' · ' +
              meta.rule +
              (index < 3 ? ' — the register only lists lots 29+ days' : '')
            }
          >
            <span className="light-rule">{meta.rule}</span>
            <span className="light-val num">{usd(value)}</span>
            <span className="light-foot">
              <span>{index < 4 ? `${pct(value, total)} of WIP` : `${pct(blueUsd, redUsd)} of red`}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WipLights;
