"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        root: "relative",
        months: "flex flex-col gap-2",
        month: "space-y-2",
        month_caption: "flex items-center justify-center px-6 pt-6",
        caption_label:
          "inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--card)] px-2 text-sm font-semibold shadow-[var(--shadow-control)]",
        chevron: "size-4 opacity-70",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-xs" }),
          "absolute top-1.5 left-2 size-7 bg-[var(--card)] p-0 opacity-80 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-xs" }),
          "absolute top-1.5 right-2 size-7 bg-[var(--card)] p-0 opacity-80 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "w-8 rounded-md text-[0.75rem] font-bold text-[var(--muted-foreground)]",
        week: "mt-1 flex w-full",
        day: "relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-8 rounded-lg p-0 font-semibold aria-selected:opacity-100",
        ),
        selected:
          "[&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary [&_button]:hover:text-primary-foreground [&_button]:focus:bg-primary [&_button]:focus:text-primary-foreground",
        today: "[&_button]:bg-accent [&_button]:text-accent-foreground",
        outside: "text-[var(--muted-foreground)] opacity-50",
        disabled: "text-[var(--muted-foreground)] opacity-40",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex min-w-0 items-center justify-center gap-2",
        dropdown_root: "relative inline-flex h-9 min-w-0 items-center first:w-28 last:w-20",
        dropdown:
          "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0",
        months_dropdown: "min-w-28",
        years_dropdown: "min-w-20",
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };
