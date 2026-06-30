"use client";

import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { cn } from "@/lib/utils";

function isoToLocalDate(value?: string) {
  if (!value) {
    return undefined;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }
  return new Date(year, month - 1, day);
}

function localDateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  fromYear = 1900,
  toYear,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => isoToLocalDate(value), [value]);
  const resolvedToYear = toYear ?? new Date().getFullYear();
  const startMonth = new Date(fromYear, 0);
  const endMonth = new Date(resolvedToYear, 11);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "h-11 w-full justify-start rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 text-left font-medium shadow-[var(--shadow-control)] hover:translate-y-0 hover:bg-[var(--card)] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-control)] active:translate-y-0 active:shadow-[var(--shadow-control)]",
            !value && "text-[var(--muted-foreground)]",
            className,
          )}
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return;
            }
            setOpen(true);
          }}
          onClick={(event) => {
            event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
        >
          <CalendarIcon className="size-4 opacity-70" />
          {value ? DateUtils.format(value, { month: "short", day: "numeric", year: "numeric" }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[15.2rem] p-0"
        collisionPadding={{ top: 16, right: 16, bottom: 96, left: 16 }}
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? endMonth}
          onSelect={(date) => {
            if (date) {
              onChange(localDateToIso(date));
            }
            setOpen(false);
          }}
          disabled={disabled}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
