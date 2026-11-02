import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { WipTagUpdateRequest } from "@shared/api.interface";

import { stockApi, type StockDetailQuery } from "../../../api/stock";

export const stockKeys = {
  all: ["stock"] as const,
  overview: (warehouse?: string) =>
    ["stock", "overview", warehouse ?? "all"] as const,
  wip: ["stock", "wip"] as const,
  reserve: ["stock", "reserve"] as const,
  source: ["stock", "source"] as const,
  detail: (query: StockDetailQuery) => ["stock", "detail", query] as const,
};

// useStockData.ts
export const useStockOverview = (warehouse?: string, threshold?: number) =>
  useQuery({
    queryKey: ["stock", "overview", warehouse ?? null, threshold ?? null],
    queryFn: () => stockApi.overview(warehouse),
    placeholderData: keepPreviousData,
  });

export const useWipDataset = () =>
  useQuery({ queryKey: stockKeys.wip, queryFn: () => stockApi.wip() });

export const useReserveDataset = () =>
  useQuery({ queryKey: stockKeys.reserve, queryFn: () => stockApi.reserve() });

export const useSourceStatus = () =>
  useQuery({
    queryKey: stockKeys.source,
    queryFn: () => stockApi.sourceStatus(),
  });

export const useStockDetail = (query: StockDetailQuery, enabled = true) =>
  useQuery({
    queryKey: stockKeys.detail(query),
    enabled,
    queryFn: () => stockApi.detail(query),
    placeholderData: keepPreviousData,
  });

export const useUpdateWipTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { lotId: string } & WipTagUpdateRequest) =>
      stockApi.updateWipTag(payload.lotId, {
        cause: payload.cause,
        blueFlag: payload.blueFlag,
        mark: payload.mark,
        made_lot: payload.made_lot,
        moNo: payload.moNo,
        goodsNo: payload.goodsNo,
        reason: payload.reason,
      }),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.wip }),
  });
};

export const useRefreshCache = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keys?: ("reserve" | "wip")[]) => stockApi.refreshCache(keys),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};
