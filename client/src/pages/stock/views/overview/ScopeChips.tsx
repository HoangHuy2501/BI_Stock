import { STOCK_AGE_LABELS } from '@shared/api.interface';
import type { OverviewMeta } from '@shared/api.interface';

import { storeLabel } from '../../lib/store';
import { SCOPE_DIMENSIONS, hasScope } from './scope';
import type { OverviewScope, ScopeDimension } from './scope';

interface ScopeChipsProps {
  meta: OverviewMeta;
  scope: OverviewScope;
  onClear: (dimension: ScopeDimension) => void;
  onClearAll: () => void;
}

const labelOf = (meta: OverviewMeta, scope: OverviewScope, dimension: ScopeDimension): string => {
  switch (dimension) {
    case 'cust':
      return `Buyer · ${meta.customers[scope.cust] ?? ''}`;
    case 'wh':
      return `Warehouse · ${storeLabel(meta.warehouses[scope.wh]).primary}`;
    case 'cat':
      return `Category · ${meta.categories[scope.cat]?.nameZh ?? ''}`;
    case 'age':
      return `Age · ${STOCK_AGE_LABELS[scope.age] ?? ''} d`;
    case 'year':
      return `Year · ${meta.years[scope.year] ?? ''}`;
    default:
      return '';
  }
};

const ScopeChips = ({ meta, scope, onClear, onClearAll }: ScopeChipsProps) => {
  if (!hasScope(scope)) return null;

  const active: ScopeDimension[] = SCOPE_DIMENSIONS.filter(
    (dimension: ScopeDimension) => scope[dimension] >= 0,
  );

  return (
    <div className="xfilter">
      <span className="xfilter-lead">Scope</span>
      {active.map((dimension: ScopeDimension) => {
        const label = labelOf(meta, scope, dimension);
        return (
          <button
            key={dimension}
            type="button"
            className="xchip"
            onClick={() => onClear(dimension)}
            aria-label={`Clear ${label}`}
          >
            {label} <span className="xchip-x" aria-hidden="true">×</span>
          </button>
        );
      })}
      <button type="button" className="xfilter-clear" onClick={onClearAll}>
        Clear all filters
      </button>
    </div>
  );
};

export default ScopeChips;
