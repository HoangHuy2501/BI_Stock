import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { agedFromThreshold } from './lib/model';
import './stock.css';

export type Density = 'comfortable' | 'compact';

interface ViewOptionsState {
  threshold: number;
  density: Density;
  agedFrom: number;
  setThreshold: (value: number) => void;
  setDensity: (value: Density) => void;
}

interface StoredOptions {
  threshold: number;
  density: Density;
}

const STORAGE_KEY = 'stock.view-options';
const DEFAULTS: StoredOptions = { threshold: 90, density: 'comfortable' };

interface ViewTab {
  to: string;
  zh: string;
  en: string;
}

const VIEW_TABS: ViewTab[] = [
  { to: '/', zh: '库存总览', en: 'Stock' },
  { to: '/wip', zh: 'WIP 信号灯', en: 'WIP lights' },
  { to: '/reserve', zh: '保留仓库龄', en: 'Reserve age' },
];

const ViewOptionsContext = createContext<ViewOptionsState | null>(null);

export const useViewOptions = (): ViewOptionsState => {
  const value = useContext(ViewOptionsContext);
  if (!value) throw new Error('useViewOptions must be used inside StockLayout');
  return value;
};

const readStored = (): StoredOptions => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<StoredOptions>;
    return {
      threshold: typeof parsed.threshold === 'number' ? parsed.threshold : DEFAULTS.threshold,
      density: parsed.density === 'compact' ? 'compact' : 'comfortable',
    };
  } catch {
    return DEFAULTS;
  }
};

const StockLayout = () => {
  const { pathname } = useLocation();
  const [options, setOptions] = useState<StoredOptions>(DEFAULTS);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setOptions(readStored());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', options.density);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch {
      /* storage disabled: keep the in-memory value */
    }
  }, [options]);

  const contextValue = useMemo<ViewOptionsState>(
    () => ({
      threshold: options.threshold,
      density: options.density,
      agedFrom: agedFromThreshold(options.threshold),
      setThreshold: (value: number) => setOptions((prev) => ({ ...prev, threshold: value })),
      setDensity: (value: Density) => setOptions((prev) => ({ ...prev, density: value })),
    }),
    [options],
  );

  return (
    <ViewOptionsContext.Provider value={contextValue}>
      <div className="page stock-app">
        <header className="wrap pagehead">
          <div className="headrow">
            <h1>Stock Analysis · 库存分析</h1>
            <nav className="viewtabs" aria-label="Stock views">
              {VIEW_TABS.map((tab: ViewTab) => {
                const active = pathname === tab.to;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={active ? 'on' : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    {tab.zh} <em>{tab.en}</em>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="head-tools">
            <button
              type="button"
              className="viewopts-trigger"
              onClick={() => setPanelOpen((open: boolean) => !open)}
              aria-expanded={panelOpen}
            >
              View options
            </button>
            {panelOpen ? (
              <div className="viewopts" role="dialog" aria-label="View options">
                <p className="viewopts-title">Aging policy</p>
                <div className="seg seg-sm" role="group" aria-label="Aged after">
                  {['60', '90', '180'].map((value: string) => (
                    <button
                      key={value}
                      type="button"
                      className={String(options.threshold) === value ? 'on' : undefined}
                      aria-pressed={String(options.threshold) === value}
                      onClick={() => setOptions((prev) => ({ ...prev, threshold: Number(value) }))}
                    >
                      {value} d
                    </button>
                  ))}
                </div>
                <p className="viewopts-title">Row density</p>
                <div className="seg seg-sm" role="group" aria-label="Row density">
                  {(['compact', 'comfortable'] as Density[]).map((value: Density) => (
                    <button
                      key={value}
                      type="button"
                      className={options.density === value ? 'on' : undefined}
                      aria-pressed={options.density === value}
                      onClick={() => setOptions((prev) => ({ ...prev, density: value }))}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </header>
        <Outlet />
      </div>
    </ViewOptionsContext.Provider>
  );
};

export default StockLayout;
