"use client";

import type React from "react";
import { type HTMLMotionProps, motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

type MotionButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: React.ReactNode;
};

export function AppButton({
  children,
  className,
  asChild,
  variant = "primary",
  ...props
}: MotionButtonProps & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const classNames = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" &&
      "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm shadow-emerald-950/10 hover:bg-[var(--primary-strong)]",
    variant === "secondary" &&
      "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
    variant === "ghost" &&
      "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
    variant === "danger" &&
      "bg-[var(--destructive)] text-white hover:bg-[var(--destructive-strong)]",
    className,
  );

  if (asChild) {
    const slotProps = props as React.ComponentProps<typeof Slot>;
    return (
      <Slot className={classNames} {...slotProps}>
        {children}
      </Slot>
    );
  }

  return (
    <motion.button whileTap={{ scale: 0.97 }} className={classNames} {...props}>
      {children}
    </motion.button>
  );
}

export function IconButton({
  label,
  children,
  className,
  asChild,
  ...props
}: MotionButtonProps & {
  asChild?: boolean;
  label: string;
}) {
  const classNames = cn(
    "grid size-10 shrink-0 place-items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
    className,
  );

  if (asChild) {
    const slotProps = props as React.ComponentProps<typeof Slot>;
    return (
      <Slot aria-label={label} title={label} className={classNames} {...slotProps}>
        {children}
      </Slot>
    );
  }

  return (
    <motion.button
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.92 }}
      className={classNames}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function BrandBlock() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[var(--radius)] bg-[var(--primary)] text-white">
          <Utensils className="size-5" />
        </div>
        <div>
          <p className="text-base font-semibold">caltrek</p>
          <p className="text-sm text-[var(--muted-foreground)]">Daily nutrition</p>
        </div>
      </div>
    </div>
  );
}

export function MobileHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <BrandBlock />
        {children}
      </div>
    </header>
  );
}

export function Progress({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div
      className={cn("overflow-hidden rounded-full bg-[var(--muted)]", className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        layout
        className="h-full rounded-full bg-[var(--primary)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  compact,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)] text-center",
        compact ? "p-3" : "p-8",
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-[var(--skeleton)]", className)} />;
}
