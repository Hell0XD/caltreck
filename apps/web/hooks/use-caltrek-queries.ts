"use client";

import { useQuery } from "@tanstack/react-query";
import { CaltrekApiClient } from "@/lib/caltrek/api-client";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { FoodMapper } from "@/lib/caltrek/food-mapper";
import { caltrekQueryKeys } from "@/lib/caltrek/query-keys";

export function useCaltrekQueries(
  api: CaltrekApiClient,
  authenticated: boolean,
  searchTerm: string,
) {
  const date = DateUtils.todayIso();
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

  return { profile, logs, library, search, date };
}
