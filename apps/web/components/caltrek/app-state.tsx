"use client";

import {
  Api,
  type AuthResponse,
  type DailyLogResponse,
  type FoodResponse,
  type ProfileUpdateRequest,
  type UserLibraryResponse,
  type UserResponse,
} from "@caltrek/api-client";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronLeft, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { Drawer } from "vaul";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Food, type LogEntry, type MealType, macroFor, mealMeta } from "./types";
import { AuthScreen } from "./auth-screen";
import { FoodEditor, type FoodEditorValue } from "./food-editor";
import { cn } from "@/lib/utils";

type ApiResult<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
};

type MacroTotals = Record<"calories" | "protein" | "carbs" | "fat", number>;
type QuantityMode = "servings" | "amount" | "package";
export type MacroGoals = Record<"calories" | "protein" | "carbs" | "fat", number>;

type CaltrekState = {
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

const SESSION_KEY = "caltrek.session.v1";
const api = new Api();
const CaltrekContext = createContext<CaltrekState | null>(null);

export function useCaltrek() {
  const context = useContext(CaltrekContext);
  if (!context) {
    throw new Error("useCaltrek must be used inside CaltrekProvider");
  }
  return context;
}

export function CaltrekProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const sessionRef = useRef<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [libraryFoods, setLibraryFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("servings");
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [foodEditorOpen, setFoodEditorOpen] = useState(false);
  const [foodEditorTarget, setFoodEditorTarget] = useState<Food | null>(null);
  const [foodEditorSaving, setFoodEditorSaving] = useState(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const persistSession = useCallback((nextSession: AuthSession | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    if (nextSession) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      setLogs([]);
      setLibraryFoods([]);
      setSearchResults([]);
    }
  }, []);

  const saveAuthResponse = useCallback(
    (response: AuthResponse) => {
      persistSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      });
    },
    [persistSession],
  );

  const refreshStoredSession = useCallback(
    async (stored: AuthSession) => {
      setAuthLoading(true);
      try {
        const result = (await api.authentication.refreshSession({
          body: { refreshToken: stored.refreshToken },
        })) as ApiResult<AuthResponse>;
        if (result.data) {
          saveAuthResponse(result.data);
        } else {
          persistSession(null);
        }
      } catch {
        persistSession(null);
      } finally {
        setAuthLoading(false);
      }
    },
    [persistSession, saveAuthResponse],
  );

  useEffect(() => {
    const stored = readStoredSession();
    if (!stored) {
      setAuthLoading(false);
      setDashboardLoading(false);
      return;
    }
    void refreshStoredSession(stored);
  }, [refreshStoredSession]);

  const handleUnauthorized = useCallback(async () => {
    const current = sessionRef.current;
    if (!current?.refreshToken) {
      throw new Error("Please sign in again.");
    }
    const result = (await api.authentication.refreshSession({
      body: { refreshToken: current.refreshToken },
    })) as ApiResult<AuthResponse>;
    if (result.error || !result.data) {
      persistSession(null);
      throw new Error("Please sign in again.");
    }
    saveAuthResponse(result.data);
    return result.data.accessToken;
  }, [persistSession, saveAuthResponse]);

  const runAuthed = useCallback(
    async <T,>(request: (token: string) => Promise<ApiResult<T>>) => {
      const current = sessionRef.current;
      if (!current?.accessToken) {
        throw new Error("Please sign in first.");
      }
      let result = await request(current.accessToken);
      if (result.response?.status === 401) {
        const refreshedToken = await handleUnauthorized();
        result = await request(refreshedToken);
      }
      if (result.error || (result.response && !result.response.ok)) {
        throw new Error(errorMessage(result.error));
      }
      return result.data as T;
    },
    [handleUnauthorized],
  );

  const loadLibrary = useCallback(async () => {
    const entries = await runAuthed(
      (token) =>
        api.userLibrary.listUserLibraryEntries({ auth: token }) as Promise<
          ApiResult<UserLibraryResponse[]>
        >,
    );
    setLibraryFoods(entries.map(mapLibraryEntry));
  }, [runAuthed]);

  const loadProfile = useCallback(async () => {
    const user = await runAuthed(
      (token) => api.users.getCurrentUser({ auth: token }) as Promise<ApiResult<UserResponse>>,
    );
    const current = sessionRef.current;
    if (current) {
      persistSession({ ...current, user });
    }
  }, [persistSession, runAuthed]);

  const loadLogs = useCallback(async () => {
    const entries = await runAuthed(
      (token) =>
        api.dailyLogs.listDailyLogs({
          auth: token,
          query: { date: todayIsoDate() },
        }) as Promise<ApiResult<DailyLogResponse[]>>,
    );
    setLogs(entries.map((entry) => mapLogEntry(entry)));
  }, [runAuthed]);

  const loadAppData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      await Promise.all([loadProfile(), loadLogs(), loadLibrary()]);
    } catch (error) {
      setToast(errorMessage(error));
    } finally {
      setDashboardLoading(false);
    }
  }, [loadLibrary, loadLogs, loadProfile]);

  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    void loadAppData();
  }, [accessToken, loadAppData]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const term = query.trim();
    if (!session || !term) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeout = window.setTimeout(() => {
      void runAuthed(
        (token) =>
          api.foods.searchFoods({
            auth: token,
            query: { query: term, limit: 25 },
          }) as Promise<ApiResult<FoodResponse[]>>,
      )
        .then((foods) => setSearchResults(foods.map(mapFoodResponse)))
        .catch((error) => setToast(errorMessage(error)))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query, runAuthed, session]);

  const totals = useMemo(
    () => ({
      calories: macroFor(logs, "calories"),
      protein: macroFor(logs, "protein"),
      carbs: macroFor(logs, "carbs"),
      fat: macroFor(logs, "fat"),
    }),
    [logs],
  );

  async function login(email: string, password: string) {
    setAuthError(null);
    const result = (await api.authentication.loginUser({
      body: { email, password },
    })) as ApiResult<AuthResponse>;
    if (result.error || !result.data) {
      throw new Error(errorMessage(result.error));
    }
    saveAuthResponse(result.data);
  }

  async function register(email: string, password: string, displayName: string) {
    setAuthError(null);
    const result = (await api.authentication.registerUser({
      body: {
        email,
        password,
        displayName: displayName || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    })) as ApiResult<AuthResponse>;
    if (result.error || !result.data) {
      throw new Error(errorMessage(result.error));
    }
    saveAuthResponse(result.data);
  }

  async function logout() {
    const current = sessionRef.current;
    persistSession(null);
    setDashboardLoading(false);
    if (current?.accessToken) {
      await api.authentication.logoutUser({ auth: current.accessToken });
    }
  }

  async function updateProfile(profile: ProfileUpdateRequest) {
    const user = await runAuthed(
      (token) =>
        api.users.updateCurrentUser({
          auth: token,
          body: profile,
        }) as Promise<ApiResult<UserResponse>>,
    );
    const current = sessionRef.current;
    if (current) {
      persistSession({ ...current, user });
    }
    setToast("Account goals updated.");
  }

  function openAddFood(food: Food, nextMeal: MealType = "breakfast") {
    setSelectedFood(food);
    setQuantity(food.defaultServings ?? 1);
    setQuantityMode("servings");
    setMeal(nextMeal);
  }

  async function saveSelectedFood() {
    if (!selectedFood) {
      return;
    }
    try {
      const amount = toApiAmount(selectedFood, quantity, quantityMode);
      const response = await runAuthed(
        (token) =>
          api.dailyLogs.createDailyLog({
            auth: token,
            body: {
              foodId: selectedFood.id,
              logDate: todayIsoDate(),
              mealType: toApiMeal(meal),
              quantity: amount.quantity,
              unit: amount.unit,
            },
          }) as Promise<ApiResult<DailyLogResponse>>,
      );
      setLogs((current) => [...current, mapLogEntry(response, selectedFood)]);
      setSelectedFood(null);
      setToast(`${selectedFood.name} saved to ${mealMeta[meal].label.toLowerCase()}.`);
      await saveLibraryFood(selectedFood, selectedFood.favorite ?? false);
    } catch (error) {
      setToast(errorMessage(error));
    }
  }

  function startEdit(entry: LogEntry) {
    setEditingEntry(entry);
    setMeal(entry.meal);
    setQuantity(entry.quantity);
    setQuantityMode("servings");
  }

  async function saveEdit() {
    if (!editingEntry) {
      return;
    }
    try {
      const amount = toApiAmount(editingEntry.food, quantity, quantityMode);
      const response = await runAuthed(
        (token) =>
          api.dailyLogs.updateDailyLog({
            auth: token,
            path: { id: editingEntry.id },
            body: {
              logDate: todayIsoDate(),
              mealType: toApiMeal(meal),
              quantity: amount.quantity,
              unit: amount.unit,
            },
          }) as Promise<ApiResult<DailyLogResponse>>,
      );
      setLogs((current) =>
        current.map((entry) =>
          entry.id === editingEntry.id ? mapLogEntry(response, editingEntry.food) : entry,
        ),
      );
      setEditingEntry(null);
      setToast("Log entry updated.");
    } catch (error) {
      setToast(errorMessage(error));
    }
  }

  async function removeEntry(entry: LogEntry) {
    try {
      await runAuthed(
        (token) =>
          api.dailyLogs.deleteDailyLog({
            auth: token,
            path: { id: entry.id },
          }) as Promise<ApiResult<Record<string, never>>>,
      );
      setLogs((current) => current.filter((item) => item.id !== entry.id));
      setDeleteTarget(null);
      setEditingEntry(null);
      setToast(`${entry.food.name} removed.`);
    } catch (error) {
      setToast(errorMessage(error));
    }
  }

  async function saveLibraryFood(food: Food, favorite: boolean) {
    const entry = await runAuthed(
      (token) =>
        api.userLibrary.saveUserLibraryEntry({
          auth: token,
          body: {
            foodId: food.id,
            label: food.name,
            favorite,
            defaultQuantity: food.servingSize,
            defaultUnit: food.servingUnit,
          },
        }) as Promise<ApiResult<UserLibraryResponse>>,
    );
    const nextFood = mapLibraryEntry(entry);
    if (!nextFood) {
      return;
    }
    setLibraryFoods((current) => [nextFood, ...current.filter((item) => item.id !== nextFood.id)]);
  }

  async function findFoodByBarcode(barcode: string) {
    const food = await runAuthed(
      (token) =>
        api.foods.findFoodByBarcode({
          auth: token,
          path: { barcode },
        }) as Promise<ApiResult<FoodResponse>>,
    );
    return mapFoodResponse(food);
  }

  function toggleFavorite(food: Food) {
    void saveLibraryFood(food, !food.favorite)
      .then(() =>
        setToast(`${food.name} ${food.favorite ? "removed from" : "added to"} favorites.`),
      )
      .catch((error) => setToast(errorMessage(error)));
  }

  function openCreateFood() {
    setFoodEditorTarget(null);
    setFoodEditorOpen(true);
  }

  function openEditFood(food: Food) {
    setFoodEditorTarget(food);
    setFoodEditorOpen(true);
  }

  async function saveFoodEditor(value: FoodEditorValue) {
    setFoodEditorSaving(true);
    try {
      const response = foodEditorTarget
        ? await runAuthed(
            (token) =>
              api.foods.updateFood({
                auth: token,
                path: { id: foodEditorTarget.id },
                body: value,
              }) as Promise<ApiResult<FoodResponse>>,
          )
        : await runAuthed(
            (token) =>
              api.foods.createFood({
                auth: token,
                body: value,
              }) as Promise<ApiResult<FoodResponse>>,
          );
      const savedFood = mapFoodResponse(response);
      replaceFood(savedFood);
      setFoodEditorOpen(false);
      setFoodEditorTarget(null);
      if (foodEditorTarget) {
        setToast(`${savedFood.name} updated.`);
      } else {
        await saveLibraryFood(savedFood, false);
        openAddFood(savedFood);
        setToast(`${savedFood.name} created.`);
      }
    } catch (error) {
      setToast(errorMessage(error));
    } finally {
      setFoodEditorSaving(false);
    }
  }

  function replaceFood(food: Food) {
    setSearchResults((current) =>
      current.map((item) => (item.id === food.id ? { ...food, favorite: item.favorite } : item)),
    );
    setLibraryFoods((current) =>
      current.map((item) =>
        item.id === food.id
          ? { ...food, favorite: item.favorite, recent: true, libraryEntryId: item.libraryEntryId }
          : item,
      ),
    );
    setLogs((current) =>
      current.map((entry) =>
        entry.food.id === food.id
          ? { ...entry, food: { ...food, favorite: entry.food.favorite } }
          : entry,
      ),
    );
    setSelectedFood((current) => (current?.id === food.id ? food : current));
  }

  function changeQuantityMode(nextMode: QuantityMode, food: Food) {
    if (nextMode === quantityMode || food.servingSize <= 0) {
      return;
    }
    const currentAmount = toApiAmount(food, quantity, quantityMode).quantity;
    setQuantity(
      nextMode === "amount"
        ? currentAmount
        : nextMode === "package"
          ? Number((currentAmount / (food.packageQuantity ?? currentAmount)).toFixed(2))
          : Number((currentAmount / food.servingSize).toFixed(2)),
    );
    setQuantityMode(nextMode);
  }

  const recentFoods = useMemo(() => libraryFoods, [libraryFoods]);
  const favoriteFoods = useMemo(() => libraryFoods.filter((food) => food.favorite), [libraryFoods]);
  const value: CaltrekState | null = session
    ? {
        user: session.user,
        goals: userGoals(session.user),
        logs,
        totals,
        query,
        setQuery,
        searchResults: query.trim() ? mergeFoodFlags(searchResults, libraryFoods) : libraryFoods,
        recentFoods,
        favoriteFoods,
        dashboardLoading,
        searchLoading,
        openAddFood,
        startEdit,
        requestDelete: setDeleteTarget,
        findFoodByBarcode,
        toggleFavorite,
        openCreateFood,
        openEditFood,
        updateProfile,
        logout,
      }
    : null;

  if (authLoading) {
    return <AuthScreen loading />;
  }

  if (!value) {
    return (
      <AuthScreen
        error={authError}
        onSubmit={async (mode, email, password, displayName) => {
          try {
            if (mode === "login") {
              await login(email, password);
            } else {
              await register(email, password, displayName);
            }
          } catch (error) {
            setAuthError(errorMessage(error));
          }
        }}
      />
    );
  }

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
          openEditFood(food);
        }}
        onSave={saveSelectedFood}
      />
      <EditSheet
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
      <ConfirmDialog
        entry={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeEntry}
      />
      <FoodEditor
        open={foodEditorOpen}
        food={foodEditorTarget}
        saving={foodEditorSaving}
        onClose={() => setFoodEditorOpen(false)}
        onSubmit={saveFoodEditor}
      />
      <Toast message={toast} />
    </CaltrekContext.Provider>
  );
}

