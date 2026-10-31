import { useMemo, useState } from 'react';

import { getStockErrorMessage } from '../../../api/stock';
import BarChart from '../components/BarChart';
import Card from '../components/Card';
import { useStockOverview } from '../hooks/useStockData';
import { pct, usd } from '../lib/format';
import type { StockFilters } from '../lib/model';
import { useViewOptions } from '../StockLayout';
import DetailTable from './overview/DetailTable';
import PivotTable from './overview/PivotTable';
import RankList from './overview/RankList';
import StoreKpis from './overview/StoreKpis';
import { buildOverviewModel, buildSummaryOverviewModel } from './overview/model';
import type { OverviewScope, ScopeDimension } from './overview/scope';

interface MonthSpanOption {
  span: number;
  label: string;
}

const MONTH_SPANS: MonthSpanOption[] = [
  { span: 6, label: '6 months' },
  { span: 12, label: '12 months' },
  { span: 0, label: 'All months' },
];

const OverviewSkeleton = () => (
  <main className="wrap stack" aria-busy="true">
    <div className="row-2">
      <Card zh="年度汇总" en="Annual Summary">
        <p className="card-sub">Loading the stock cube…</p>
      </Card>
      <Card zh="类别汇总" en="Category Summary">
        <p className="card-sub">Loading the stock cube…</p>
      </Card>
    </div>
    <Card zh="仓库金额" en="Warehouse Summary">
      <p className="card-sub">Loading warehouse totals…</p>
    </Card>
    <div className="row-2">
      <Card zh="客户排行" en="Buyer Rank">
        <p className="card-sub">Loading buyer totals…</p>
      </Card>
      <Card zh="库龄排行" en="Aged Rank">
        <p className="card-sub">Loading aged totals…</p>
      </Card>
    </div>
    <Card zh="月份明细" en="Month × Warehouse Ledger">
      <p className="card-sub">Loading the month ledger…</p>
    </Card>
    <Card zh="库存明细" en="Stock Detail">
      <p className="card-sub">Loading stock lines…</p>
    </Card>
  </main>
);

const OverviewView = () => {
  const { threshold, agedFrom } = useViewOptions();
  const overview = useStockOverview();

  const [cust, setCust] = useState(-1);
  const [wh, setWh] = useState(-1);
  const [cat, setCat] = useState(-1);
  const [age, setAge] = useState(-1);
  const [year, setYear] = useState(-1);
  const [monthSpan, setMonthSpan] = useState(12);

  const model = useMemo(() => {
    if (!overview.data) return null;
    const filters: StockFilters = { cust, wh, cat, age, year, agedFrom };
    const data = overview.data;
    if ('cube' in data) {
      return { ...buildOverviewModel(data.cube, data.meta, filters), meta: data.meta, totalUsd: data.meta.totalUsd, ledgerAvailable: true };
    }
    return buildSummaryOverviewModel(data, filters, threshold);
  }, [overview.data, cust, wh, cat, age, year, agedFrom, threshold]);

  const resetAll = (): void => {
    setCust(-1);
    setWh(-1);
    setCat(-1);
    setAge(-1);
    setYear(-1);
  };

  const clearDimension = (dimension: ScopeDimension): void => {
    if (dimension === 'cust') setCust(-1);
    if (dimension === 'wh') setWh(-1);
    if (dimension === 'cat') setCat(-1);
    if (dimension === 'age') setAge(-1);
    if (dimension === 'year') setYear(-1);
  };

  if (overview.isPending) return <OverviewSkeleton />;

  const data = overview.data;
  if (!data || !model) {
    return (
      <main className="wrap stack">
        <Card zh="库存总览" en="Stock overview">
          <div className="empty">
            <h3>Unable to load the stock overview</h3>
            <p>{getStockErrorMessage(overview.error, 'The stock dataset could not be loaded.')}</p>
            <button
              type="button"
              onClick={() => {
                void overview.refetch();
              }}
            >
              Retry
            </button>
          </div>
        </Card>
      </main>
    );
  }

  const scope: OverviewScope = { cust, wh, cat, age, year };

  return (
    <main className="wrap stack">
      {/* row-1-2 */}
      <div className="row-2"> 
        <Card zh="年度汇总" en="Annual Summary" note={`${usd(model.scoped.usd)} in total`}>
          <BarChart items={model.yearBars} picked={year} onPick={setYear} muted={model.noYearUsd} />
        </Card>
        <Card zh="类别汇总" en="Category Summary" note={`${pct(model.noCatUsd, model.totalUsd)} of total`}>
          <BarChart items={model.catBars} picked={cat} onPick={setCat} muted={model.noCatUsd} />
        </Card>
      </div>

      <Card
        zh="仓库金额"
        en="Warehouse Summary"
        note={`${model.storeRows.length} warehouses · value, highest first`}
      >
        <StoreKpis
          rows={model.storeRows}
          meta={model.meta}
          whSel={wh}
          onWh={setWh}
          wip={'cube' in data ? data.wipSummary : null}
          reserve={'cube' in data ? data.reserveSummary : null}
        />
      </Card>

      <div className="row-2">
        <Card zh="客户排行" en="Buyer Rank" note="by value" className="rank-card">
          <RankList rows={model.buyerRows} picked={cust} onPick={setCust} />
        </Card>
        <Card zh="库龄排行" en="Aged Rank" note={`past ${threshold} d`} className="rank-card">
          <RankList rows={model.agedRows} picked={cat} onPick={setCat} alt />
        </Card>
      </div>

      <Card
        zh="月份明细"
        en="Month × Warehouse Ledger"
        headRight={
          <div className="seg seg-sm" role="group" aria-label="Month span">
            {MONTH_SPANS.map((option: MonthSpanOption) => (
              <button
                key={option.span}
                type="button"
                className={monthSpan === option.span ? 'on' : undefined}
                aria-pressed={monthSpan === option.span}
                onClick={() => setMonthSpan(option.span)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      >
        <PivotTable
          stores={model.pivotStores}
          meta={model.meta}
          axis={model.axis}
          span={monthSpan}
          available={model.ledgerAvailable}
          wh={wh}
          cat={cat}
          cust={cust}
          onWh={setWh}
          onCat={setCat}
          onCust={setCust}
        />
      </Card>

      <DetailTable
        meta={model.meta}
        scope={scope}
        threshold={threshold}
        scopeLines={model.scoped.lines == null ? null : Math.round(model.scoped.lines)}
        available={true}
        onClear={clearDimension}
        onResetAll={resetAll}
      />
    </main>
  );
};

export default OverviewView;
