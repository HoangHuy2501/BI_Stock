import type {
  StockCacheKey,
  StockCacheMeta,
  StockSourceCall,
  StockSourceEndpoint,
} from '@shared/api.interface';

export type RefreshTarget = 'all' | StockCacheKey;

export interface RefreshFailureItem {
  key: string;
  message: string;
}

export interface RefreshSuccessOutcome {
  kind: 'success';
  refreshed: StockCacheMeta[];
  failures: RefreshFailureItem[];
}

export interface RefreshErrorOutcome {
  kind: 'error';
  message: string;
}

export type RefreshOutcome = RefreshSuccessOutcome | RefreshErrorOutcome;

export type EndpointAccess = 'read' | 'write';

export interface EndpointRow {
  name: string;
  method: string;
  path: string;
  description: string;
  access: EndpointAccess;
}

export interface Tone {
  label: string;
  className: string;
}

const numberFormatter = new Intl.NumberFormat('en-US');

export const formatNumber = (value: number): string => numberFormatter.format(Math.round(value));

export const formatSeconds = (seconds: number): string => `${formatNumber(Math.max(0, seconds))} s`;

export const formatDuration = (ms: number): string => `${formatNumber(Math.max(0, ms))} ms`;

export const formatTimestamp = (iso: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (value: number): string => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

export const cacheFillPercent = (meta: Pick<StockCacheMeta, 'ageSeconds' | 'ttlSeconds'>): number => {
  if (meta.ttlSeconds <= 0) return 100;
  const ratio = (Math.max(0, meta.ageSeconds) / meta.ttlSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
};

export const CACHE_ORIGIN_TONES: Record<StockCacheMeta['origin'], Tone> = {
  upstream: {
    label: 'Upstream',
    className: 'border-transparent bg-[#eef4ff] text-[#2f6fe4]',
  },
  snapshot: {
    label: 'Local snapshot',
    className: 'border-transparent bg-[#fff5e2] text-[#a86c00]',
  },
};

export const CALL_OUTCOME_TONES: Record<StockSourceCall['outcome'], Tone> = {
  ok: {
    label: 'Success',
    className: 'border-transparent bg-[#e9f7ef] text-[#1c8055]',
  },
  error: {
    label: 'Error',
    className: 'border-transparent bg-[#fdeceb] text-[#b8413a]',
  },
  skipped: {
    label: 'Skipped',
    className: 'border-transparent bg-[#fff5e2] text-[#a86c00]',
  },
};

export const ACCESS_LABELS: Record<EndpointAccess, string> = {
  read: 'Read',
  write: 'Write',
};

export const METHOD_CLASSES: Record<EndpointAccess, string> = {
  read: 'bg-[#eef4ff] text-[#2f6fe4]',
  write: 'bg-[#fff5e2] text-[#a86c00]',
};

const WRITE_ENDPOINTS: EndpointRow[] = [
  {
    name: 'Force cache refresh',
    method: 'POST',
    path: '/api/stock/cache/refresh',
    description:
      'Rebuild the selected datasets, bypassing the cache TTL. Signed-in operators only.',
    access: 'write',
  },
  {
    name: 'Update WIP tag',
    method: 'PUT',
    path: '/api/stock/wip/lots/:id/tag',
    description: 'Persist the WIP cause and blue flag of one lot for the signed-in operator.',
    access: 'write',
  },
];

export const buildEndpointRows = (endpoints: StockSourceEndpoint[]): EndpointRow[] => [
  ...endpoints.map((endpoint: StockSourceEndpoint): EndpointRow => ({
    name: endpoint.name,
    method: endpoint.method,
    path: endpoint.path,
    description: endpoint.description,
    access: 'read',
  })),
  ...WRITE_ENDPOINTS,
];
