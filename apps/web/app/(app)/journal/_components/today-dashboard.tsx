"use client";

import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Apple,
  Beef,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Plus,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { ContentCard } from "@/components/caltrek/content-card";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetScrollArea,
} from "@/components/caltrek/bottom-sheet";
import { EmptyState } from "@/components/caltrek/empty-state";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaltrek } from "@/hooks/use-caltrek";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { FormatUtils } from "@/lib/caltrek/format-utils";
import { GoalStatusUtils, type GoalStatus } from "@/lib/caltrek/goal-status";
import { MealUtils } from "@/lib/caltrek/meal-utils";
import type { LogEntry, MacroGoals, MacroTotals, MealType } from "@/lib/caltrek/models";
import { NutritionUtils } from "@/lib/caltrek/nutrition-utils";
import { cn } from "@/lib/utils";
import { GoalCalendar } from "./goal-calendar";

const mealIcons = {
  breakfast: Apple,
  lunch: Utensils,
  dinner: Beef,
  snacks: Sparkles,
};

export function TodayDashboard() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const {
    dashboardLoading,
    goals,
    logs,
    totals,
    selectedDate,
    selectDate,
    historyMonth,
    setHistoryMonth,
    history,
    historyLoading,
    startEdit,
    requestDelete,
  } = useCaltrek();
  const isToday = selectedDate === DateUtils.todayIso();
  const selectedGoals = GoalStatusUtils.goalsForSummary(history[selectedDate], goals);
  const selectedStatus = GoalStatusUtils.forTotals(totals, logs.length > 0, selectedGoals);

  return (
    <div className="space-y-5 lg:space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--primary)]">
              {DateUtils.relativeLabel(selectedDate)}
            </span>
            <StatusBadge status={selectedStatus} />
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            {DateUtils.format(selectedDate, { month: "long", day: "numeric" })}
          </h1>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-xl px-4 shadow-[var(--shadow-button)]"
          data-tour="add-food"
        >
          <Link href="/search">
            <Plus className="size-4" />
            Add food
          </Link>
        </Button>
      </header>

      <DateNavigator
        selectedDate={selectedDate}
        onSelectDate={selectDate}
        onOpenCalendar={() => setCalendarOpen(true)}
      />

      {dashboardLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(20rem,0.9fr)_minmax(28rem,1.1fr)]">
            <div className="hidden lg:block">
              <GoalCalendar
                month={historyMonth}
                selectedDate={selectedDate}
                goals={selectedGoals}
                summaries={history}
                loading={historyLoading}
                onMonthChange={setHistoryMonth}
                onSelectDate={selectDate}
              />
            </div>
            <MacroSummary totals={totals} goals={selectedGoals} status={selectedStatus} />
          </div>

          <section data-tour="meal-log">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  Food log
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {isToday ? "Today’s meals" : "Meals for this day"}
                </h2>
              </div>
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                {logs.length} {logs.length === 1 ? "entry" : "entries"}
              </p>
            </div>
            <LayoutGroup>
              <div className="grid gap-4 md:grid-cols-2">
                {MealUtils.all.map((meal) => (
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
          </section>
        </>
      )}

      <BottomSheet open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <BottomSheetScrollArea className="space-y-4">
          <BottomSheetHeader
            title="Choose a day"
            description="Review your nutrition history"
            onClose={() => setCalendarOpen(false)}
          />
          <GoalCalendar
            month={historyMonth}
            selectedDate={selectedDate}
            goals={selectedGoals}
            summaries={history}
            loading={historyLoading}
            onMonthChange={setHistoryMonth}
            onSelectDate={(date) => {
              selectDate(date);
              setCalendarOpen(false);
            }}
          />
        </BottomSheetScrollArea>
      </BottomSheet>
    </div>
  );
}

