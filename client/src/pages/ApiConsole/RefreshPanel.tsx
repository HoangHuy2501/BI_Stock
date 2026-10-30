import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import type { StockCacheMeta } from '@shared/api.interface';

import { SectionCard } from './SectionCard';
import type { RefreshFailureItem, RefreshOutcome, RefreshTarget } from './lib';

interface RefreshPanelProps {
  pending: RefreshTarget | null;
  outcome: RefreshOutcome | null;
  onRefreshAll: () => void;
}

const describeRefreshed = (refreshed: StockCacheMeta[]): string =>
  refreshed.length > 0
    ? refreshed.map((meta: StockCacheMeta) => meta.label).join(', ')
    : 'no datasets reported by the server';

export const RefreshPanel = ({ pending, outcome, onRefreshAll }: RefreshPanelProps) => {
  const isRefreshing: boolean = pending === 'all';

  return (
    <SectionCard
      title="Force a rebuild"
      suffix="POST /api/stock/cache/refresh"
      actions={
        <Button
          type="button"
          onClick={onRefreshAll}
          disabled={pending !== null}
          aria-label="Refresh all cached datasets"
        >
          {isRefreshing ? <Spinner /> : <RefreshCw aria-hidden="true" />}
          {isRefreshing ? 'Refreshing…' : 'Refresh datasets'}
        </Button>
      }
    >
      <p className="text-[12px] leading-relaxed text-[#667085]">
        Bypasses the TTL and rebuilds both datasets from the upstream source, or from the local
        snapshot when the source is not configured. Signed-in operators only.
      </p>

      <div aria-live="polite" className="mt-2.5">
        {outcome === null ? null : outcome.kind === 'success' ? (
          <div className="rounded-lg bg-[#e9f7ef] px-3 py-2 text-[11.5px] leading-relaxed text-[#1c8055]">
            <p className="flex items-start gap-1.5">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>Refreshed: {describeRefreshed(outcome.refreshed)}.</span>
            </p>
            {outcome.failures.map((failure: RefreshFailureItem) => (
              <p key={failure.key} className="mt-1 break-words pl-5 text-[#b8413a]">
                {failure.key}: {failure.message}
              </p>
            ))}
          </div>
        ) : (
          <p className="flex items-start gap-1.5 rounded-lg border border-[#e35b53]/30 bg-[#fdeceb] px-3 py-2 text-[11.5px] leading-relaxed text-[#b8413a]">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span className="break-words">{outcome.message}</span>
          </p>
        )}
      </div>
    </SectionCard>
  );
};
