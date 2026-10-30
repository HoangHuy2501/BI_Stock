import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ReserveSummary, OverviewMeta, StockWipSummary } from '@shared/api.interface';

import Icon from '../../components/Icon';
import { num, pct, usd } from '../../lib/format';
import type { AgedBucket } from '../../lib/model';
import { RESERVE_BANDS } from '../../lib/reserve';
import { storeLabel, storeStyle } from '../../lib/store';

const ROWS_PER_PAGE = 3;

interface StoreKpisProps {
  rows: AgedBucket[];
  meta: OverviewMeta;
  whSel: number;
  onWh: (value: number) => void;
  wip: StockWipSummary | null;
  reserve: ReserveSummary | null;
}

interface TileFlag {
  cls: string;
  text: string;
  style?: { color: string; background: string };
}

const StoreKpis = ({ rows, meta, whSel, onWh, wip, reserve }: StoreKpisProps) => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = (): void => {
      const kids = Array.from(grid.children) as HTMLElement[];
      if (kids.length === 0) {
        setStep(0);
        setRowCount(0);
        return;
      }
      const tops: number[] = [];
      kids.forEach((kid: HTMLElement) => {
        if (tops.indexOf(kid.offsetTop) === -1) tops.push(kid.offsetTop);
      });
      tops.sort((a: number, b: number) => a - b);
      setStep(tops.length > 1 ? tops[1] - tops[0] : kids[0].offsetHeight);
      setRowCount(tops.length);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [rows.length]);

  useEffect(() => {
    setPage(0);
  }, [rows.length]);

  const pageCount = step ? Math.max(1, Math.ceil(rowCount / ROWS_PER_PAGE)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const viewportHeight = step ? step * ROWS_PER_PAGE - 2 : 0;

  const redUsd = wip?.lights[3]?.usd ?? 0;
  const warmUsd = (wip?.lights[1]?.usd ?? 0) + (wip?.lights[2]?.usd ?? 0) + redUsd;
  const reserveBand = RESERVE_BANDS[reserve?.oldestBandIndex] ?? RESERVE_BANDS[0];

  return (
    <div className="kpi-pager">
      <div
        className="kpi-viewport"
        style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
      >
        <div
          className="kpi-grid"
          ref={gridRef}
          style={{ transform: `translateY(${-safePage * ROWS_PER_PAGE * step}px)` }}
        >
          {rows.length === 0 ? <span className="kpi-val">—</span> : null}
          {rows.map((row: AgedBucket) => {
            const warehouse = meta.warehouses[row.idx];
            if (!warehouse) return null;
            const style = storeStyle(row.idx, warehouse);
            const name = storeLabel(warehouse);
            const isWip = row.idx === wip?.storeIdx;
            const isReserve = row.idx === reserve?.warehouseIdx;
            const missingAge = wip == null && reserve == null;
            const tracksAge = isWip || isReserve;
            const share = isWip ? (wip.usd ? redUsd / wip.usd : 0) : row.usd ? row.aged / row.usd : 0;

            let flag: TileFlag;
            if (isWip) {
              flag = {
                cls: share >= 0.25 ? 'flag-hot' : share >= 0.1 ? 'flag-warm' : 'flag-cool',
                text: `${pct(redUsd, wip.usd)} red · open lights →`,
              };
            } else if (isReserve) {
              flag = {
                cls: 'flag-plain',
                style: { color: reserveBand.ink, background: reserveBand.tint },
                text: `oldest ${reserve.oldestMonths} mo · ${reserveBand.zh} →`,
              };
            } else if (share >= 0.25) {
              flag = { cls: 'flag-hot', text: `${pct(row.aged, row.usd)} aged · critical` };
            } else if (share >= 0.1) {
              flag = { cls: 'flag-warm', text: `${pct(row.aged, row.usd)} aged · watch` };
            } else {
              flag = { cls: 'flag-cool', text: `${pct(row.aged, row.usd)} aged · in line` };
            }

            const on = whSel === row.idx;
            const pick = (): void => onWh(on ? -1 : row.idx);
            const openAge = (): void => {
              void navigate(isWip ? '/wip' : '/reserve');
            };

            let title: string;
            if (isWip) {
              title = `WIP · ${usd(row.usd)} · ${pct(redUsd, wip.usd)} past 4 weeks (red) · ${pct(warmUsd, wip.usd)} past 2 weeks · click to filter`;
            } else if (isReserve) {
              title = `Reserve · ${usd(row.usd)} · ${pct(reserve.atRiskUsd, reserve.usd)} at or past 6 months · oldest lot ${reserve.oldestMonths} months · click to filter`;
            } else {
              title = `${warehouse.rawName} · ${usd(row.usd)} · no stock age tracked`;
            }

            return (
              <div
                key={row.idx}
                role="button"
                tabIndex={0}
                className={`kpi${on ? ' on' : ''}`}
                onClick={pick}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    pick();
                  }
                }}
                aria-pressed={on}
                aria-label={`${name.primary} warehouse · ${usd(row.usd)}`}
                title={title}
              >
                <span className="kpi-icon" style={{ background: style.tint, color: style.tone }}>
                  <Icon name={style.icon} size={19} />
                </span>
                <span className="kpi-body">
                  <span className="kpi-name">
                    {name.primary} {name.secondary ? <em>{name.secondary}</em> : null}
                  </span>
                  <span className="kpi-unit">USD</span>
                  <span className="kpi-val">{num(row.usd)}</span>
                  {missingAge ? (
                    <span className="kpi-flag kpi-flag-blank">—</span>
                  ) : tracksAge ? (
                    <button
                      type="button"
                      className={`kpi-flag kpi-flag-link ${flag.cls}`}
                      style={flag.style}
                      title={isWip ? 'Open the WIP signal lights' : 'Open the reserve age signals'}
                      onClick={(event) => {
                        event.stopPropagation();
                        openAge();
                      }}
                    >
                      {flag.text}
                    </button>
                  ) : (
                    <span className="kpi-flag kpi-flag-blank" aria-hidden="true">
                      &nbsp;
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="kpi-arrows">
        <button
          type="button"
          className="kpi-arrow"
          onClick={() => setPage(Math.max(0, safePage - 1))}
          disabled={safePage === 0}
          aria-label="Previous rows"
          title="Previous"
        >
          <Icon name="chevronUp" size={14} />
        </button>
        <span className="kpi-page num">
          {safePage + 1}/{pageCount}
        </span>
        <button
          type="button"
          className="kpi-arrow"
          onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
          disabled={safePage >= pageCount - 1}
          aria-label="Next rows"
          title="Next"
        >
          <Icon name="chevronDown" size={14} />
        </button>
      </div>
    </div>
  );
};

export default StoreKpis;
