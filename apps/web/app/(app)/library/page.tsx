"use client";

import { Clock3, Heart } from "lucide-react";
import { useCaltrek } from "@/components/caltrek/app-state";
import { FoodList } from "@/components/caltrek/food-list";
import { EmptyState } from "@/components/caltrek/ui";

export default function LibraryPage() {
  const { favoriteFoods, recentFoods, openAddFood } = useCaltrek();

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
          icon={<Heart className="size-4" />}
        />
      )}
      <FoodList
        title="Recent"
        foods={recentFoods}
        onAdd={openAddFood}
        icon={<Clock3 className="size-4" />}
      />
    </div>
  );
}
