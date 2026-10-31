import { useEffect, useState } from 'react';

import type { ReserveDataset, ReserveRegisterLine } from '@shared/api.interface';

import { num, usd } from '../../lib/format';
import { RESERVE_BANDS } from '../../lib/reserve';
import type { ReserveBalance, ReserveChip } from './focus';

const PAGE_SIZE = 20;

const buildPageList = (pageCount: number, current: number): (number | 'gap')[] => {
  const out: (number | 'gap')[] = [];
  for (let pageNo = 1; pageNo <= pageCount; pageNo += 1) {
    if (pageNo === 1 || pageNo === pageCount || (pageNo >= current + 1 && pageNo <= current + 2)) {
      out.push(pageNo);
    } else if (out[out.length - 1] !== 'gap') {
      out.push('gap');
    }
  }
  return out;
};

interface ReserveRegisterProps {
  dataset: ReserveDataset;
  rows: ReserveRegisterLine[];
  chips: ReserveChip[];
  balance: ReserveBalance | null;
  focusKey: string;
  onRemoveChip: (chip: ReserveChip) => void;
  onClear: () => void;
}

const ReserveRegister = ({
  dataset,
  rows,
  chips,
  balance,
  focusKey,
  onRemoveChip,
  onClear,
}: ReserveRegisterProps) => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [focusKey]);

  const ordered: ReserveRegisterLine[] = rows
    .slice()
    .sort((a: ReserveRegisterLine, b: ReserveRegisterLine): number =>
      (b.ageMonths ?? -1) - (a.ageMonths ?? -1),
    );
  const pages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = ordered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const from = ordered.length > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const to = Math.min(ordered.length, (safePage + 1) * PAGE_SIZE);

  /* value in the selection that carries no item-level line — keeps the register reconciled with the signals */
  const gap = balance && balance.usd > 1 ? balance : null;
  const showTable = ordered.length > 0 || Boolean(gap);

  return (
    <div className="detail-body">
      {chips.length > 0 ? (
        <div className="xfilter" role="status">
          <span className="xfilter-lead">Cross-filter</span>
          {chips.map((chip: ReserveChip) => (
            <button
              type="button"
              className="xchip"
              key={chip.key}
              onClick={() => onRemoveChip(chip)}
              title="Remove this filter"
            >
              <span className="xchip-dim">{chip.dimLabel}</span>
              {chip.label}
              <span className="xchip-x" aria-hidden="true">
                ×
              </span>
            </button>
          ))}
          <button type="button" className="xfilter-clear" onClick={onClear}>
            Clear all
          </button>
        </div>
      ) : null}

      {ordered.length === 0 && gap ? (
        <div className="reg-empty">
          <b>No item-level lines for {gap.label}.</b>
          <span>
            The signal counts {usd(gap.usd)} here; those lots have no item code, batch or reason in the detail feed,
            so they appear as a single “not itemised” balance row instead.
          </span>
          <button type="button" className="reg-empty-btn" onClick={onClear}>
            Clear cross-filter
          </button>
        </div>
      ) : null}

      {ordered.length === 0 && !gap ? (
        <div className="reg-empty">
          <b>
            {chips.length > 0
              ? 'No detail line matches this cross-filter.'
              : 'No item-level lines in the detail feed.'}
          </b>
          <span>
            {chips.length > 0
              ? 'The signals count lots that carry no item code, batch or reason, so the register has nothing to list for this selection.'
              : 'The reserve warehouse has no matching detail lines, so the register stays empty.'}
          </span>
          {chips.length > 0 ? (
            <button type="button" className="reg-empty-btn" onClick={onClear}>
              Clear cross-filter
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="reg-coverage">
        <span>
          Item-level lines for <b>{num(dataset.rows.length)}</b> of {num(dataset.lines)} reserve lots ·{' '}
          {usd(dataset.itemisedUsd)} of {usd(dataset.usd)}
        </span>
        <span>signals above cover every lot</span>
      </div>

      <div className={showTable ? 'table-scroll' : 'table-scroll is-hidden'}>
        <table className="detail reserve-register">
          <thead>
            <tr>
              <th className="reserve-item-column">Item 物料</th>
              <th>Code 编码</th>
              <th>Lot / batch 批次</th>
              <th className="nowrap">Date</th>
              <th>Buyer 客户</th>
              <th style={{ width: '22%' }}>Reason_dl 原因</th>
              <th>Link</th>
              <th>Warehouse band 库龄段</th>
              <th className="num">Age (mo) 月龄</th>
              <th className="num">Value</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((line: ReserveRegisterLine) => {
              const goodsLink =
                `http://172.18.1.12:4004/?goods_no=${encodeURIComponent(line.goodsNo ?? '')}` +
                `&made_lot=${encodeURIComponent(line.batchNo ?? '')}`;
              const bandStyle =
                RESERVE_BANDS.find((band) => band.label === line.ageBand) ??
                (line.ageBand === '12+ months' ? RESERVE_BANDS[RESERVE_BANDS.length - 1] : undefined);
              return (
                <tr className="row" key={line.id}>
                  <td className="reserve-item-column">
                    <span className="cell-item">
                      <span className="name">{line.itemName ?? '—'}</span>
                      <span className="meta">{line.categoryName ?? '—'}</span>
                    </span>
                  </td>
                  <td className="mono-cell">{line.goodsNo ?? '—'}</td>
                  <td className="mono-cell">{line.batchNo || '—'}</td>
                  <td className="nowrap">{line.lotDate ? line.lotDate.slice(0, 10) : '—'}</td>
                  <td className="nowrap">{line.buyer ?? '—'}</td>
                  <td className="reason-cell">
                    {line.reasonDl || <span className="not-recorded">Not recorded</span>}
                  </td>
                  <td className="reason-cell reserve-link-cell">
                    {line.reasonDl !== null ? (
                      '—'
                    ) : (
                      <a className="reserve-goods-link" href={goodsLink} target="_blank" rel="noopener noreferrer">
                        {goodsLink}
                      </a>
                    )}
                  </td>
                  <td>
                    {line.ageBand ? (
                      <span
                        className="band-pill"
                        style={bandStyle ? { color: bandStyle.ink, background: bandStyle.tint } : undefined}
                      >
                        {line.ageBand}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="num">
                    {typeof line.ageMonths !== 'number' || !Number.isFinite(line.ageMonths) ? '—' : (
                      <span className="band-pill">{line.ageMonths.toFixed(1)}</span>
                    )}
                  </td>
                  <td className="num value-cell">{usd(line.usd)}</td>
                </tr>
              );
            })}
            {gap && safePage === pages - 1 ? (
              <tr className="row is-balance" key="__balance">
                <td className="reserve-item-column">
                  <span className="cell-item">
                    <span className="name">Not itemised — lots in this selection without an item-level line</span>
                  </span>
                </td>
                <td className="mono-cell">—</td>
                <td className="mono-cell">—</td>
                <td className="nowrap">—</td>
                <td className="nowrap">all buyers</td>
                <td className="reason-cell">
                  <span className="faint">not in detail feed</span>
                </td>
                <td>—</td>
                <td>
                  <span className="band-pill" style={{ color: 'var(--ink-3)', background: 'var(--line-2)' }}>
                    {gap.label}
                  </span>
                </td>
                <td className="num">—</td>
                <td className="num value-cell">{usd(gap.usd)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className={showTable ? 'pager' : 'pager is-hidden'}>
        <span className="pager-info num">
          {num(from)}–{num(to)} of {num(ordered.length)}
          {gap ? ' + 1 balance row' : ''}
        </span>
        <div className="pager-btns">
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
          {buildPageList(pages, safePage).map((pageNo: number | 'gap', index: number) =>
            pageNo === 'gap' ? (
              <span className="page-gap" key={`gap-${index}`}>
                …
              </span>
            ) : (
              <button
                key={pageNo}
                type="button"
                className={pageNo === safePage + 1 ? 'page-btn current' : 'page-btn'}
                aria-current={pageNo === safePage + 1 ? 'page' : undefined}
                onClick={() => setPage(pageNo - 1)}
              >
                {pageNo}
              </button>
            ),
          )}
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
            disabled={safePage >= pages - 1}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReserveRegister;
