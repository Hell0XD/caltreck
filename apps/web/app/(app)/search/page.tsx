"use client";

import { Plus, Search, X } from "lucide-react";
import { useCaltrek } from "@/components/caltrek/app-state";
import { FoodList } from "@/components/caltrek/food-list";
import { AppButton, EmptyState, Skeleton } from "@/components/caltrek/ui";

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
  } = useCaltrek();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Food search</p>
          <h1 className="text-3xl font-semibold tracking-normal">Add food</h1>
        </div>
        <AppButton variant="secondary" className="px-3" onClick={openCreateFood}>
          <Plus className="size-4" />
          Manual
        </AppButton>
      </div>
      <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--ring)]">
        <Search className="size-5 text-[var(--muted-foreground)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search foods or brands"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted-foreground)]"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery("")}>
            <X className="size-5 text-[var(--muted-foreground)]" />
          </button>
        )}
      </label>
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
