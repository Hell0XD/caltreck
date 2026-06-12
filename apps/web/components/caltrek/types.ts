import { Apple, Beef, Sparkles, Utensils } from "lucide-react";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type AppRoute = "today" | "search" | "scan" | "library" | "account";

export type Food = {
  id: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  serving: string;
  servingSize: number;
  servingUnit: string;
  packageQuantity?: number;
  packageUnit?: string;
  barcode?: string;
  locale?: string;
  source?: string;
  fiberPer100g?: number;
  sugarPer100g?: number;
  saltPer100g?: number;
  libraryEntryId?: string;
  defaultServings?: number;
  recent?: boolean;
  favorite?: boolean;
};

export type LogEntry = {
  id: string;
  food: Food;
  meal: MealType;
  quantity: number;
  amount: number;
};

export const mealMeta: Record<MealType, { label: string; icon: typeof Apple }> = {
  breakfast: { label: "Breakfast", icon: Apple },
  lunch: { label: "Lunch", icon: Utensils },
  dinner: { label: "Dinner", icon: Beef },
  snacks: { label: "Snacks", icon: Sparkles },
};

export function macroFor(logs: LogEntry[], key: "calories" | "protein" | "carbs" | "fat") {
  return Math.round(logs.reduce((sum, entry) => sum + entry.food[key] * entry.quantity, 0));
}

export function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2).replace(/0$/, "");
}
