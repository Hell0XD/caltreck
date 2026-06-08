"use client";

import type React from "react";
import { Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className="gap-0 border-dashed bg-[var(--surface)] py-0 shadow-none">
      <CardContent className={cn("text-center", compact ? "p-3" : "p-8")}>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
