import { num, usd } from '../../lib/format';

export interface RankRow {
  key: number;
  label: string;
  en?: string | null;
  value: number;
}

interface RankListProps {
  rows: RankRow[];
  picked: number;
  onPick: (key: number) => void;
  alt?: boolean;
}

const BADGES = ['top1', 'top2', 'top3'];

const RankList = ({ rows, picked, onPick, alt }: RankListProps) => {
  const max = rows.reduce((current: number, row: RankRow) => Math.max(current, row.value), 1);

  return (
    <div className="rank-list">
      {rows.map((row: RankRow, index: number) => {
        const on = picked === row.key;
        const badge = BADGES[index] ?? '';
        return (
          <button
            key={row.key}
            type="button"
            className={`rank-row${on ? ' on' : ''}`}
            onClick={() => onPick(on ? -1 : row.key)}
            aria-pressed={on}
            title={`${row.en || row.label} · ${usd(row.value)}`}
          >
            <span className={`rank-badge ${badge}`}>{index + 1}</span>
            <span className="rank-main">
              <span className="rank-name">
                {row.label}
                {row.en ? (
                  <em style={{ fontStyle: 'normal', color: 'var(--faint)' }}> · {row.en}</em>
                ) : null}
              </span>
              <span className="rank-track">
                <span
                  className={`rank-fill${alt ? ' alt' : ''}`}
                  style={{ width: `${Math.max((row.value / max) * 100, 1)}%` }}
                ></span>
              </span>
            </span>
            <span className="rank-val">{num(row.value)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RankList;
