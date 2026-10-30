import type { CSSProperties } from 'react';

import type { ReserveDataset } from '@shared/api.interface';

import { num, pct, usd } from '../../lib/format';
import { RESERVE_BANDS, type ReserveBandStyle } from '../../lib/reserve';
import type { ReserveFocus, ReservePick } from './focus';

interface BandVars extends CSSProperties {
  '--light': string;
  '--tint': string;
}

const bandVars = (band: ReserveBandStyle): BandVars => ({ '--light': band.ink, '--tint': band.tint });

interface ReserveSignalsProps {
  dataset: ReserveDataset;
  focus: ReserveFocus;
  onPick: ReservePick;
}

const ReserveSignals = ({ dataset, focus, onPick }: ReserveSignalsProps) => {
  const total = dataset.usd || 1;
  return (
    <div className="light-grid">
      {dataset.bands.map((band, index: number) => {
        const style = RESERVE_BANDS[index] ?? RESERVE_BANDS[0];
        const on = focus.band === index;
        return (
          <button
            type="button"
            className={on ? 'light-tile is-on' : 'light-tile'}
            key={band.key}
            style={bandVars(style)}
            onClick={() => onPick('band', index)}
            aria-pressed={on}
            title={`Filter the register to ${style.label} · ${style.zh}`}
          >
            <span className="light-rule">
              {style.zh} <span style={{ color: 'var(--faint)' }}>{style.label}</span>
            </span>
            <span className="light-val num">{usd(band.usd)}</span>
            <span className="light-foot">
              <span>{pct(band.usd, total)} of reserve</span>
              <span>{num(band.lines)} lots</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ReserveSignals;
