import type { ReserveBuyer, ReserveDataset } from '@shared/api.interface';

import { num, pct, usd } from '../../lib/format';
import { reserveBandKeyOf } from '../../lib/reserve';
import type { ReserveFocus, ReservePick } from './focus';

interface ReserveByBuyerProps {
  dataset: ReserveDataset;
  focus: ReserveFocus;
  onPick: ReservePick;
}

const ReserveByBuyer = ({ dataset, focus, onPick }: ReserveByBuyerProps) => {
  const bandIndex = focus.band;
  const band = bandIndex !== null ? dataset.bands[bandIndex] : undefined;
  const rows: ReserveBuyer[] = bandIndex === null
    ? dataset.buyers
    : dataset.bandBuyers?.[bandIndex] ?? (() => {
        const byBuyer = new Map<string, { usd: number; lines: number }>();
        const selectedBandKey = reserveBandKeyOf(band?.labelEn ?? null);
        dataset.rows.forEach((line) => {
          if (reserveBandKeyOf(line.ageBand) !== selectedBandKey) return;
          const name = line.buyer?.trim() || '-';
          const totals = byBuyer.get(name) ?? { usd: 0, lines: 0 };
          totals.usd += line.usd;
          totals.lines += 1;
          byBuyer.set(name, totals);
        });
        return Array.from(byBuyer, ([name, totals], idx) => ({ idx, name, ...totals }))
          .sort((a, b) => b.usd - a.usd);
      })();
  const signalUsd = band ? band.usd : dataset.atRiskUsd;
  const total = signalUsd || 1;
  const max = rows.reduce((peak: number, row: ReserveBuyer): number => Math.max(peak, row.usd), 1);
  const scope = band ? band.labelEn : '6+ month';

  if (rows.length === 0) {
    return (
      <div className="empty">
        <h3>{band ? `Nothing in ${band.labelEn}` : 'Nothing past 6 months'}</h3>
        <p>{band ? 'No reserve lot sits in this age band.' : 'Every reserve lot is younger than six months.'}</p>
      </div>
    );
  }

  return (
    <div className="rank-list fill">
      {rows.map((row: ReserveBuyer) => {
        const on = focus.cust === row.name;
        return (
          <button
            type="button"
            className={`rank-row no-badge is-pick${on ? ' is-on' : ''}`}
            key={row.name}
            onClick={() => onPick('cust', row.name)}
            aria-pressed={on}
            title={
              band
                ? `Filter the register to ${row.name} stock in ${band.labelEn}`
                : `Filter the register to ${row.name} stock at or past 6 months`
            }
          >
            <span className="rank-main">
              <span className="rank-name">
                {row.name} <em>{num(row.lines)} lots · {pct(row.usd, total)}</em>
              </span>
              <span className="rank-track">
                <span className="rank-fill" style={{ width: `${(row.usd / max) * 100}%`, background: '#c0301f' }} />
              </span>
            </span>
            <span className="rank-val num">{usd(row.usd)}</span>
          </button>
        );
      })}
      <div className="rank-foot">
        <span>{rows.length} buyers holding {scope} stock</span>
        <span className="num">{usd(signalUsd)} total</span>
      </div>
    </div>
  );
};

export default ReserveByBuyer;
