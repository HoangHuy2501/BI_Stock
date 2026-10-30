import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import type { StockCacheKey, StockCacheMeta } from '@shared/api.interface';

import { SectionCard } from './SectionCard';
import {
  CACHE_ORIGIN_TONES,
  cacheFillPercent,
  formatDuration,
  formatNumber,
  formatSeconds,
  formatTimestamp,
  type RefreshTarget,
  type Tone,
} from './lib';

interface CacheCardProps {
  meta: StockCacheMeta;
  pending: RefreshTarget | null;
  onRefresh: (key: StockCacheKey) => void;
}

const LABEL_CLASS = 'text-[10.5px] font-semibold uppercase tracking-wide text-[#98a2b3]';

export const CacheCard = ({ meta, pending, onRefresh }: CacheCardProps) => {
  const tone: Tone = CACHE_ORIGIN_TONES[meta.origin];
  const percent: number = cacheFillPercent(meta);
  const isRefreshing: boolean = pending === meta.key;
  const disabled: boolean = pending !== null;

  return (
    <SectionCard
      title={meta.label}
      suffix={`cache key ${meta.key}`}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          aria-label={`Refresh the ${meta.label} cache`}
          onClick={() => onRefresh(meta.key)}
        >
          {isRefreshing ? <Spinner /> : <RefreshCw aria-hidden="true" />}
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      }
    >
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px] text-[#101828]">
        <div>
          <dt className={LABEL_CLASS}>Origin</dt>
          <dd className="mt-1">
            <Badge className={tone.className}>{tone.label}</Badge>
          </dd>
        </div>
        <div>
          <dt className={LABEL_CLASS}>Cache</dt>
          <dd className="mt-1 tabular-nums">{meta.hit ? 'Hit' : 'Miss'}</dd>
        </div>
        <div>
          <dt className={LABEL_CLASS}>Items</dt>
          <dd className="mt-1 tabular-nums">{formatNumber(meta.itemCount)} items</dd>
        </div>
        <div>
          <dt className={LABEL_CLASS}>Build time</dt>
          <dd className="mt-1 tabular-nums">{formatDuration(meta.buildMs)}</dd>
        </div>
        <div>
          <dt className={LABEL_CLASS}>Fetched at</dt>
          <dd className="mt-1 tabular-nums">{formatTimestamp(meta.fetchedAt)}</dd>
        </div>
        <div>
          <dt className={LABEL_CLASS}>Expires at</dt>
          <dd className="mt-1 tabular-nums">{formatTimestamp(meta.expiresAt)}</dd>
        </div>
      </dl>

      <div className="mt-3.5">
        <div className="flex items-baseline justify-between gap-3 text-[11.5px] text-[#667085]">
          <span>Cache age</span>
          <span className="tabular-nums">
            {formatSeconds(meta.ageSeconds)} of {formatSeconds(meta.ttlSeconds)} TTL
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Cache age for ${meta.label}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f2f4f7]"
        >
          <div
            className={`h-full rounded-full ${meta.stale ? 'bg-[#f0a020]' : 'bg-[#3b7bfa]'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {meta.stale ? (
        <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-[#fff5e2] px-3 py-2 text-[11.5px] leading-relaxed text-[#a86c00]">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>Stale: this cached payload is older than its TTL and is rebuilt on the next read.</span>
        </p>
      ) : null}

      {meta.upstreamError ? (
        <div className="mt-2.5 rounded-lg border border-[#e35b53]/30 bg-[#fdeceb] px-3 py-2 text-[11.5px] text-[#b8413a]">
          <p className="font-semibold">Upstream error</p>
          <p className="mt-0.5 break-words leading-relaxed">{meta.upstreamError}</p>
        </div>
      ) : null}
    </SectionCard>
  );
};
