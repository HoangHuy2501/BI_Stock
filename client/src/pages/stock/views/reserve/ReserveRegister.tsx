import { useEffect, useState } from 'react';

import type { ReserveDataset, StockDetailLine } from '@shared/api.interface';

import { num, usd } from '../../lib/format';
import { bandOf, monthsOfDays } from '../../lib/reserve';
import type { ReserveBalance, ReserveChip } from './focus';

const PAGE_SIZE = 12;

interface ReserveRegisterProps {
  dataset: ReserveDataset;
  rows: StockDetailLine[];
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

  const ordered: StockDetailLine[] = rows
    .slice()
    .sort((a: StockDetailLine, b: StockDetailLine): number => b.ageDays - a.ageDays);
  const pages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = ordered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

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
        <table className="detail">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Item 物料</th>
              <th>Code 编码</th>
              <th>Lot / batch 批次</th>
              <th className="nowrap">Date</th>
              <th>Buyer 客户</th>
              <th style={{ width: '22%' }}>Reason_dl 原因</th>
              <th>Warehouse band 库龄段</th>
              <th className="num">Age (mo) 月龄</th>
              <th className="num">Value</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((line: StockDetailLine) => {
              const months = monthsOfDays(line.ageDays);
              const band = bandOf(months);
              return (
                <tr className="row" key={line.id}>
                  <td>
                    <span className="cell-item">
                      <span className="name">{line.itemName}</span>
                      <span className="meta">
                        {line.categoryZh} · {line.warehouseZh}
                      </span>
                    </span>
                  </td>
                  <td className="mono-cell">{line.goodsNo}</td>
                  <td className="mono-cell">{line.batchNo || '—'}</td>
                  <td className="nowrap">{line.lotDate ?? '—'}</td>
                  <td className="nowrap">{line.customerName}</td>
                  <td className="reason-cell">
                    {line.reasonDl || <span className="not-recorded">Not recorded</span>}
                  </td>
                  <td>
                    <span className="band-pill" style={{ color: band.ink, background: band.tint }}>
                      {band.label}
                    </span>
                  </td>
                  <td className="num">
                    <span className="band-pill" style={{ color: band.ink, background: band.tint }}>
                      {months.toFixed(1)}
                    </span>
                  </td>
                  <td className="num value-cell">{usd(line.usd)}</td>
                </tr>
              );
            })}
            {gap && safePage === pages - 1 ? (
              <tr className="row is-balance" key="__balance">
                <td>
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
        <span className="pager-info">
          Page {safePage + 1} of {pages} · showing {slice.length > 0 ? safePage * PAGE_SIZE + 1 : 0}–
          {safePage * PAGE_SIZE + slice.length} of {num(ordered.length)} detail lines
          {gap ? ' + 1 balance row' : ''}
        </span>
        <div className="pager-btns">
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(0)}
            disabled={safePage === 0}
            aria-label="First page"
          >
            «
          </button>
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="page-btn current" aria-current="page">
            {safePage + 1}
          </span>
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= pages - 1}
            aria-label="Next page"
          >
            ›
          </button>
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(pages - 1)}
            disabled={safePage >= pages - 1}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReserveRegister;
