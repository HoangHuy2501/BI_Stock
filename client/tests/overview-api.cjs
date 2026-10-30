// Run with: node tests/overview-api.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const source = path.resolve(__dirname, '../src');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  if (id.startsWith('@shared/')) id = path.join(source, 'shared', id.slice(8));
  return resolve.call(this, id, ...args);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8').replace('import.meta.env.VITE_API_BASE_URL', "''"), {
      fileName: filename,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    module._compile(result.outputText, filename);
  };
}
const { buildSummaryOverviewModel, buildOverviewModel } = require('../src/pages/stock/views/overview/model.ts');
const { num, usd, pct } = require('../src/pages/stock/lib/format.ts');
const filters = { cust: -1, wh: -1, cat: -1, age: -1, year: -1, agedFrom: 3 };
const fixture = {
  annualSummary: { items: [{ yearIdx: 'year-A', year: 2026, usd: 100 }], totalUsd: 100 },
  categorySummary: { items: [{ categoryIdx: 8, nameZh: 'A', usd: 100 }], totalUsd: 100 },
  warehouseSummary: { items: [{ warehouseIdx: 4, nameZh: 'WIP', usd: 100 }] },
  buyerRank: { items: [{ customerIdx: 'buyer-A', name: 'Buyer', usd: 100 }] },
  // AgedRank's ROW_NUMBER ID deliberately differs from CategorySummary.
  agedRank: { thresholdDays: 90, items: [{ categoryIdx: 0, nameZh: 'A', agedUsd: 30 }] },
  monthWarehouseLedger: [
    { warehouseName: 'WIP', categoryName: 'A', customerName: 'Buyer', month: '2026-01', qty: 3, usd: 70 },
    { warehouseName: 'WIP', categoryName: 'A', customerName: 'Buyer', month: '2026-02', qty: 2, usd: 30 },
  ],
};
const model = buildSummaryOverviewModel(fixture, filters, 90);
assert.equal(model.scoped.usd, 100);
assert.equal(model.scoped.lines, null);
assert.equal(buildSummaryOverviewModel(fixture, { ...filters, cust: 0 }, 90).scoped.usd, 100);
assert.equal(buildSummaryOverviewModel(fixture, { ...filters, cust: 0, cat: 0 }, 90).scoped.usd, null);
assert.equal(model.yearBars[0].value, 100);
assert.equal(model.catBars[0].key, model.agedRows[0].key);
assert.equal(model.pivotStores[0].usd, 100);
assert.equal(model.pivotStores[0].qty, 5);
assert.deepEqual(model.axis.labels, ['2026-01', '2026-02']);
assert.equal(buildSummaryOverviewModel(fixture, { ...filters, cust: 0 }, 90).catBars[0].value, null);
assert.equal(buildSummaryOverviewModel(fixture, filters, 180).agedRows[0].value, null);
const missing = buildSummaryOverviewModel({}, filters, 90);
assert.equal(missing.scoped.usd, null);
assert.equal(missing.ledgerAvailable, false);
assert.deepEqual(missing.pivotStores, []);
const partial = structuredClone(fixture);
partial.monthWarehouseLedger[0].qty = null;
partial.monthWarehouseLedger[0].usd = null;
partial.monthWarehouseLedger[0].month = null;
const partialModel = buildSummaryOverviewModel(partial, filters, 90);
assert.equal(partialModel.pivotStores[0].qty, null);
assert.equal(partialModel.pivotStores[0].usd, null);
assert(partialModel.axis.labels.includes('—'));
assert.equal(num(null), '—');
assert.equal(usd(null), '—');
assert.equal(pct(null, 100), '—');
assert.equal(num(0), '0');
assert.equal(usd(12.4), '$12');
const meta = { ...model.meta, totalUsd: 100, months: ['2026-01'], ages: [], snapshotDate: '', lineCount: 2, skuCount: 1, totalQty: 5, detailCount: 2, detailUsd: 100, spanFrom: '', spanTo: '' };
const cube = [{ warehouseIdx: 0, categoryIdx: 0, customerIdx: 0, ageIdx: 3, yearIdx: 0, monthIdx: 0, qty: 5, usd: 100, lines: 2 }];
const legacy = buildOverviewModel(cube, meta, filters);
assert.equal(legacy.scoped.usd, 100);
assert.equal(legacy.scoped.lines, 2);
assert.equal(legacy.agedRows[0].value, 100);
assert.equal(buildOverviewModel(cube, meta, { ...filters, cust: 1 }).scoped.usd, 0);

// Render the actual Overview and its original child components, including the
// null detail register, without issuing network requests.
const load = Module._load;
let current = fixture;
Module._load = function (id, parent, ...args) {
  if (id.endsWith('hooks/useStockData')) return {
    useStockOverview: () => ({ data: current, isPending: false }),
    useStockDetail: (_query, enabled) => {
      assert.equal(enabled, false);
      return { data: undefined, isPending: true, isError: false };
    },
  };
  if (id.endsWith('StockLayout')) return { useViewOptions: () => ({ threshold: 90, agedFrom: 3 }) };
  if (id.endsWith('api/stock')) return { getStockErrorMessage: (_error, fallback) => fallback };
  return load.call(this, id, parent, ...args);
};
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const Overview = require('../src/pages/stock/views/OverviewView.tsx').default;
for (const data of [fixture, {}, partial]) {
  current = data;
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Overview)));
  for (const title of ['Annual Summary', 'Category Summary', 'Warehouse Summary', 'Buyer Rank', 'Aged Rank', 'Month × Warehouse Ledger', 'Stock Detail']) assert(html.includes(title), title);
  assert(!html.includes('NaN'));
  assert(html.includes('detail detail-wide'));
  assert(html.includes('sheet-foot'));
  assert(html.includes('—'));
}
async function testApi() {
  const { stockApi } = require('../src/api/stock.ts');
  const originalFetch = global.fetch;
  try {
    global.fetch = async () => new Response(JSON.stringify({ success: true, data: fixture }), { status: 200 });
    assert.deepEqual(await stockApi.overview(), fixture);
    global.fetch = async () => new Response(JSON.stringify({ meta, cube }), { status: 200 });
    assert.deepEqual(await stockApi.overview(), { meta, cube });
    global.fetch = async () => new Response(JSON.stringify({ success: false, message: 'SQL unavailable', data: null }), { status: 200 });
    await assert.rejects(stockApi.overview(), /SQL unavailable/);
    const fixturePath = process.env.OVERVIEW_LEDGER_FIXTURE;
    if (fixturePath && fs.existsSync(fixturePath)) {
    const uploaded = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const realLedger = buildSummaryOverviewModel(uploaded.data, filters, 90);
    assert(realLedger.pivotStores.length > 0);
    assert.equal(realLedger.scoped.usd, null);
    const expected = uploaded.data.monthWarehouseLedge.reduce((sum, row) => sum + row.usd, 0);
    const actual = realLedger.pivotStores.reduce((sum, row) => sum + row.usd, 0);
    assert(Math.abs(actual - expected) < 0.001);
    }
  } finally {
    global.fetch = originalFetch;
  }
  console.log('PASS: API envelopes, independent IDs, null values, legacy filters and full Overview rendering.');
}
testApi().catch(error => { console.error(error); process.exitCode = 1; });
