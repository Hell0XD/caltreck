"use client";

import type { ProfileUpdateRequest, UserResponse } from "@caltrek/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AuthScreen } from "./auth-screen";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { FoodEditor, type FoodEditorValue } from "./food-editor";
import { EditLogSheet, FoodSheet } from "./food-log-sheet";
import { Toast } from "./toast";
import { useCaltrekMutations } from "@/hooks/use-caltrek-mutations";
import { useCaltrekQueries } from "@/hooks/use-caltrek-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CaltrekApiClient } from "@/lib/caltrek/api-client";
import { ErrorUtils } from "@/lib/caltrek/error-utils";
import { FoodMapper } from "@/lib/caltrek/food-mapper";
import { MealUtils } from "@/lib/caltrek/meal-utils";
import type {
  AuthSession,
  Food,
  LogEntry,
  MacroGoals,
  MacroTotals,
  MealType,
  QuantityMode,
} from "@/lib/caltrek/models";
import { NutritionUtils } from "@/lib/caltrek/nutrition-utils";
import { QuantityUtils } from "@/lib/caltrek/quantity-utils";
import { caltrekQueryKeys } from "@/lib/caltrek/query-keys";
import { SessionStorage } from "@/lib/caltrek/session-storage";

export type CaltrekContextValue = {
  user: UserResponse;
  goals: MacroGoals;
  logs: LogEntry[];
  totals: MacroTotals;
  query: string;
  setQuery: (query: string) => void;
  searchResults: Food[];
  recentFoods: Food[];
  favoriteFoods: Food[];
  dashboardLoading: boolean;
  searchLoading: boolean;
  openAddFood: (food: Food, meal?: MealType) => void;
  startEdit: (entry: LogEntry) => void;
  requestDelete: (entry: LogEntry) => void;
  findFoodByBarcode: (barcode: string) => Promise<Food>;
  toggleFavorite: (food: Food) => void;
  openCreateFood: () => void;
  openEditFood: (food: Food) => void;
  updateProfile: (profile: ProfileUpdateRequest) => Promise<void>;
  logout: () => void;
};

export const CaltrekContext = createContext<CaltrekContextValue | null>(null);

