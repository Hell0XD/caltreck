"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
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
import { AppButton, IconButton } from "./ui";
import {
  type Food,
  type LogEntry,
  type MealType,
  foods,
  initialLogs,
  macroFor,
  mealMeta,
} from "./types";
import { cn } from "@/lib/utils";

type MacroTotals = Record<"calories" | "protein" | "carbs" | "fat", number>;

type CaltrekState = {
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
};

const CaltrekContext = createContext<CaltrekState | null>(null);

export function useCaltrek() {
  const context = useContext(CaltrekContext);
  if (!context) {
    throw new Error("useCaltrek must be used inside CaltrekProvider");
  }
  return context;
}

export function CaltrekProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState(initialLogs);
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDashboardLoading(false), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeout = window.setTimeout(() => setSearchLoading(false), 450);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const totals = useMemo(
    () => ({
      calories: macroFor(logs, "calories"),
      protein: macroFor(logs, "protein"),
      carbs: macroFor(logs, "carbs"),
      fat: macroFor(logs, "fat"),
    }),
    [logs],
  );

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return foods.filter((food) => food.recent);
    }
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(term) ||
        food.brand.toLowerCase().includes(term),
    );
  }, [query]);

  function openAddFood(food: Food, nextMeal: MealType = "breakfast") {
    setSelectedFood(food);
    setQuantity(1);
    setMeal(nextMeal);
  }

  function saveSelectedFood() {
    if (!selectedFood) {
      return;
    }
    setLogs((current) => [
      ...current,
      {
        id: `log-${Date.now()}`,
        food: selectedFood,
        meal,
        quantity,
      },
    ]);
    setSelectedFood(null);
    setToast(`${selectedFood.name} saved to ${mealMeta[meal].label.toLowerCase()}.`);
  }

  function startEdit(entry: LogEntry) {
    setEditingEntry(entry);
    setMeal(entry.meal);
    setQuantity(entry.quantity);
  }

  function saveEdit() {
    if (!editingEntry) {
      return;
    }
    setLogs((current) =>
      current.map((entry) =>
        entry.id === editingEntry.id ? { ...entry, meal, quantity } : entry,
      ),
    );
    setEditingEntry(null);
    setToast("Log entry updated.");
  }

  function removeEntry(entry: LogEntry) {
    setLogs((current) => current.filter((item) => item.id !== entry.id));
    setDeleteTarget(null);
    setEditingEntry(null);
    setToast(`${entry.food.name} removed.`);
  }

  const value = useMemo<CaltrekState>(
    () => ({
      logs,
      totals,
      query,
      setQuery,
      searchResults,
      recentFoods: foods.filter((food) => food.recent),
      favoriteFoods: foods.filter((food) => food.favorite),
      dashboardLoading,
      searchLoading,
      openAddFood,
      startEdit,
      requestDelete: setDeleteTarget,
    }),
    [dashboardLoading, logs, query, searchLoading, searchResults, totals],
  );

  return (
    <CaltrekContext.Provider value={value}>
      {children}
      <FoodSheet
        food={selectedFood}
        meal={meal}
        quantity={quantity}
        onMeal={setMeal}
        onQuantity={setQuantity}
        onClose={() => setSelectedFood(null)}
        onSave={saveSelectedFood}
      />
      <EditSheet
        entry={editingEntry}
        meal={meal}
        quantity={quantity}
        onMeal={setMeal}
        onQuantity={setQuantity}
        onClose={() => setEditingEntry(null)}
        onSave={saveEdit}
        onDelete={setDeleteTarget}
      />
      <ConfirmDialog
        entry={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeEntry}
      />
      <Toast message={toast} />
    </CaltrekContext.Provider>
  );
}

function FoodSheet({
  food,
  meal,
  quantity,
  onMeal,
  onQuantity,
  onClose,
  onSave,
}: {
  food: Food | null;
  meal: MealType;
  quantity: number;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Drawer.Root open={Boolean(food)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl outline-none lg:max-w-lg">
          <SheetHandle />
          {food && (
            <SheetBody
              title={food.name}
              subtitle={`${food.brand} - ${food.serving}`}
              meal={meal}
              quantity={quantity}
              onMeal={onMeal}
              onQuantity={onQuantity}
              onClose={onClose}
              footer={
                <AppButton onClick={onSave} className="w-full">
                  <Check className="size-4" />
                  Save food
                </AppButton>
              }
            >
              <MacroPreview food={food} quantity={quantity} />
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
  onMeal,
  onQuantity,
  onClose,
  onSave,
  onDelete,
}: {
  entry: LogEntry | null;
  meal: MealType;
  quantity: number;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (entry: LogEntry) => void;
}) {
  return (
    <Drawer.Root open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl outline-none lg:max-w-lg">
          <SheetHandle />
          {entry && (
            <SheetBody
              title={entry.food.name}
              subtitle="Edit log entry"
              meal={meal}
              quantity={quantity}
              onMeal={onMeal}
              onQuantity={onQuantity}
              onClose={onClose}
              footer={
                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <AppButton variant="danger" onClick={() => onDelete(entry)} className="px-3">
                    <Trash2 className="size-4" />
                  </AppButton>
                  <AppButton onClick={onSave}>
                    <Check className="size-4" />
                    Update entry
                  </AppButton>
                </div>
              }
            >
              <MacroPreview food={entry.food} quantity={quantity} />
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
  meal,
  quantity,
  children,
  footer,
  onMeal,
  onQuantity,
  onClose,
}: {
  title: string;
  subtitle: string;
  meal: MealType;
  quantity: number;
  children: React.ReactNode;
  footer: React.ReactNode;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <IconButton label="Close" onClick={onClose} className="size-9">
          <ChevronLeft className="size-4" />
        </IconButton>
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
            <button
              key={item}
              onClick={() => onMeal(item)}
              className={cn(
                "min-h-11 rounded-[var(--radius)] border px-2 text-xs font-semibold transition",
                meal === item
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
              )}
            >
              {mealMeta[item].label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Servings</p>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--surface)] p-3">
          <IconButton
            label="Decrease servings"
            onClick={() => onQuantity(Math.max(0.25, Number((quantity - 0.25).toFixed(2))))}
          >
            <Minus className="size-4" />
          </IconButton>
          <input
            aria-label="Serving quantity"
            value={quantity}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isNaN(next) && next > 0) {
                onQuantity(next);
              }
            }}
            inputMode="decimal"
            className="h-11 min-w-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-center text-lg font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          />
          <IconButton
            label="Increase servings"
            onClick={() => onQuantity(Number((quantity + 0.25).toFixed(2)))}
          >
            <Plus className="size-4" />
          </IconButton>
        </div>
      </div>
      {footer}
    </div>
  );
}

function SheetHandle() {
  return <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border)]" />;
}

function MacroPreview({ food, quantity }: { food: Food; quantity: number }) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-[var(--radius-lg)] bg-[var(--surface)] p-3">
      {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
        <div key={key} className="text-center">
          <p className="text-xs capitalize text-[var(--muted-foreground)]">
            {key === "calories" ? "kcal" : key}
          </p>
          <p className="mt-1 text-sm font-semibold">{Math.round(food[key] * quantity)}</p>
        </div>
      ))}
    </div>
  );
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
            <AlertDialogCancel asChild>
              <AppButton variant="secondary">Cancel</AppButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <AppButton variant="danger" onClick={() => onConfirm(entry)}>
                Delete
              </AppButton>
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
