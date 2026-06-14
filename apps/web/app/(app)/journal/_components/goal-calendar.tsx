"use client";

import type { DailySummaryResponse } from "@caltrek/api-client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { GoalStatusUtils, type GoalStatus } from "@/lib/caltrek/goal-status";
import type { MacroGoals } from "@/lib/caltrek/models";
import { cn } from "@/lib/utils";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusStyles: Record<GoalStatus, string> = {
  hit: "border-[var(--success)]/35 bg-[var(--success-soft)] text-[var(--success)]",
  almost: "border-[var(--warning-strong)]/30 bg-[var(--warning-soft)] text-[var(--warning-strong)]",
  missed: "border-[var(--missed)]/35 bg-[var(--missed-soft)] text-[var(--missed)]",
  "no-log":
    "border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] bg-[var(--surface)] text-[var(--foreground)]",
};

const dotStyles: Record<GoalStatus, string> = {
  hit: "bg-[var(--success)]",
  almost: "bg-[var(--warning)]",
  missed: "bg-[var(--missed)]",
  "no-log": "bg-[var(--border)]",
};

export function GoalCalendar({
  month,
  selectedDate,
  goals,
  summaries,
  loading,
  onMonthChange,
  onSelectDate,
}: {
  month: string;
  selectedDate: string;
  goals: MacroGoals;
  summaries: Record<string, DailySummaryResponse>;
  loading: boolean;
  onMonthChange: (date: string) => void;
  onSelectDate: (date: string) => void;
}) {
  const days = DateUtils.calendarGrid(month);
  const nextMonth = DateUtils.shiftMonth(month, 1);
  const canGoForward =
    DateUtils.monthStart(nextMonth) <= DateUtils.monthStart(DateUtils.todayIso());
  const statuses = Object.entries(summaries).map(([date, summary]) => ({
    date,
    status: GoalStatusUtils.forSummary(summary, goals),
  }));
  const wins = statuses.filter(({ status }) => status === "hit").length;
  const almost = statuses.filter(({ status }) => status === "almost").length;

  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--foreground)] bg-[var(--card)] shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--foreground)] bg-[var(--surface)] px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">
              {DateUtils.format(month, { month: "long", year: "numeric" })}
            </h2>
            {loading && (
              <LoaderCircle
                className="size-3.5 animate-spin text-[var(--muted-foreground)]"
                aria-label="Loading month"
              />
            )}
          </div>
          <p className="mt-0.5 text-xs font-medium text-[var(--muted-foreground)]">
            {wins} goal {wins === 1 ? "day" : "days"}
            {almost > 0 ? ` · ${almost} close` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => onMonthChange(DateUtils.shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            disabled={!canGoForward}
            onClick={() => onMonthChange(nextMonth)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-7">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="pb-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]"
            >
              {weekday.slice(0, 1)}
              <span className="hidden sm:inline">{weekday.slice(1)}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={month}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.16 }}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((date) => {
              const inMonth = DateUtils.isSameMonth(date, month);
              const future = DateUtils.isFuture(date);
              const selected = date === selectedDate;
              const today = date === DateUtils.todayIso();
              const status = inMonth
                ? GoalStatusUtils.forSummary(summaries[date], goals)
                : "no-log";

              return (
                <button
                  key={date}
                  type="button"
                  disabled={future}
                  aria-label={`${DateUtils.format(date)}, ${statusLabel(status)}`}
                  aria-pressed={selected}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    "relative grid aspect-square min-h-10 place-items-center rounded-xl border text-sm font-semibold transition duration-150",
                    statusStyles[status],
                    !inMonth && "opacity-35",
                    !future && "hover:-translate-y-0.5 hover:shadow-sm",
                    future && "cursor-not-allowed opacity-25",
                    selected &&
                      "z-10 bg-[var(--selected-date)] text-[var(--selected-date-foreground)] shadow-[0_6px_18px_rgba(23,32,27,0.22)] ring-2 ring-[var(--selected-date)] ring-offset-2 ring-offset-[var(--card)]",
                    today && !selected && "ring-1 ring-inset ring-[var(--primary)]",
                  )}
                >
                  <span>{DateUtils.fromIso(date).getDate()}</span>
                  {inMonth && !future && (
                    <span
                      className={cn(
                        "absolute bottom-1.5 size-1 rounded-full",
                        selected ? "bg-[var(--selected-date-dot)]" : dotStyles[status],
                      )}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--foreground)] pt-3">
          <Legend color="bg-[var(--success)]" label="Goals hit" />
          <Legend color="bg-[var(--warning)]" label="Calories only" />
          <Legend color="bg-[var(--missed)]" label="Off target" />
          <Legend color="bg-[var(--foreground)]" label="No log" />
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-[var(--muted-foreground)]">
      <span className={cn("size-2 rounded-full", color)} />
      {label}
    </div>
  );
}

function statusLabel(status: GoalStatus) {
  if (status === "hit") {
    return "goals hit";
  }
  if (status === "almost") {
    return "calorie goal hit, macros missed";
  }
  if (status === "missed") {
    return "off target";
  }
  return "no food logged";
}
