"use client";

import { Clock3, Heart } from "lucide-react";
import { useCaltrek } from "@/hooks/use-caltrek";
import { FoodList } from "@/components/caltrek/food-list";
import { EmptyState } from "@/components/caltrek/empty-state";

export default function LibraryPage() {
  const { favoriteFoods, recentFoods, openAddFood, toggleFavorite } = useCaltrek();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Library</p>
        <h1 className="text-3xl font-semibold tracking-normal">Foods you use</h1>
      </div>
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
