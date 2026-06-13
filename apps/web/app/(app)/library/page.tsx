"use client";

import { Clock3, Heart } from "lucide-react";
import { useCaltrek } from "@/hooks/use-caltrek";
import { FoodList } from "@/components/caltrek/food-list";
import { EmptyState } from "@/components/caltrek/empty-state";
import { PageHeader } from "@/components/caltrek/page-header";

export default function LibraryPage() {
  const { favoriteFoods, recentFoods, openAddFood, toggleFavorite } = useCaltrek();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader eyebrow="Library" title="Foods you use" />
      {favoriteFoods.length === 0 ? (
        <EmptyState title="No favorite foods" body="Favorite foods will appear here." />
      ) : (
        <FoodList
          title="Favorites"
          foods={favoriteFoods}
          onAdd={openAddFood}
          onToggleFavorite={toggleFavorite}
          icon={<Heart className="size-4" />}
        />
      )}
      {recentFoods.length === 0 ? (
        <EmptyState
          title="No saved foods"
          body="Foods you log will be saved here for faster reuse."
        />
      ) : (
        <FoodList
          title="Recent"
          foods={recentFoods}
          onAdd={openAddFood}
          onToggleFavorite={toggleFavorite}
          icon={<Clock3 className="size-4" />}
        />
      )}
    </div>
  );
}
