"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type React from "react";
import { type Food } from "./types";
import { IconButton } from "./ui";

export function FoodList({
  title,
  foods,
  onAdd,
  icon,
}: {
  title: string;
  foods: Food[];
  onAdd: (food: Food) => void;
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
          <motion.article
            layout
            key={food.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm shadow-slate-950/5"
          >
            <button className="min-w-0 text-left" onClick={() => onAdd(food)}>
              <p className="truncate text-sm font-semibold">{food.name}</p>
              <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                {food.brand} - {food.serving}
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {food.calories} kcal | P {food.protein}g | C {food.carbs}g | F {food.fat}g
              </p>
            </button>
            <IconButton label={`Add ${food.name}`} onClick={() => onAdd(food)}>
              <Plus className="size-4" />
            </IconButton>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
