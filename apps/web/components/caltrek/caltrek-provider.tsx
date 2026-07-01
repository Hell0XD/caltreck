"use client";

import type {
  DailySummaryResponse,
  ProfileUpdateRequest,
  UserResponse,
  UserWeightResponse,
} from "@caltrek/api-client";
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
import { usePathname, useRouter } from "next/navigation";
import { AuthScreen } from "./auth-screen";
import { AppTour } from "./app-tour";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { FoodEditor, type FoodEditorValue } from "./food-editor";
import { EditLogSheet, FoodSheet } from "./food-log-sheet";
import { OnboardingScreen } from "./onboarding-screen";
import { Toast } from "./toast";
import { useCaltrekMutations } from "@/hooks/use-caltrek-mutations";
import { useCaltrekQueries } from "@/hooks/use-caltrek-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CaltrekApiClient } from "@/lib/caltrek/api-client";
import { DateUtils } from "@/lib/caltrek/date-utils";
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
  selectedDate: string;
  selectDate: (date: string) => void;
  historyMonth: string;
  setHistoryMonth: (date: string) => void;
  history: Record<string, DailySummaryResponse>;
  historyLoading: boolean;
  weights: UserWeightResponse[];
  query: string;
  setQuery: (query: string) => void;
  searchResults: Food[];
  recentFoods: Food[];
  favoriteFoods: Food[];
  dashboardLoading: boolean;
  searchLoading: boolean;
  openFoodSearch: (meal?: MealType) => void;
  openAddFood: (food: Food, meal?: MealType) => void;
  startEdit: (entry: LogEntry) => void;
  requestDelete: (entry: LogEntry) => void;
  findFoodByBarcode: (barcode: string) => Promise<Food>;
  toggleFavorite: (food: Food) => void;
  openCreateFood: () => void;
  openEditFood: (food: Food) => void;
  updateProfile: (profile: ProfileUpdateRequest) => Promise<void>;
  completeOnboarding: (profile: ProfileUpdateRequest, weightKg: number) => Promise<void>;
  saveWeight: (measuredOn: string, weightKg: number) => Promise<void>;
  deleteWeight: (id: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  openOnboardingHelper: () => void;
  replayAppTour: () => void;
  logout: () => void;
};

export const CaltrekContext = createContext<CaltrekContextValue | null>(null);

