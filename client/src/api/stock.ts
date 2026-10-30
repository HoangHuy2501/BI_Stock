/**
 * Typed API client for the self-hosted API.
 * Same public surface as the hosted build's client/src/api/stock.ts, but it uses
 * native fetch instead of the platform axios wrapper (no tenant headers needed).
 */
import type {
  ReserveDatasetResponse,
  StockCacheKey,
  StockCacheRefreshResponse,
  StockDetailResponse,
  StockOverviewData,
  StockOverviewApiResponse,
  StockSourceStatusResponse,
  WipDatasetResponse,
  WipTag,
  WipTagUpdateRequest,
} from '@shared/api.interface';

export interface StockDetailQuery {
  cust?: number;
  wh?: number;
  cat?: number;
  age?: number;
  year?: string;
  q?: string;
  sort?: 'usd' | 'age' | 'qty';
  dir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const url = (path: string): string => `${API_BASE_URL}${path}`;

const apiError = (status: number, body: ApiErrorBody | null): Error => {
  const error = new Error(body?.error?.message || `Request failed with status ${status}`);
  return Object.assign(error, { response: { status, data: body } });
};

const readBody = async (response: Response): Promise<ApiErrorBody | null> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiErrorBody;
  } catch {
    return null;
  }
};

const requestGet = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]: [string, unknown]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const query = search.toString();
  const response = await fetch(url(query ? `${path}?${query}` : path), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw apiError(response.status, await readBody(response));
  return (await response.json()) as T;
};

const requestWrite = async <T>(method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> => {
  const response = await fetch(url(path), {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!response.ok) throw apiError(response.status, await readBody(response));
  return (await response.json()) as T;
};

interface ApiErrorLike {
  response?: { status?: number; data?: ApiErrorBody };
}

export const getStockErrorMessage = (error: unknown, fallback: string): string => {
  const candidate = error as ApiErrorLike | null;
  const payload = candidate?.response?.data?.error;
  if (payload?.message) return payload.message;
  if (payload?.fieldErrors) {
    const messages: string[] = Object.values(payload.fieldErrors)
      .flat()
      .filter((item: string): boolean => Boolean(item));
    if (messages.length > 0) return messages[0];
  }
  return fallback;
};

export const stockApi = {
  overview: async (): Promise<StockOverviewData> => {
    const response = await requestGet<StockOverviewData | StockOverviewApiResponse>('/api/stock/overview');
    if ('success' in response) {
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Could not load overview');
      }
      return response.data;
    }
    return response;
  },

  detail: (query: StockDetailQuery): Promise<StockDetailResponse> =>
    requestGet<StockDetailResponse>('/api/stock/detail', { ...query }),

  wip: (): Promise<WipDatasetResponse> => requestGet<WipDatasetResponse>('/api/stock/wip'),

  reserve: (): Promise<ReserveDatasetResponse> => requestGet<ReserveDatasetResponse>('/api/stock/reserve'),

  sourceStatus: (): Promise<StockSourceStatusResponse> =>
    requestGet<StockSourceStatusResponse>('/api/stock/source/status'),

  refreshCache: (keys?: StockCacheKey[]): Promise<StockCacheRefreshResponse> =>
    requestWrite<StockCacheRefreshResponse>('POST', '/api/stock/cache/refresh', keys ? { keys } : {}),

  updateWipTag: (lotId: string, body: WipTagUpdateRequest): Promise<WipTag> =>
    requestWrite<WipTag>('PUT', `/api/stock/wip/lots/${lotId}/tag`, body),
};
