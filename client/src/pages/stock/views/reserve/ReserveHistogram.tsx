import type { ReserveDataset, ReserveHistBar } from '@shared/api.interface';

import { axisNum, num, usd } from '../../lib/format';
import { RESERVE_BANDS } from '../../lib/reserve';
import type { ReserveFocus, ReservePick } from './focus';

const RULE_STEPS = [0, 0.5, 1];

interface ReserveHistogramProps {
  dataset: ReserveDataset;
  focus: ReserveFocus;
  onPick: ReservePick;
}

const ReserveHistogram = ({ dataset, focus, onPick }: ReserveHistogramProps) => {
  const bars = dataset.hist;
  const max = bars.reduce((peak: number, bar: ReserveHistBar): number => Math.max(peak, bar.usd), 1);
  const top = max * 1.3;

  return (
    <div className="wip-hist">
      <div className="hist-plot">
        {RULE_STEPS.map((step: number) => (
          <div className="hist-rule" key={step} style={{ bottom: `${step * 100}%` }}>
            <span className="chart-tick">{step === 0 ? 'USD' : `$${axisNum(top * step)}`}</span>
          </div>
        ))}
        <div className="hist-bars">
          {bars.map((bar: ReserveHistBar, index: number) => {
            const style = RESERVE_BANDS[bar.bandIndex] ?? RESERVE_BANDS[0];
            const height = Math.max((bar.usd / top) * 100, 0.6);
            const on = focus.bin === index;
            return (
              <button
                type="button"
                className={on ? 'hist-col is-on' : 'hist-col'}
                key={bar.label}
                onClick={() => onPick('bin', index)}
                aria-pressed={on}
                title={`${bar.label} · ${usd(bar.usd)} · ${num(bar.lines)} lots · ${style.label} · click to filter`}
              >
                <span className="hist-val">{bar.usd > 0 ? `$${num(bar.usd)}` : ''}</span>
                <div className="hist-bar" style={{ height: `${height}%` }}>
                  <div className="hist-seg" style={{ height: '100%', background: style.color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="hist-labels">
        {bars.map((bar: ReserveHistBar) => (
          <span key={bar.label}>{bar.label}</span>
        ))}
      </div>
      <div className="hist-key">
        {RESERVE_BANDS.map((band) => (
          <span key={band.key} className="hist-key-item">
            <i style={{ background: band.color }} />
            {band.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ReserveHistogram;
