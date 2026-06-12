"use client";

import { Plus, Search, X } from "lucide-react";
import { useCaltrek } from "@/hooks/use-caltrek";
import { FoodList } from "@/components/caltrek/food-list";
import { EmptyState } from "@/components/caltrek/empty-state";
import { PageHeader } from "@/components/caltrek/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
      <PageHeader
        eyebrow="Food search"
        title="Add food"
        action={
          <Button variant="outline" size="lg" className="px-3" onClick={openCreateFood}>
            <Plus className="size-4" />
            Manual
          </Button>
        }
      />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
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