function FoodSheet({
  food,
  meal,
  quantity,
  quantityMode,
  onMeal,
  onQuantity,
  onQuantityMode,
  onClose,
  onEdit,
  onSave,
}: {
  food: Food | null;
  meal: MealType;
  quantity: number;
  quantityMode: QuantityMode;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onQuantityMode: (mode: QuantityMode, food: Food) => void;
  onClose: () => void;
  onEdit: (food: Food) => void;
  onSave: () => void;
}) {
  return (
    <Drawer.Root open={Boolean(food)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] max-w-md overflow-hidden rounded-t-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl outline-none lg:max-w-lg">
          <SheetHandle />
          {food && (
            <SheetBody
              title={food.name}
              subtitle={`${food.brand} - ${food.serving}`}
              meal={meal}
              quantity={quantity}
              quantityMode={quantityMode}
              food={food}
              onMeal={onMeal}
              onQuantity={onQuantity}
              onQuantityMode={onQuantityMode}
              onClose={onClose}
              footer={
                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <Button variant="outline" size="lg" onClick={() => onEdit(food)} className="px-3">
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button size="lg" onClick={onSave}>
                    <Check className="size-4" />
                    Save food
                  </Button>
                </div>
              }
            >
              <NutritionDetails food={food} quantity={quantity} quantityMode={quantityMode} />
            </SheetBody>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function EditSheet({
  entry,
  meal,
  quantity,
  quantityMode,
  onMeal,
  onQuantity,
  onQuantityMode,
  onClose,
  onSave,
  onDelete,
}: {
  entry: LogEntry | null;
  meal: MealType;
  quantity: number;
  quantityMode: QuantityMode;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onQuantityMode: (mode: QuantityMode, food: Food) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (entry: LogEntry) => void;
}) {
  return (
    <Drawer.Root open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] max-w-md overflow-hidden rounded-t-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl outline-none lg:max-w-lg">
          <SheetHandle />
          {entry && (
            <SheetBody
              title={entry.food.name}
              subtitle="Edit log entry"
              meal={meal}
              quantity={quantity}
              quantityMode={quantityMode}
              food={entry.food}
              onMeal={onMeal}
              onQuantity={onQuantity}
              onQuantityMode={onQuantityMode}
              onClose={onClose}
              footer={
                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => onDelete(entry)}
                    className="px-3"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button size="lg" onClick={onSave}>
                    <Check className="size-4" />
                    Update entry
                  </Button>
                </div>
              }
            >
              <NutritionDetails food={entry.food} quantity={quantity} quantityMode={quantityMode} />
            </SheetBody>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SheetBody({
  title,
  subtitle,
  food,
  meal,
  quantity,
  quantityMode,
  children,
  footer,
  onMeal,
  onQuantity,
  onQuantityMode,
  onClose,
}: {
  title: string;
  subtitle: string;
  food: Food;
  meal: MealType;
  quantity: number;
  quantityMode: QuantityMode;
  children: React.ReactNode;
  footer: React.ReactNode;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onQuantityMode: (mode: QuantityMode, food: Food) => void;
  onClose: () => void;
}) {
  const supportsAmount = food.servingUnit === "g" || food.servingUnit === "ml";
  const supportsPackage = Boolean(food.packageQuantity && food.packageUnit);
  const step = quantityMode === "servings" ? 0.25 : quantityMode === "package" ? 0.25 : 1;
  const minimum = quantityMode === "servings" || quantityMode === "package" ? 0.25 : 0.01;
  const quantityLabel =
    quantityMode === "servings"
      ? "Serving quantity"
      : quantityMode === "package"
        ? "Whole product quantity"
        : `Amount in ${food.servingUnit}`;

  return (
    <div className="max-h-[calc(92dvh-3.5rem)] space-y-5 overflow-y-auto">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" aria-label="Close" title="Close" onClick={onClose}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <Drawer.Title className="truncate text-xl font-semibold">{title}</Drawer.Title>
          <Drawer.Description className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
            {subtitle}
          </Drawer.Description>
        </div>
      </div>
      {children}
      <div>
        <p className="mb-2 text-sm font-semibold">Meal</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(mealMeta) as MealType[]).map((item) => (
            <Button
              key={item}
              type="button"
              variant={meal === item ? "secondary" : "outline"}
              onClick={() => onMeal(item)}
              className={cn("h-11 px-2 text-xs", meal === item && "text-primary")}
            >
              {mealMeta[item].label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            {quantityMode === "servings"
              ? "Servings"
              : quantityMode === "package"
                ? "Whole product"
                : "Amount"}
          </p>
          {(supportsAmount || supportsPackage) && (
            <div
              className={cn(
                "grid rounded-[var(--radius)] bg-[var(--surface)] p-1",
                supportsAmount && supportsPackage ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              <Button
                type="button"
                size="sm"
                variant={quantityMode === "servings" ? "secondary" : "ghost"}
                onClick={() => onQuantityMode("servings", food)}
              >
                Servings
              </Button>
              <Button
                type="button"
                size="sm"
                variant={quantityMode === "amount" ? "secondary" : "ghost"}
                onClick={() => onQuantityMode("amount", food)}
                hidden={!supportsAmount}
              >
                {food.servingUnit === "g" ? "Grams" : "Milliliters"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={quantityMode === "package" ? "secondary" : "ghost"}
                onClick={() => onQuantityMode("package", food)}
                hidden={!supportsPackage}
              >
                Whole product
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--surface)] p-3">
          <Button
            variant="outline"
            size="icon"
            aria-label={`Decrease ${quantityLabel.toLowerCase()}`}
            title={`Decrease ${quantityLabel.toLowerCase()}`}
            onClick={() => onQuantity(Math.max(minimum, Number((quantity - step).toFixed(2))))}
          >
            <Minus className="size-4" />
          </Button>
          <div className="relative min-w-0">
            <Input
              aria-label={quantityLabel}
              value={quantity}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isNaN(next) && next > 0) {
                  onQuantity(next);
                }
              }}
              inputMode="decimal"
              className={cn(
                "h-11 text-center text-lg font-semibold",
                quantityMode !== "servings" && "pr-10",
              )}
            />
            {quantityMode !== "servings" && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-[var(--muted-foreground)]">
                {quantityMode === "package" ? "x" : food.servingUnit}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Increase ${quantityLabel.toLowerCase()}`}
            title={`Increase ${quantityLabel.toLowerCase()}`}
            onClick={() => onQuantity(Number((quantity + step).toFixed(2)))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      {footer}
    </div>
  );
}

function SheetHandle() {
  return <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border)]" />;
}

function NutritionDetails({
  food,
  quantity,
  quantityMode,
}: {
  food: Food;
  quantity: number;
  quantityMode: QuantityMode;
}) {
  const servingMultiplier = toApiAmount(food, quantity, quantityMode).quantity / food.servingSize;
  const perHundredLabel = food.servingUnit === "ml" ? "Per 100 ml" : "Per 100 g";

  return (
    <div className="space-y-2">
      <NutritionRow label={`Per serving (${food.serving})`} values={macroValues(food)} />
      <NutritionRow
        label={perHundredLabel}
        values={{
          calories: food.caloriesPer100g,
          protein: food.proteinPer100g,
          carbs: food.carbsPer100g,
          fat: food.fatPer100g,
        }}
      />
      <NutritionRow
        label="Selected total"
        values={{
          calories: food.calories * servingMultiplier,
          protein: food.protein * servingMultiplier,
          carbs: food.carbs * servingMultiplier,
          fat: food.fat * servingMultiplier,
        }}
        selected
      />
    </div>
  );
}

function NutritionRow({
  label,
  values,
  selected,
}: {
  label: string;
  values: Record<"calories" | "protein" | "carbs" | "fat", number>;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-[var(--surface)] p-3",
        selected && "bg-[var(--primary-soft)]",
      )}
    >
      <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
          <div key={key} className="min-w-0 text-center">
            <p className="truncate text-xs capitalize text-[var(--muted-foreground)]">
              {key === "calories" ? "kcal" : key}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatNutrition(values[key])}
              {key === "calories" ? "" : "g"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function macroValues(food: Food) {
  return {
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
  };
}

function ConfirmDialog({
  entry,
  onCancel,
  onConfirm,
}: {
  entry: LogEntry | null;
  onCancel: () => void;
  onConfirm: (entry: LogEntry) => void;
}) {
  return (
    <AlertDialog open={Boolean(entry)} onOpenChange={(open) => !open && onCancel()}>
      {entry && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete log entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {entry.food.name} from today. The food stays in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onConfirm(entry)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite">
      {message && (
        <div
          className="fixed inset-x-4 bottom-24 z-[70] mx-auto flex max-w-sm items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] shadow-xl lg:bottom-6"
          role="status"
        >
          <Check className="size-4 shrink-0" />
          <span className="min-w-0">{message}</span>
        </div>
      )}
    </div>
  );
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toApiMeal(meal: MealType) {
  return meal === "snacks" ? "SNACK" : (meal.toUpperCase() as "BREAKFAST" | "LUNCH" | "DINNER");
}

function fromApiMeal(meal: DailyLogResponse["mealType"]): MealType {
  switch (meal) {
    case "BREAKFAST":
      return "breakfast";
    case "LUNCH":
      return "lunch";
    case "DINNER":
      return "dinner";
    case "SNACK":
      return "snacks";
  }
}

function toApiAmount(food: Food, quantity: number, mode: QuantityMode) {
  if (mode === "amount") {
    return {
      quantity: Number(quantity.toFixed(2)),
      unit: food.servingUnit,
    };
  }
  if (mode === "package") {
    return {
      quantity: Number(((food.packageQuantity ?? food.servingSize) * quantity).toFixed(2)),
      unit: food.packageUnit ?? food.servingUnit,
    };
  }
  return {
    quantity: Number((food.servingSize * quantity).toFixed(2)),
    unit: food.servingUnit,
  };
}

function quantityFromApi(log: DailyLogResponse, food: Food) {
  const amount = log.quantity;
  if (!food.servingSize) {
    return amount;
  }
  return Number((amount / food.servingSize).toFixed(2));
}

function mapLogEntry(log: DailyLogResponse, fallbackFood?: Food): LogEntry {
  const food = fallbackFood ?? mapEmbeddedLogFood(log);
  return {
    id: log.id,
    food,
    meal: fromApiMeal(log.mealType),
    quantity: quantityFromApi(log, food),
    amount: log.quantity,
  };
}

function mapEmbeddedLogFood(log: DailyLogResponse): Food {
  return mapFoodShape({
    id: log.foodId,
    name: log.foodName,
    brand: log.foodBrand,
    servingSize: log.foodServingSize,
    servingUnit: log.foodServingUnit,
    packageQuantity: log.foodPackageQuantity,
    packageUnit: log.foodPackageUnit,
    caloriesPer100g: log.foodCaloriesPer100g,
    proteinPer100g: log.foodProteinPer100g,
    carbsPer100g: log.foodCarbsPer100g,
    fatPer100g: log.foodFatPer100g,
  });
}

function mapFoodResponse(food: FoodResponse): Food {
  return mapFoodShape(food);
}

function mapLibraryEntry(entry: UserLibraryResponse): Food {
  const food = mapFoodShape({
    id: entry.foodId,
    name: entry.foodName,
    brand: entry.foodBrand,
    servingSize: entry.foodServingSize ?? entry.defaultQuantity,
    servingUnit: entry.foodServingUnit ?? entry.defaultUnit,
    packageQuantity: entry.foodPackageQuantity,
    packageUnit: entry.foodPackageUnit,
    caloriesPer100g: entry.foodCaloriesPer100g,
    proteinPer100g: entry.foodProteinPer100g,
    carbsPer100g: entry.foodCarbsPer100g,
    fatPer100g: entry.foodFatPer100g,
  });
  return {
    ...food,
    libraryEntryId: entry.id,
    favorite: entry.favorite,
    recent: true,
    defaultServings: entry.defaultQuantity ? entry.defaultQuantity / food.servingSize : 1,
  };
}

type FoodShape = Pick<
  FoodResponse,
  "id" | "name" | "caloriesPer100g" | "proteinPer100g" | "carbsPer100g" | "fatPer100g"
> &
  Partial<
    Pick<
      FoodResponse,
      | "brand"
      | "barcode"
      | "locale"
      | "source"
      | "servingSize"
      | "servingUnit"
      | "packageQuantity"
      | "packageUnit"
      | "fiberPer100g"
      | "sugarPer100g"
      | "saltPer100g"
    >
  >;

function mapFoodShape(food: FoodShape): Food {
  const servingSize = food.servingSize ?? 100;
  const servingUnit = food.servingUnit ?? "g";
  const factor = servingUnit === "g" || servingUnit === "ml" ? servingSize / 100 : 1;
  return {
    id: food.id,
    name: food.name,
    brand: food.brand ?? "Caltrek",
    calories: roundNutrition(food.caloriesPer100g * factor),
    protein: roundNutrition(food.proteinPer100g * factor),
    carbs: roundNutrition(food.carbsPer100g * factor),
    fat: roundNutrition(food.fatPer100g * factor),
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    serving: `${formatAmount(servingSize)} ${servingUnit}`,
    servingSize,
    servingUnit,
    packageQuantity: food.packageQuantity,
    packageUnit: food.packageUnit,
    barcode: food.barcode,
    locale: food.locale,
    source: food.source,
    fiberPer100g: food.fiberPer100g,
    sugarPer100g: food.sugarPer100g,
    saltPer100g: food.saltPer100g,
  };
}

function mergeFoodFlags(foods: Food[], libraryFoods: Food[]) {
  return foods.map((food) => {
    const libraryFood = libraryFoods.find((item) => item.id === food.id);
    return libraryFood
      ? { ...food, favorite: libraryFood.favorite, libraryEntryId: libraryFood.libraryEntryId }
      : food;
  });
}

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function roundNutrition(value: number) {
  return Number(value.toFixed(2));
}

function formatNutrition(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function userGoals(user: UserResponse): MacroGoals {
  return {
    calories: user.calorieGoal,
    protein: user.proteinGoal,
    carbs: user.carbsGoal,
    fat: user.fatGoal,
  };
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string") {
      return record.message;
    }
    if (typeof record.error === "string") {
      return record.error;
    }
  }
  return "Something went wrong. Please try again.";
}
