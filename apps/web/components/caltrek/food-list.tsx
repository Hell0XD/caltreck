"use client";

import { motion } from "framer-motion";
import { Heart, Pencil, Plus } from "lucide-react";
import type React from "react";
import { ContentCard } from "@/components/caltrek/content-card";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import type { Food } from "@/lib/caltrek/models";

export function FoodList({
  title,
  foods,
  onAdd,
  onEdit,
  onToggleFavorite,
  icon,
}: {
  title: string;
  foods: Food[];
  onAdd: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onToggleFavorite?: (food: Food) => void;
  icon?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
            {icon}
          </span>
        )}
        <h2 className="text-lg font-bold tracking-[-0.02em]">{title}</h2>
      </div>
      <div className="grid gap-3">
        {foods.map((food) => (
          <ContentCard key={food.id}>
            <motion.article layout>
              <CardContent className="grid grid-cols-[1fr_auto] items-center gap-3 p-4">
                <Button
                  variant="ghost"
                  className="h-auto min-w-0 justify-start px-0 py-0 text-left hover:bg-transparent"
                  onClick={() => onAdd(food)}
                >
                  <span className="min-w-0">
                    <p className="truncate text-base font-bold tracking-[-0.02em]">{food.name}</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-[var(--muted-foreground)]">
                      {[food.brand, food.serving].filter(Boolean).join(" · ")}
                    </p>
                    <span className="mt-2 inline-flex rounded-lg bg-[var(--surface)] px-2 py-1 text-[0.68rem] font-bold text-[var(--muted-foreground)]">
                      {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
                    </span>
                  </span>
                </Button>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Edit ${food.name}`}
                      title={`Edit ${food.name}`}
                      onClick={() => onEdit(food)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                  {onToggleFavorite && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Favorite ${food.name}`}
                      title={`Favorite ${food.name}`}
                      onClick={() => onToggleFavorite(food)}
                    >
                      <Heart className={food.favorite ? "size-4 fill-current" : "size-4"} />
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="icon"
                    aria-label={`Add ${food.name}`}
                    title={`Add ${food.name}`}
                    onClick={() => onAdd(food)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </motion.article>
          </ContentCard>
        ))}
      </div>
    </section>
  );
}