export function CaltrekProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>();
  const sessionRef = useRef<AuthSession | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("servings");
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [toast, setToast] = useState<string | null>(null);
  const [foodEditorOpen, setFoodEditorOpen] = useState(false);
  const [foodEditorTarget, setFoodEditorTarget] = useState<Food | null>(null);

  const persistSession = useCallback((nextSession: AuthSession | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    SessionStorage.write(nextSession);
  }, []);
  const api = useMemo(
    () => new CaltrekApiClient(() => sessionRef.current, persistSession),
    [persistSession],
  );

  useEffect(() => {
    const storedSession = SessionStorage.read();
    if (!storedSession) {
      setSession(null);
      return;
    }
    sessionRef.current = storedSession;
    void api.restore(storedSession).catch(() => persistSession(null));
  }, [api, persistSession]);

  const searchTerm = useDebouncedValue(query.trim(), 300);
  const queries = useCaltrekQueries(api, Boolean(session), searchTerm);
  const mutations = useCaltrekMutations(api, queries.date);
  const user = queries.profile.data ?? session?.user;
  const logs = queries.logs.data ?? [];
  const libraryFoods = queries.library.data ?? [];
  const searchFoods = queries.search.data ?? [];

  useEffect(() => {
    const error =
      queries.profile.error ?? queries.logs.error ?? queries.library.error ?? queries.search.error;
    if (error) {
      setToast(ErrorUtils.message(error));
    }
  }, [queries.library.error, queries.logs.error, queries.profile.error, queries.search.error]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function openAddFood(food: Food, nextMeal: MealType = "breakfast") {
    setSelectedFood(food);
    setQuantity(food.defaultServings ?? 1);
    setQuantityMode("servings");
    setMeal(nextMeal);
  }

  function startEdit(entry: LogEntry) {
    setEditingEntry(entry);
    setMeal(entry.meal);
    setQuantity(entry.quantity);
    setQuantityMode("servings");
  }

  function changeQuantityMode(nextMode: QuantityMode, food: Food) {
    if (nextMode !== quantityMode && food.servingSize > 0) {
      setQuantity(QuantityUtils.convert(food, quantity, quantityMode, nextMode));
      setQuantityMode(nextMode);
    }
  }

  async function saveSelectedFood() {
    if (!selectedFood) {
      return;
    }
    try {
      const amount = QuantityUtils.toApi(selectedFood, quantity, quantityMode);
      await mutations.createLog.mutateAsync({
        food: selectedFood,
        meal,
        quantity: amount.quantity,
        unit: amount.unit,
      });
      await mutations.saveLibraryFood.mutateAsync({
        food: selectedFood,
        favorite: selectedFood.favorite ?? false,
      });
      setSelectedFood(null);
      setToast(`${selectedFood.name} saved to ${MealUtils.label(meal).toLowerCase()}.`);
    } catch (error) {
      setToast(ErrorUtils.message(error));
    }
  }

  async function saveEdit() {
    if (!editingEntry) {
      return;
    }
    try {
      const amount = QuantityUtils.toApi(editingEntry.food, quantity, quantityMode);
      await mutations.updateLog.mutateAsync({
        entry: editingEntry,
        meal,
        quantity: amount.quantity,
        unit: amount.unit,
      });
      setEditingEntry(null);
      setToast("Log entry updated.");
    } catch (error) {
      setToast(ErrorUtils.message(error));
    }
  }

  async function removeEntry(entry: LogEntry) {
    try {
      await mutations.deleteLog.mutateAsync(entry);
      setDeleteTarget(null);
      setEditingEntry(null);
      setToast(`${entry.food.name} removed.`);
    } catch (error) {
      setToast(ErrorUtils.message(error));
    }
  }

  function toggleFavorite(food: Food) {
    void mutations.saveLibraryFood
      .mutateAsync({ food, favorite: !food.favorite })
      .then(() =>
        setToast(`${food.name} ${food.favorite ? "removed from" : "added to"} favorites.`),
      )
      .catch((error) => setToast(ErrorUtils.message(error)));
  }

  async function saveFood(value: FoodEditorValue) {
    try {
      const target = foodEditorTarget;
      const response = await mutations.saveFood.mutateAsync({ food: target, value });
      const savedFood = FoodMapper.food(response);
      setFoodEditorOpen(false);
      setFoodEditorTarget(null);
      if (target) {
        setToast(`${savedFood.name} updated.`);
      } else {
        await mutations.saveLibraryFood.mutateAsync({ food: savedFood, favorite: false });
        openAddFood(savedFood);
        setToast(`${savedFood.name} created.`);
      }
    } catch (error) {
      setToast(ErrorUtils.message(error));
    }
  }

  async function updateProfile(profile: ProfileUpdateRequest) {
    const updatedUser = await mutations.updateProfile.mutateAsync(profile);
    const currentSession = sessionRef.current;
    if (currentSession) {
      persistSession({ ...currentSession, user: updatedUser });
    }
    setToast("Account goals updated.");
  }

  async function logout() {
    await api.logout();
    queryClient.removeQueries({ queryKey: caltrekQueryKeys.all });
  }

  if (session === undefined) {
    return <AuthScreen loading />;
  }

  if (!session || !user) {
    return (
      <AuthScreen
        error={authError}
        onSubmit={async (mode, email, password, displayName) => {
          setAuthError(null);
          try {
            if (mode === "login") {
              await api.login(email, password);
            } else {
              await api.register(email, password, displayName);
            }
          } catch (error) {
            setAuthError(ErrorUtils.message(error));
          }
        }}
      />
    );
  }

  const searchResults = query.trim()
    ? FoodMapper.mergeLibraryFlags(searchFoods, libraryFoods)
    : libraryFoods;
  const value: CaltrekContextValue = {
    user,
    goals: FoodMapper.goals(user),
    logs,
    totals: NutritionUtils.totals(logs),
    query,
    setQuery,
    searchResults,
    recentFoods: libraryFoods,
    favoriteFoods: libraryFoods.filter((food) => food.favorite),
    dashboardLoading: queries.logs.isPending || queries.profile.isPending,
    searchLoading: query.trim() !== searchTerm || queries.search.isFetching,
    openAddFood,
    startEdit,
    requestDelete: setDeleteTarget,
    findFoodByBarcode: async (barcode) =>
      queryClient.fetchQuery({
        queryKey: [...caltrekQueryKeys.all, "barcode", barcode],
        queryFn: async () => FoodMapper.food(await api.findFoodByBarcode(barcode)),
        staleTime: 5 * 60_000,
      }),
    toggleFavorite,
    openCreateFood: () => {
      setFoodEditorTarget(null);
      setFoodEditorOpen(true);
    },
    openEditFood: (food) => {
      setFoodEditorTarget(food);
      setFoodEditorOpen(true);
    },
    updateProfile,
    logout,
  };

  return (
    <CaltrekContext.Provider value={value}>
      {children}
      <FoodSheet
        food={selectedFood}
        meal={meal}
        quantity={quantity}
        quantityMode={quantityMode}
        onMeal={setMeal}
        onQuantity={setQuantity}
        onQuantityMode={changeQuantityMode}
        onClose={() => setSelectedFood(null)}
        onEdit={(food) => {
          setSelectedFood(null);
          setFoodEditorTarget(food);
          setFoodEditorOpen(true);
        }}
        onSave={saveSelectedFood}
      />
      <EditLogSheet
        entry={editingEntry}
        meal={meal}
        quantity={quantity}
        quantityMode={quantityMode}
        onMeal={setMeal}
        onQuantity={setQuantity}
        onQuantityMode={changeQuantityMode}
        onClose={() => setEditingEntry(null)}
        onSave={saveEdit}
        onDelete={setDeleteTarget}
      />
      <ConfirmDeleteDialog
        entry={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeEntry}
      />
      <FoodEditor
        open={foodEditorOpen}
        food={foodEditorTarget}
        saving={mutations.saveFood.isPending}
        onClose={() => setFoodEditorOpen(false)}
        onSubmit={saveFood}
      />
      <Toast message={toast} />
    </CaltrekContext.Provider>
  );
}
