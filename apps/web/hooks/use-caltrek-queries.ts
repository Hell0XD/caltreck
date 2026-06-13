"use client";

import type { DailySummaryResponse } from "@caltrek/api-client";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CaltrekApiClient } from "@/lib/caltrek/api-client";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { FoodMapper } from "@/lib/caltrek/food-mapper";
import { caltrekQueryKeys } from "@/lib/caltrek/query-keys";

export function useCaltrekQueries(
  api: CaltrekApiClient,
  authenticated: boolean,
  searchTerm: string,
  date: string,
  historyDates: string[],
) {
  const profile = useQuery({
    queryKey: caltrekQueryKeys.profile(),
    queryFn: () => api.getProfile(),
    enabled: authenticated,
  });
  const logs = useQuery({
    queryKey: caltrekQueryKeys.logs(date),
    queryFn: async () => (await api.getLogs(date)).map((log) => FoodMapper.log(log)),
    enabled: authenticated,
  });
  const library = useQuery({
    queryKey: caltrekQueryKeys.library(),
    queryFn: async () => (await api.getLibrary()).map((entry) => FoodMapper.library(entry)),
    enabled: authenticated,
  });
  const search = useQuery({
    queryKey: caltrekQueryKeys.search(searchTerm),
    queryFn: async () => (await api.searchFoods(searchTerm)).map((food) => FoodMapper.food(food)),
    enabled: authenticated && Boolean(searchTerm),
    staleTime: 60_000,
  });
  const historyQueries = useQueries({
    queries: historyDates.map((historyDate) => ({
      queryKey: caltrekQueryKeys.summary(historyDate),
      queryFn: () => api.getDailySummary(historyDate),
      enabled: authenticated && historyDate <= DateUtils.todayIso(),
      staleTime: 5 * 60_000,
    })),
  });
  const history = historyQueries.reduce<Record<string, DailySummaryResponse>>(
    (summaries, query, index) => {
      if (query.data) {
        summaries[historyDates[index]] = query.data;
      }
      return summaries;
    },
    {},
  );

  return {
    profile,
    logs,
    library,
    search,
    history,
    historyLoading: historyQueries.some((query) => query.isPending),
    historyError: historyQueries.find((query) => query.error)?.error,
  };
}
