export const caltrekQueryKeys = {
  all: ["caltrek"] as const,
  profile: () => [...caltrekQueryKeys.all, "profile"] as const,
  logs: (date: string) => [...caltrekQueryKeys.all, "logs", date] as const,
  summary: (date: string) => [...caltrekQueryKeys.all, "summary", date] as const,
  summaries: (from?: string, to?: string) =>
    from && to
      ? ([...caltrekQueryKeys.all, "summaries", from, to] as const)
      : ([...caltrekQueryKeys.all, "summaries"] as const),
  streak: (date?: string) =>
    date
      ? ([...caltrekQueryKeys.all, "streak", date] as const)
      : ([...caltrekQueryKeys.all, "streak"] as const),
  library: () => [...caltrekQueryKeys.all, "library"] as const,
  weights: () => [...caltrekQueryKeys.all, "weights"] as const,
  search: (query: string) => [...caltrekQueryKeys.all, "search", query] as const,
};