function DateNavigator({
  selectedDate,
  onSelectDate,
  onOpenCalendar,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenCalendar: () => void;
}) {
  const today = DateUtils.todayIso();
  const isToday = selectedDate === today;

  return (
    <div className="flex items-center gap-2" data-tour="dashboard-date">
      <Button
        variant="outline"
        size="icon"
        className="rounded-xl bg-[var(--card)]"
        aria-label="Previous day"
        onClick={() => onSelectDate(DateUtils.addDays(selectedDate, -1))}
      >
        <ChevronLeft />
      </Button>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2.5 text-sm font-bold shadow-[var(--shadow-control)] transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] lg:hidden"
        aria-label="Open calendar"
        onClick={onOpenCalendar}
      >
        <CalendarDays className="size-4 text-[var(--primary)]" />
        <span className="truncate">
          {DateUtils.format(selectedDate, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: selectedDate.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
          })}
        </span>
      </button>
      <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2.5 text-sm font-bold shadow-[var(--shadow-control)] lg:flex">
        <CalendarDays className="size-4 text-[var(--primary)]" />
        <span className="truncate">
          {DateUtils.format(selectedDate, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: selectedDate.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
          })}
        </span>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-xl bg-[var(--card)]"
        aria-label="Next day"
        disabled={isToday}
        onClick={() => onSelectDate(DateUtils.addDays(selectedDate, 1))}
      >
        <ChevronRight />
      </Button>
      {!isToday && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl px-2.5 sm:px-3 font-bold!"
          onClick={() => onSelectDate(today)}
        >
          Today
        </Button>
      )}
    </div>
  );
}

function MacroSummary({
  totals,
  goals,
  status,
}: {
  totals: MacroTotals;
  goals: MacroGoals;
  status: GoalStatus;
}) {
  const animatedTotals = useAnimatedTotals(totals);
  const caloriesLeft = goals.calories - totals.calories;
  const calorieProgress = progressPercent(animatedTotals.calories, goals.calories);

  return (
    <section
      data-tour="macro-summary"
      className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--card)] shadow-[var(--shadow-card)]"
    >
      <div className="relative overflow-hidden bg-[var(--energy-background)] px-5 py-6 text-white sm:px-6">
        <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-44 rounded-full bg-[var(--secondary)]/20 blur-3xl" />
        <div className="group absolute right-4 top-4 z-10 sm:right-5 sm:top-5">
          <button
            type="button"
            aria-label="How goal days are calculated"
            className="grid size-8 place-items-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Info className="size-4" />
          </button>
          <div
            role="tooltip"
            className="pointer-events-none absolute right-0 top-10 w-64 translate-y-1 rounded-xl bg-[var(--foreground)] p-3 text-xs font-medium leading-relaxed text-[var(--foreground-contrast)] opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
          >
            Goal days use a 90–110% calorie window and at least 90% of every macro target.
          </div>
        </div>
        <div className="relative flex items-center gap-5">
          <div
            className="grid size-28 shrink-0 place-items-center rounded-full p-2"
            style={{
              background: `conic-gradient(var(--secondary) ${calorieProgress * 3.6}deg, rgba(255,255,255,0.16) 0deg)`,
            }}
          >
            <div className="grid size-full place-items-center rounded-full bg-[var(--energy-inner)] text-center shadow-inner">
              <div>
                <Flame className="mx-auto mb-0.5 size-4 text-[var(--secondary)]" />
                <p className="text-2xl font-bold tabular-nums tracking-[-0.04em]">
                  {animatedTotals.calories}
                </p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--energy-unit)]">
                  kcal
                </p>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--energy-label)]">
              Daily energy
            </p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.03em]">
              {caloriesLeft > 0
                ? `${caloriesLeft} kcal left`
                : caloriesLeft === 0
                  ? "Right on target"
                  : `${Math.abs(caloriesLeft)} kcal over`}
            </p>
            <p className="mt-1 text-sm font-medium tabular-nums text-[var(--energy-detail)]">
              {totals.calories} of {goals.calories} kcal
            </p>
            {status === "hit" && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-xs font-bold">
                <Check className="size-3.5" />
                All goals reached
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <MacroPill
          label="Protein"
          value={animatedTotals.protein}
          goal={goals.protein}
          unit="g"
          tone="green"
        />
        <MacroPill
          label="Carbs"
          value={animatedTotals.carbs}
          goal={goals.carbs}
          unit="g"
          tone="gold"
        />
        <MacroPill label="Fat" value={animatedTotals.fat} goal={goals.fat} unit="g" tone="coral" />
      </div>
    </section>
  );
}

