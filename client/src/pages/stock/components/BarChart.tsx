import { axisNum, num, pct, usd } from '../lib/format';

export interface BarItem {
  key: number;
  label: string;
  en?: string | null;
  value: number | null;
  color?: string;
}

interface BarChartProps {
  items: BarItem[];
  picked: number;
  onPick: (key: number) => void;
  muted: number | null;
}

const TICKS = [0, 0.25, 0.5, 0.75, 1];

const BarChart = ({ items, picked, onPick, muted }: BarChartProps) => {
  const max = items.reduce((current: number, item: BarItem) => Math.max(current, item.value ?? 0), 1);
  const top = max * 1.2;

  return (
    <div>
      <div className="chart">
        <div className="chart-plot">
          {TICKS.map((tick: number, index: number) => (
            <div
              key={index}
              className={tick === 0 ? 'chart-rule base' : 'chart-rule'}
              style={{ bottom: `${tick * 100}%` }}
            >
              <span className="chart-tick">{axisNum(top * tick)}</span>
            </div>
          ))}
          <div className="chart-bars">
            {items.length === 0 ? <span className="bar-val">—</span> : null}
            {items.map((item: BarItem) => {
              const height = item.value == null ? 0 : Math.max((item.value / top) * 100, 0.4);
              const on = picked === item.key;
              const dim = picked >= 0 && !on;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`bar-col${on ? ' on' : ''}${dim ? ' dim' : ''}`}
                  style={{ ['--h' as string]: `${height}%` }}
                  onClick={() => onPick(on ? -1 : item.key)}
                  aria-pressed={on}
                  title={`${item.en || item.label} · ${usd(item.value)} · ${pct(item.value, muted)}`}
                >
                  <span className="bar-val">{num(item.value)}</span>
                  <span className="bar" style={{ height: `${height}%`, background: item.color || 'var(--blue)' }}></span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="chart-labels">
          {items.map((item: BarItem) => (
            <span className="chart-label" key={item.key}>
              {item.label}
              {item.en ? <em>{item.en}</em> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
