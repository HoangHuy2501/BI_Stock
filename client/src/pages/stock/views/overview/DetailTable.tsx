import { useEffect, useState } from 'react';

import type { StockDetailLine, OverviewMeta } from '@shared/api.interface';

import { getStockErrorMessage } from '../../../../api/stock';
import type { StockDetailQuery } from '../../../../api/stock';
import Card from '../../components/Card';
import { useStockDetail } from '../../hooks/useStockData';
import { num, usd } from '../../lib/format';
import { storeStyle } from '../../lib/store';
import DetailTools from './DetailTools';
import ScopeChips from './ScopeChips';
import type { OverviewScope, ScopeDimension } from './scope';

type SortKey = 'usd' | 'age' | 'qty';

interface DetailSort {
  key: SortKey;
  dir: 'asc' | 'desc';
}

const PAGE_SIZE = 12;

interface DetailTableProps {
  meta: OverviewMeta;
  scope: OverviewScope;
  threshold: number;
  scopeLines: number | null;
  available?: boolean;
  onClear: (dimension: ScopeDimension) => void;
  onResetAll: () => void;
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: DetailSort;
  onSort: (key: SortKey) => void;
  className?: string;
}

const SortHeader = ({ label, sortKey, sort, onSort, className }: SortHeaderProps) => {
  const active = sort.key === sortKey;
  const ariaSort: 'ascending' | 'descending' | 'none' = active
    ? sort.dir === 'desc'
      ? 'descending'
      : 'ascending'
    : 'none';
  const pick = (): void => onSort(sortKey);

  return (
    <th
      className={`${className ?? ''} sortable${active ? ' sorted' : ''}`}
      role="button"
      tabIndex={0}
      aria-sort={ariaSort}
      onClick={pick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          pick();
        }
      }}
    >
      {label}
      <span className="arrow" aria-hidden="true">
        {active ? (sort.dir === 'desc' ? '↓' : '↑') : '↓'}
      </span>
    </th>
  );
};

const DetailTable = ({ meta, scope, threshold, scopeLines, available = true, onClear, onResetAll }: DetailTableProps) => {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState<DetailSort>({ key: 'usd', dir: 'desc' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [scope.cust, scope.wh, scope.cat, scope.age, scope.year, term, sort.key, sort.dir]);

  const query: StockDetailQuery = {
    cust: scope.cust >= 0 ? scope.cust : undefined,
    wh: scope.wh >= 0 ? scope.wh : undefined,
    cat: scope.cat >= 0 ? scope.cat : undefined,
    age: scope.age >= 0 ? scope.age : undefined,
    year: scope.year >= 0 ? meta.years[scope.year] : undefined,
    q: term || undefined,
    sort: sort.key,
    dir: sort.dir,
    page,
    pageSize: PAGE_SIZE,
  };

  const detail = useStockDetail(query, available);

  const lines: StockDetailLine[] = available ? detail.data?.items ?? [] : [];
  const total = detail.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  const toggleSort = (key: SortKey): void => {
    setSort((prev: DetailSort) =>
      prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' },
    );
  };

  const clearAll = (): void => {
    setSearch('');
    setTerm('');
    onResetAll();
  };

  return (
    <Card
      zh="库存明细"
      en="Stock Detail"
      headRight={
        <DetailTools search={search} onSearch={setSearch} shown={available ? total : null} total={scopeLines} />
      }
    >
      <ScopeChips meta={meta} scope={scope} onClear={onClear} onClearAll={clearAll} />
      {available && detail.isPending ? <p className="card-sub">Loading stock lines…</p> : null}
      <div className="detail-body">
        <div className="table-scroll">
          <table className="detail detail-wide">
            <thead>
              <tr>
                <th style={{ width: '24%' }}>Item 物料</th>
                <th>Code 编码</th>
                <th>Lot / batch 批次</th>
                <th className="nowrap">Date</th>
                <th>Warehouse 仓库</th>
                <th>Buyer 客户</th>
                <th>Category 品类</th>
                <th>Reason 原因</th>
                <SortHeader label="Age (d)" sortKey="age" sort={sort} onSort={toggleSort} className="num" />
                <SortHeader label="Qty" sortKey="qty" sort={sort} onSort={toggleSort} className="num" />
                <SortHeader label="Value" sortKey="usd" sort={sort} onSort={toggleSort} className="num" />
              </tr>
            </thead>
            <tbody>
              {!available ? (
                <tr className="row">
                  {Array.from({ length: 11 }, (_, index) => <td key={index}>—</td>)}
                </tr>
              ) : null}
              {lines.map((line: StockDetailLine) => {
                const aged = line.ageDays > threshold;
                const warehouse = meta.warehouses[line.warehouseIdx];
                const tone = warehouse ? storeStyle(line.warehouseIdx, warehouse).tone : 'var(--blue)';
                const reason = line.reasonDl || line.reasonWh;
                return (
                  <tr className="row" key={line.id}>
                    <td>
                      <span className="cell-item">
                        <span className="name">{line.itemName}</span>
                      </span>
                    </td>
                    <td className="mono-cell">{line.goodsNo}</td>
                    <td className="mono-cell">{line.batchNo || '—'}</td>
                    <td className="nowrap">{line.lotDate || '—'}</td>
                    <td>
                      <span className="wh-cell">
                        <span className="wh-dot" style={{ background: tone }}></span>
                        {line.warehouseZh}
                      </span>
                    </td>
                    <td className="nowrap">{line.customerName}</td>
                    <td className="cat-cell2" title={line.categoryEn}>
                      {line.categoryZh}
                    </td>
                    <td className="reason-cell">
                      {reason ? reason : <span className="not-recorded">Not recorded</span>}
                    </td>
                    <td className="num">
                      <span className={`age-pill ${aged ? 'hot' : 'cool'}`}>{Math.round(line.ageDays)}</span>
                    </td>
                    <td className="num">
                      {num(line.qty)}{' '}
                      <span style={{ color: 'var(--faint)', fontSize: '10px' }}>{line.unit}</span>
                    </td>
                    <td className={`num value-cell${aged ? ' aged' : ''}`}>{usd(line.usd)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {available && detail.isError ? (
          <div className="empty">
            <h3>Stock lines could not be loaded</h3>
            <p>{getStockErrorMessage(detail.error, 'The detail register request failed.')}</p>
            <button
              type="button"
              onClick={() => {
                void detail.refetch();
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {available && !detail.isError && detail.data && total === 0 ? (
          <div className="empty">
            <h3>No lines in this scope</h3>
            <p>The current filters and search exclude every listed line. Widen the scope or clear the search.</p>
            <button type="button" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        ) : null}

        <div className="pager">
          <span className="pager-info">
            Page {available ? safePage : '—'} of {available ? pages : '—'} · showing {available ? from : '—'}–{available ? to : '—'} of {num(available ? total : null)}
          </span>
          <div className="pager-btns">
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              aria-label="First page"
            >
              «
            </button>
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="page-btn current" aria-current="page">
              {safePage}
            </span>
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(Math.min(pages, safePage + 1))}
              disabled={safePage >= pages}
              aria-label="Next page"
            >
              ›
            </button>
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(pages)}
              disabled={safePage >= pages}
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DetailTable;
