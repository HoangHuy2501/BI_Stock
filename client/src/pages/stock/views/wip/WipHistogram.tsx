import type { StockWipSummary, WipWeekBucket } from '@shared/api.interface';

import { axisNum, num } from '../../lib/format';
import type { LightMeta } from '../../lib/lights';
import { LIGHT_META } from '../../lib/lights';

const TICKS: number[] = [0, 0.5, 1];
const LIGHT_SEGMENTS: number[] = [0, 1, 2, 3];

interface WipHistogramProps {
  summary: StockWipSummary;
  focusWeek: number | null;
  onPick: (value: number) => void;
}

const WipHistogram = ({ summary, focusWeek, onPick }: WipHistogramProps) => {
  const weeks: WipWeekBucket[] = summary.weeks;
  const peak: number = weeks.reduce((max: number, week: WipWeekBucket) => Math.max(max, week.usd), 0);
  const top: number = (peak || 1) * 1.3;

  return (
    <div className="wip-hist">
      <div className="hist-plot">
        {TICKS.map((tick: number) => (
          <div className="hist-rule" key={tick} style={{ bottom: `${tick * 100}%` }}>
            <span className="chart-tick">{tick === 0 ? 'USD' : `$${axisNum(top * tick)}`}</span>
          </div>
        ))}
        <div className="hist-bars">
          {weeks.map((week: WipWeekBucket, index: number) => (
            <button
              key={index}
              type="button"
              className={focusWeek === index ? 'hist-col is-on' : 'hist-col'}
              aria-pressed={focusWeek === index}
              onClick={() => onPick(index)}
              title={
                week.label +
                ' · ' +
                `$${num(week.usd)}` +
                ' · ' +
                `${num(week.lines)} lines · click to filter` +
                (index < 4 ? ' — the register only lists lots 29+ days' : '')
              }
            >
              <span className="hist-val">{week.usd > 0 ? `$${num(week.usd)}` : ''}</span>
              <div className="hist-bar" style={{ height: `${Math.max((week.usd / top) * 100, 0.4)}%` }}>
                {LIGHT_SEGMENTS.map((light: number) => {
                  const segment: number = week.byLight[light] ?? 0;
                  if (!segment || !week.usd) return null;
                  const segmentHeight: number = (segment / week.usd) * 100;
                  if (segmentHeight <= 0) return null;
                  return (
                    <div
                      key={light}
                      className="hist-seg"
                      style={{ height: `${segmentHeight}%`, background: LIGHT_META[light].color }}
                    />
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="hist-labels">
        {weeks.map((week: WipWeekBucket, index: number) => (
          <span key={index}>{week.label}</span>
        ))}
      </div>
      <div className="hist-key">
        {LIGHT_META.slice(0, 4).map((meta: LightMeta) => (
          <span key={meta.key} className="hist-key-item">
            <i style={{ background: meta.color }} />
            {meta.name} {meta.rule}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WipHistogram;
