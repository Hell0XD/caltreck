"use client";

import type { DailySummaryResponse } from "@caltrek/api-client";
import { useQuery } from "@tanstack/react-query";
import { CaltrekApiClient } from "@/lib/caltrek/api-client";
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
  const weights = useQuery({
    queryKey: caltrekQueryKeys.weights(),
    queryFn: () => api.getWeights(),
    enabled: authenticated,
  });
  const search = useQuery({
    queryKey: caltrekQueryKeys.search(searchTerm),
    queryFn: async () => (await api.searchFoods(searchTerm)).map((food) => FoodMapper.food(food)),
    enabled: authenticated && Boolean(searchTerm),
    staleTime: 60_000,
  });
  const historyFrom = historyDates.at(0);
  const historyTo = historyDates.at(-1);
  const historyQuery = useQuery({
    queryKey: caltrekQueryKeys.summaries(historyFrom, historyTo),
    queryFn: () => api.getDailySummaries(historyFrom!, historyTo!),
    enabled: authenticated && Boolean(historyFrom && historyTo),
    staleTime: 5 * 60_000,
  });
  const streakQuery = useQuery({
    queryKey: caltrekQueryKeys.streak(date),
    queryFn: () => api.getDailyGoalStreak(date),
    enabled: authenticated,
  });
  const history = (historyQuery.data ?? []).reduce<Record<string, DailySummaryResponse>>(
    (summaries, summary) => {
      summaries[summary.logDate] = summary;
      return summaries;
    },
    {},
  );

  return {
    profile,
    logs,
    library,
    weights,
    search,
    streak: streakQuery.data,
    streakLoading: streakQuery.isPending,
    streakError: streakQuery.error,
    history,
    historyLoading: historyQuery.isPending,
    historyError: historyQuery.error,
  };
}
