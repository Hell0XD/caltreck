"use client";

import { motion } from "framer-motion";
import { Heart, Pencil, Plus } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        {icon}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="space-y-2">
        {foods.map((food) => (
          <Card key={food.id} className="gap-0 py-0 shadow-sm shadow-slate-950/5">
            <motion.article layout>
              <CardContent className="grid grid-cols-[1fr_auto] items-center gap-3 p-4">
                <Button
                  variant="ghost"
                  className="h-auto min-w-0 justify-start px-0 py-0 text-left hover:bg-transparent"
                  onClick={() => onAdd(food)}
                >
                  <span className="min-w-0">
                    <p className="truncate text-sm font-semibold">{food.name}</p>
                    <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                      {food.brand} - {food.serving}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      {food.calories} kcal | P {food.protein}g | C {food.carbs}g | F {food.fat}g
                    </p>
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
                    variant="outline"
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
          </Card>
        ))}
      </div>
    </section>
  );
}
