import type { StockWipSummary } from '@shared/api.interface';

import { num, pct, usd } from '../../lib/format';

interface BuyerRow {
  idx: number;
  name: string;
  usd: number;
  lines: number;
}

interface RedByBuyerProps {
  summary: StockWipSummary;
  customers: string[];
  focusCust: number | null;
  onPick: (value: number) => void;
}

const RED_LIGHT = 3;

const RedByBuyer = ({ summary, customers, focusCust, onPick }: RedByBuyerProps) => {
  const rows: BuyerRow[] = customers
    .map((name: string, idx: number) => {
      const hit: number[] | undefined = summary.custLight.find(
        (entry: number[]) => entry[0] === idx && entry[1] === RED_LIGHT,
      );
      return { idx, name, usd: hit ? hit[2] ?? 0 : 0, lines: hit ? hit[3] ?? 0 : 0 };
    })
    .filter((row: BuyerRow) => row.usd > 0)
    .sort((a: BuyerRow, b: BuyerRow) => b.usd - a.usd);

  const max: number = rows.reduce((peak: number, row: BuyerRow) => Math.max(peak, row.usd), 1) || 1;

  return (
    <div className="rank-list fill">
      {rows.length === 0 ? <p className="reg-coverage">No buyer carries red lots.</p> : null}
      {rows.map((row: BuyerRow) => (
        <button
          key={row.idx}
          type="button"
          className={'rank-row no-badge is-pick' + (focusCust === row.idx ? ' is-on' : '')}
          aria-pressed={focusCust === row.idx}
          onClick={() => onPick(row.idx)}
          title={'Filter the register to ' + row.name + ' red lots'}
        >
          <span className="rank-main">
            <span className="rank-name">
              {row.name}{' '}
              <em>
                {num(row.lines)} lots · {pct(row.usd, summary.redUsd)}
              </em>
            </span>
            <span className="rank-track">
              <span className="rank-fill" style={{ width: `${(row.usd / max) * 100}%`, background: '#c0301f' }} />
            </span>
          </span>
          <span className="rank-val num">{usd(row.usd)}</span>
        </button>
      ))}
      <div className="rank-foot">
        <span>{rows.length} buyers with red lots</span>
        <span className="num">{usd(summary.redUsd)} total</span>
      </div>
    </div>
  );
};

export default RedByBuyer;