function MacroPill({
  label,
  value,
  goal,
  unit,
  tone,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  tone: "green" | "gold" | "coral";
}) {
  const remaining = Math.max(goal - value, 0);
  const toneClass = {
    green: "bg-[var(--success)]",
    gold: "bg-[var(--warning)]",
    coral: "bg-[var(--missed)]",
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-[-0.03em]">
            {value}
            <span className="ml-0.5 text-xs text-[var(--muted-foreground)]">{unit}</span>
          </p>
        </div>
        <span className={cn("mt-1 size-2.5 rounded-full", toneClass)} />
      </div>
      <Progress
        value={progressPercent(value, goal)}
        className="mt-3 h-1.5 bg-[var(--progress-track)]"
        indicatorClassName={toneClass}
      />
      <p className="mt-2 text-[0.68rem] font-semibold text-[var(--muted-foreground)]">
        {remaining > 0 ? `${remaining}${unit} to target` : "Target reached"}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: GoalStatus }) {
  const content = {
    hit: { label: "Goals hit", className: "bg-[var(--success-soft)] text-[var(--success)]" },
    almost: {
      label: "Calories hit",
      className: "bg-[var(--warning-soft)] text-[var(--warning-strong)]",
    },
    missed: { label: "Off target", className: "bg-[var(--missed-soft)] text-[var(--missed)]" },
    "no-log": {
      label: "No log yet",
      className: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    },
  }[status];

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-bold", content.className)}>
      {content.label}
    </span>
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
  const Icon = mealIcons[meal];
  const calories = NutritionUtils.macroFor(entries, "calories");

  return (
    <ContentCard className="rounded-[var(--radius-xl)] shadow-[var(--shadow-card)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold">{MealUtils.label(meal)}</h3>
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                {calories} kcal · {entries.length} {entries.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-xl"
            aria-label={`Add ${MealUtils.label(meal)}`}
            title={`Add ${MealUtils.label(meal)}`}
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
              title={`No ${MealUtils.label(meal).toLowerCase()} logged`}
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
    </ContentCard>
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
      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-[var(--surface)] p-3"
    >
      <Button
        variant="ghost"
        className="h-auto min-w-0 justify-start px-0 py-0 text-left hover:bg-transparent"
        onClick={onEdit}
      >
        <span className="min-w-0">
          <p className="truncate text-sm font-bold">{entry.food.name}</p>
          <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
            {FormatUtils.quantity(entry.amount)} {entry.food.servingUnit} ·{" "}
            {FormatUtils.quantity(entry.quantity)} {entry.quantity === 1 ? "serving" : "servings"}
          </p>
        </span>
      </Button>
      <div className="flex items-center gap-2">
        <p className="min-w-14 text-right text-sm font-bold">
          {Math.round(entry.food.calories * entry.quantity)}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-[var(--muted-foreground)] hover:bg-[var(--missed-soft)] hover:text-[var(--missed)]"
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

function useAnimatedTotals(target: MacroTotals) {
  const reduceMotion = useReducedMotion();
  const {
    calories: targetCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fat: targetFat,
  } = target;
  const current = useRef<MacroTotals>(
    reduceMotion ? target : { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const [value, setValue] = useState(current.current);

  useEffect(() => {
    if (reduceMotion) {
      const finalValue = {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
      };
      current.current = finalValue;
      setValue(finalValue);
      return;
    }

    const start = current.current;
    const startedAt = Date.now();

    function update() {
      const progress = Math.min((Date.now() - startedAt) / 1150, 1);
      const eased = 1 - Math.pow(1 - progress, 5);
      const latest = {
        calories: interpolate(start.calories, targetCalories, eased),
        protein: interpolate(start.protein, targetProtein, eased),
        carbs: interpolate(start.carbs, targetCarbs, eased),
        fat: interpolate(start.fat, targetFat, eased),
      };

      current.current = latest;
      setValue(latest);

      if (progress === 1) {
        window.clearInterval(timer);
      }
    }

    const timer = window.setInterval(update, 16);
    update();
    return () => window.clearInterval(timer);
  }, [reduceMotion, targetCalories, targetCarbs, targetFat, targetProtein]);

  return {
    calories: Math.round(value.calories),
    protein: Math.round(value.protein),
    carbs: Math.round(value.carbs),
    fat: Math.round(value.fat),
  };
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Skeleton className="h-[28rem] rounded-[var(--radius-xl)]" />
      <Skeleton className="h-[28rem] rounded-[var(--radius-xl)]" />
    </div>
  );
}
