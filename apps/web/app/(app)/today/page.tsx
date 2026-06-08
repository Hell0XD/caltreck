"use client";

import Link from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useCaltrek } from "@/components/caltrek/app-state";
import {
  type LogEntry,
  type MealType,
  macroFor,
  mealMeta,
  formatQuantity,
} from "@/components/caltrek/types";
import { EmptyState } from "@/components/caltrek/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function TodayPage() {
  const { dashboardLoading, goals, logs, totals, startEdit, requestDelete } = useCaltrek();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Today</p>
          <h1 className="text-3xl font-semibold tracking-normal">Macro dashboard</h1>
        </div>
        <Button asChild size="lg" className="px-3">
          <Link href="/search">
            <Plus className="size-4" />
            Add
          </Link>
        </Button>
      </div>

      {dashboardLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <MacroSummary totals={totals} goals={goals} />
          <LayoutGroup>
            <div className="space-y-4">
              {(Object.keys(mealMeta) as MealType[]).map((meal) => (
                <MealSection
                  key={meal}
                  meal={meal}
                  entries={logs.filter((entry) => entry.meal === meal)}
                  onEdit={startEdit}
                  onDelete={requestDelete}
                />
              ))}
            </div>
          </LayoutGroup>
        </>
      )}
    </div>
  );
}

function MacroSummary({
  totals,
  goals,
}: {
  totals: Record<"calories" | "protein" | "carbs" | "fat", number>;
  goals: Record<"calories" | "protein" | "carbs" | "fat", number>;
}) {
  return (
    <Card className="gap-0 py-0 shadow-sm shadow-slate-950/5">
      <CardContent className="p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">Energy</p>
            <p className="mt-1 text-4xl font-semibold tracking-normal">{totals.calories}</p>
          </div>
          <p className="pb-1 text-sm text-[var(--muted-foreground)]">
            {Math.max(goals.calories - totals.calories, 0)} kcal left
          </p>
        </div>
        <Progress value={progressPercent(totals.calories, goals.calories)} className="mt-4 h-3" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MacroPill label="Protein" value={totals.protein} goal={goals.protein} unit="g" />
          <MacroPill label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" />
          <MacroPill label="Fat" value={totals.fat} goal={goals.fat} unit="g" />
        </div>
      </CardContent>
    </Card>
  );
}

function MacroPill({
  label,
  value,
  goal,
  unit,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius)] bg-[var(--surface)] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
        <p className="text-sm font-semibold">
          {value}
          {unit}
        </p>
      </div>
      <Progress value={progressPercent(value, goal)} className="mt-2 h-2" />
    </div>
  );
}

function MealSection({
  meal,
  entries,
  onEdit,
  onDelete,
}: {
  meal: MealType;
  entries: LogEntry[];
  onEdit: (entry: LogEntry) => void;
  onDelete: (entry: LogEntry) => void;
}) {
  const Icon = mealMeta[meal].icon;
  const calories = macroFor(entries, "calories");

  return (
    <Card className="gap-0 py-0 shadow-sm shadow-slate-950/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[var(--radius)] bg-[var(--surface)] text-[var(--primary)]">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{mealMeta[meal].label}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{calories} kcal</p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label={`Add ${mealMeta[meal].label}`}
            title={`Add ${mealMeta[meal].label}`}
          >
            <Link href="/search">
              <Plus className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {entries.length === 0 ? (
            <EmptyState
              compact
              title={`No ${mealMeta[meal].label.toLowerCase()} logged`}
              body="Add a food when this meal is ready."
            />
          ) : (
            entries.map((entry) => (
              <FoodLogCard
                key={entry.id}
                entry={entry}
                onEdit={() => onEdit(entry)}
                onDelete={() => onDelete(entry)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FoodLogCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: LogEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.article
      layout
      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[var(--radius)] bg-[var(--surface)] p-3"
    >
      <Button
        variant="ghost"
        className="h-auto min-w-0 justify-start px-0 py-0 text-left hover:bg-transparent"
        onClick={onEdit}
      >
        <span className="min-w-0">
          <p className="truncate text-sm font-semibold">{entry.food.name}</p>
          <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
            {formatQuantity(entry.amount)} {entry.food.servingUnit} |{" "}
            {formatQuantity(entry.quantity)} {entry.quantity === 1 ? "serving" : "servings"}
          </p>
        </span>
      </Button>
      <div className="flex items-center gap-2">
        <p className="min-w-14 text-right text-sm font-semibold">
          {Math.round(entry.food.calories * entry.quantity)}
        </p>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Delete ${entry.food.name}`}
          title={`Delete ${entry.food.name}`}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </motion.article>
  );
}

function progressPercent(value: number, max: number) {
  return max > 0 ? Math.min((value / max) * 100, 100) : 0;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-[var(--radius-lg)]" />
      <Skeleton className="h-36 rounded-[var(--radius-lg)]" />
      <Skeleton className="h-36 rounded-[var(--radius-lg)]" />
    </div>
  );
}
