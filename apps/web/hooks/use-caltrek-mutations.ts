"use client";

import type { CreateFoodRequest, ProfileUpdateRequest } from "@caltrek/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaltrekApiClient } from "@/lib/caltrek/api-client";
import type { Food, LogEntry, MealType } from "@/lib/caltrek/models";
import { caltrekQueryKeys } from "@/lib/caltrek/query-keys";

export function useCaltrekMutations(api: CaltrekApiClient, date: string) {
  const queryClient = useQueryClient();
  const invalidateDay = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: caltrekQueryKeys.logs(date) }),
      queryClient.invalidateQueries({ queryKey: caltrekQueryKeys.summary(date) }),
    ]);
  const invalidateLibrary = () =>
    queryClient.invalidateQueries({ queryKey: caltrekQueryKeys.library() });
  const invalidateFoods = () => queryClient.invalidateQueries({ queryKey: caltrekQueryKeys.all });

  return {
    updateProfile: useMutation({
      mutationFn: (profile: ProfileUpdateRequest) => api.updateProfile(profile),
      onSuccess: (user) => queryClient.setQueryData(caltrekQueryKeys.profile(), user),
    }),
    createLog: useMutation({
      mutationFn: ({
        food,
        meal,
        quantity,
        unit,
      }: {
        food: Food;
        meal: MealType;
        quantity: number;
        unit: string;
      }) => api.createLog(food.id, date, meal, quantity, unit),
      onSuccess: invalidateDay,
    }),
    updateLog: useMutation({
      mutationFn: ({
        entry,
        meal,
        quantity,
        unit,
      }: {
        entry: LogEntry;
        meal: MealType;
        quantity: number;
        unit: string;
      }) => api.updateLog(entry.id, date, meal, quantity, unit),
      onSuccess: invalidateDay,
    }),
    deleteLog: useMutation({
      mutationFn: (entry: LogEntry) => api.deleteLog(entry.id),
      onSuccess: invalidateDay,
    }),
    saveLibraryFood: useMutation({
      mutationFn: ({ food, favorite }: { food: Food; favorite: boolean }) =>
        api.saveLibraryFood(food.id, food.name, favorite, food.servingSize, food.servingUnit),
      onSuccess: invalidateLibrary,
    }),
    saveFood: useMutation({
      mutationFn: ({ food, value }: { food: Food | null; value: CreateFoodRequest }) =>
        food ? api.updateFood(food.id, value) : api.createFood(value),
      onSuccess: invalidateFoods,
    }),
  };
}
