export const caltrekQueryKeys = {
  all: ["caltrek"] as const,
  profile: () => [...caltrekQueryKeys.all, "profile"] as const,
  logs: (date: string) => [...caltrekQueryKeys.all, "logs", date] as const,
  library: () => [...caltrekQueryKeys.all, "library"] as const,
  search: (query: string) => [...caltrekQueryKeys.all, "search", query] as const,
};
