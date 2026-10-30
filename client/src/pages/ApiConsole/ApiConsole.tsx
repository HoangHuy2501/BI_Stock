import { useState } from 'react';

import { getStockErrorMessage } from '@/api/stock';
import { useRefreshCache, useSourceStatus } from '@/pages/stock/hooks/useStockData';

import type {
  StockCacheKey,
  StockCacheMeta,
  StockCacheRefreshResponse,
} from '@shared/api.interface';

import { CacheCard } from './CacheCard';
import { CallTable } from './CallTable';
import { ConfigCard } from './ConfigCard';
import { ConsoleError } from './ConsoleError';
import { ConsoleSkeleton } from './ConsoleSkeleton';
import { EndpointTable } from './EndpointTable';
import { ProxyBanner } from './ProxyBanner';
import { RefreshPanel } from './RefreshPanel';
import type { RefreshOutcome, RefreshTarget } from './lib';

const STATUS_ERROR_FALLBACK = 'The proxy status request failed. Try again in a moment.';

const ApiConsole = () => {
  const statusQuery = useSourceStatus();
  const refreshMutation = useRefreshCache();
  const [pending, setPending] = useState<RefreshTarget | null>(null);
  const [outcome, setOutcome] = useState<RefreshOutcome | null>(null);

  const runRefresh = (keys?: StockCacheKey[]): void => {
    const target: RefreshTarget = keys && keys.length === 1 ? keys[0] : 'all';
    setPending(target);
    setOutcome(null);
    refreshMutation.mutate(keys, {
      onSuccess: (result: StockCacheRefreshResponse) => {
        setOutcome({ kind: 'success', refreshed: result.refreshed, failures: result.failures });
      },
      onError: (error: unknown) => {
        setOutcome({
          kind: 'error',
          message: getStockErrorMessage(error, 'The cache refresh request failed.'),
        });
      },
      onSettled: () => {
        setPending(null);
      },
    });
  };

  const refreshOne = (key: StockCacheKey): void => {
    runRefresh([key]);
  };

  const refreshAll = (): void => {
    runRefresh();
  };

  const retry = (): void => {
    void statusQuery.refetch();
  };

  if (statusQuery.isPending) return <ConsoleSkeleton />;

  if (statusQuery.isError) {
    return (
      <ConsoleError
        message={getStockErrorMessage(statusQuery.error, STATUS_ERROR_FALLBACK)}
        retrying={statusQuery.isFetching}
        onRetry={retry}
      />
    );
  }

  const status = statusQuery.data;

  if (!status) {
    return (
      <ConsoleError
        message="The proxy returned an empty status payload."
        retrying={statusQuery.isFetching}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4 px-[26px] pb-2 pt-4">
      <header>
        <h2 className="text-[25px] font-bold leading-tight text-[#101828]">
          API client console{' '}
          <span className="text-[13px] font-normal text-[#667085]">API 客户端 · upstream proxy</span>
        </h2>
        <p className="mt-1 max-w-[880px] text-[12px] leading-relaxed text-[#667085]">
          Operator view of the server-side proxy. The browser never receives the upstream token —
          only the proxy state, the cache metadata and the upstream call log.
        </p>
      </header>

      <ProxyBanner status={status} />
      <ConfigCard status={status} />

      <section aria-label="Dataset cache" className="grid gap-4 md:grid-cols-2">
        {status.cache.map((meta: StockCacheMeta) => (
          <CacheCard
            key={meta.key}
            meta={meta}
            pending={pending}
            onRefresh={refreshOne}
          />
        ))}
        {status.cache.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#eaecf0] bg-white px-5 py-6 text-[12px] text-[#667085]">
            The server reported no cached datasets.
          </p>
        ) : null}
      </section>

      <RefreshPanel pending={pending} outcome={outcome} onRefreshAll={refreshAll} />

      <EndpointTable endpoints={status.endpoints} />
      <CallTable calls={status.recentCalls} />
    </div>
  );
};

export default ApiConsole;
