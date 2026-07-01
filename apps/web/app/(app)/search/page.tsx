"use client";

import Link from "next/link";
import { Plus, ScanLine, Search, X } from "lucide-react";
import { useCaltrek } from "@/hooks/use-caltrek";
import { FoodList } from "@/components/caltrek/food-list";
import { EmptyState } from "@/components/caltrek/empty-state";
import { PageHeader } from "@/components/caltrek/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DateUtils } from "@/lib/caltrek/date-utils";

export default function SearchPage() {
  const {
    query,
    setQuery,
    searchResults,
    searchLoading,
    openAddFood,
    openCreateFood,
    openEditFood,
    toggleFavorite,
    selectedDate,
  } = useCaltrek();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader
        eyebrow={`Adding to ${DateUtils.relativeLabel(selectedDate).toLowerCase()}, ${DateUtils.format(
          selectedDate,
          { month: "short", day: "numeric" },
        )}`}
        title="Add food"
        action={
          <div className="flex items-center gap-2">
            <Button size="lg" className="px-4" onClick={openCreateFood}>
              <Plus className="size-4" />
              Manual
            </Button>
            <Button asChild size="lg" variant="outline" className="px-4">
              <Link href="/scan">
                <ScanLine className="size-4" />
                Scan
              </Link>
            </Button>
          </div>
        }
      />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-[var(--primary)]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search foods or brands"
          aria-label="Search foods or brands"
          className="h-12 pl-10 pr-10 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X className="size-5 text-[var(--muted-foreground)]" />
          </Button>
        )}
      </div>
      {searchLoading ? (
        <FoodListSkeleton />
      ) : searchResults.length === 0 ? (
        <EmptyState
          title="No matching foods"
          body="Try a simpler food name or scan a barcode to pull a provider match."
        />
      ) : (
        <FoodList
          title={query ? "Results" : "Recent foods"}
          foods={searchResults}
          onAdd={openAddFood}
          onEdit={openEditFood}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

function FoodListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
      <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
      <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
    </div>
  );
}