export function CaltrekProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>();
  const sessionRef = useRef<AuthSession | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => DateUtils.todayIso());
  const [historyMonth, setHistoryMonthState] = useState(() =>
    DateUtils.monthStart(DateUtils.todayIso()),
  );
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("servings");
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [pendingSearchMeal, setPendingSearchMeal] = useState<MealType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [foodEditorOpen, setFoodEditorOpen] = useState(false);
  const [foodEditorTarget, setFoodEditorTarget] = useState<Food | null>(null);
  const [tourRun, setTourRun] = useState(false);
  const [tourSeenThisSession, setTourSeenThisSession] = useState(false);
  const [onboardingHelperOpen, setOnboardingHelperOpen] = useState(false);

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
  const historyDates = useMemo(
    () => DateUtils.daysInMonth(historyMonth).filter((date) => !DateUtils.isFuture(date)),
    [historyMonth],
  );
  const queries = useCaltrekQueries(api, Boolean(session), searchTerm, selectedDate, historyDates);
  const mutations = useCaltrekMutations(api, selectedDate);
  const user = queries.profile.data ?? session?.user;
  const logs = queries.logs.data ?? [];
  const libraryFoods = queries.library.data ?? [];
  const searchFoods = queries.search.data ?? [];

  useEffect(() => {
    const error =
      queries.profile.error ??
      queries.logs.error ??
      queries.library.error ??
      queries.weights.error ??
      queries.search.error ??
      queries.historyError;
    if (error) {
      setToast(ErrorUtils.message(error));
    }
  }, [
    queries.historyError,
    queries.library.error,
    queries.logs.error,
    queries.profile.error,
    queries.search.error,
    queries.weights.error,
  ]);

  useEffect(() => {
    if (
      user?.onboardingCompleted === true &&
      user.appTourCompleted !== true &&
      pathname?.startsWith("/journal") &&
      !tourRun &&
      !tourSeenThisSession
    ) {
      setTourRun(true);
      setTourSeenThisSession(true);
    }
  }, [pathname, tourRun, tourSeenThisSession, user?.appTourCompleted, user?.onboardingCompleted]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function openFoodSearch(nextMeal?: MealType) {
    setPendingSearchMeal(nextMeal ?? null);
    router.push("/search");
  }

  function openAddFood(food: Food, nextMeal?: MealType) {
    setSelectedFood(food);
    setQuantity(food.defaultServings ?? 1);
    setQuantityMode("servings");
    setMeal(nextMeal ?? pendingSearchMeal ?? "breakfast");
    setPendingSearchMeal(null);
  }

  function selectDate(date: string) {
    if (DateUtils.isFuture(date)) {
      return;
    }
    setSelectedDate(date);
    setHistoryMonthState(DateUtils.monthStart(date));
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

  async function completeOnboarding(profile: ProfileUpdateRequest, weightKg: number) {
    await mutations.saveWeight.mutateAsync({ measuredOn: DateUtils.todayIso(), weightKg });
    const updatedUser = await mutations.updateProfile.mutateAsync(profile);
    const currentSession = sessionRef.current;
    if (currentSession) {
      persistSession({ ...currentSession, user: updatedUser });
    }
    router.replace("/journal");
    setToast("Your targets are ready.");
  }

  async function completeOnboardingHelper(profile: ProfileUpdateRequest, weightKg: number) {
    await mutations.saveWeight.mutateAsync({ measuredOn: DateUtils.todayIso(), weightKg });
    const updatedUser = await mutations.updateProfile.mutateAsync({
      ...profile,
      onboardingCompleted: user?.onboardingCompleted ?? true,
    });
    const currentSession = sessionRef.current;
    if (currentSession) {
      persistSession({ ...currentSession, user: updatedUser });
    }
    setOnboardingHelperOpen(false);
    router.replace("/account");
    setToast("Targets recalibrated.");
  }

  async function saveWeight(measuredOn: string, weightKg: number) {
    await mutations.saveWeight.mutateAsync({ measuredOn, weightKg });
    setToast("Weight entry saved.");
  }

  async function deleteWeight(id: string) {
    await mutations.deleteWeight.mutateAsync(id);
    setToast("Weight entry deleted.");
  }

  async function deleteAccount(password: string) {
    await mutations.deleteAccount.mutateAsync(password);
    queryClient.removeQueries({ queryKey: caltrekQueryKeys.all });
  }

  async function completeAppTour() {
    setTourRun(false);
    setTourSeenThisSession(true);
    if (user?.appTourCompleted) {
      return;
    }
    if (!user) {
      return;
    }
    try {
      const updatedUser = await mutations.updateProfile.mutateAsync({
        firstName: user.firstName,
        lastName: user.lastName,
        timezone: user.timezone,
        appTourCompleted: true,
      });
      const currentSession = sessionRef.current;
      if (currentSession) {
        persistSession({ ...currentSession, user: updatedUser });
      }
    } catch (error) {
      setToast(ErrorUtils.message(error));
    }
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
        onSubmit={async (mode, email, password, firstName, lastName) => {
          setAuthError(null);
          try {
            if (mode === "login") {
              await api.login(email, password);
            } else {
              await api.register(email, password, firstName, lastName);
            }
          } catch (error) {
            setAuthError(ErrorUtils.message(error));
          }
        }}
      />
    );
  }

  if (user.onboardingCompleted !== true) {
    return (
      <>
        <OnboardingScreen
          user={user}
          goals={FoodMapper.goals(user)}
          saving={mutations.updateProfile.isPending || mutations.saveWeight.isPending}
          onComplete={completeOnboarding}
        />
        <Toast message={toast} />
      </>
    );
  }

  if (onboardingHelperOpen) {
    return (
      <>
        <OnboardingScreen
          user={user}
          goals={FoodMapper.goals(user)}
          saving={mutations.updateProfile.isPending || mutations.saveWeight.isPending}
          title="Recalibrate goals"
          onCancel={() => {
            setOnboardingHelperOpen(false);
            router.replace("/account");
          }}
          onComplete={completeOnboardingHelper}
        />
        <Toast message={toast} />
      </>
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
    selectedDate,
    selectDate,
    historyMonth,
    setHistoryMonth: (date) => setHistoryMonthState(DateUtils.monthStart(date)),
    history: queries.history,
    historyLoading: queries.historyLoading,
    weights: queries.weights.data ?? [],
    query,
    setQuery,
    searchResults,
    recentFoods: libraryFoods,
    favoriteFoods: libraryFoods.filter((food) => food.favorite),
    dashboardLoading: queries.logs.isPending || queries.profile.isPending,
    searchLoading: query.trim() !== searchTerm || queries.search.isFetching,
    openFoodSearch,
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
    completeOnboarding,
    saveWeight,
    deleteWeight,
    deleteAccount,
    openOnboardingHelper: () => setOnboardingHelperOpen(true),
    replayAppTour: () => {
      setTourSeenThisSession(true);
      setTourRun(true);
    },
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
        date={selectedDate}
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
      <AppTour run={tourRun} onDone={completeAppTour} />
      <Toast message={toast} />
    </CaltrekContext.Provider>
  );
}
