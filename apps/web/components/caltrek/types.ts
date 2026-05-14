import { Apple, Beef, Sparkles, Utensils } from "lucide-react";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type AppRoute = "today" | "search" | "library";

export type Food = {
  id: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  recent?: boolean;
  favorite?: boolean;
};

export type LogEntry = {
  id: string;
  food: Food;
  meal: MealType;
  quantity: number;
};

export const foods: Food[] = [
  {
    id: "skyr",
    name: "Greek yogurt",
    brand: "Farmhouse",
    calories: 118,
    protein: 17,
    carbs: 6,
    fat: 2,
    serving: "170 g",
    recent: true,
    favorite: true,
  },
  {
    id: "oats",
    name: "Rolled oats",
    brand: "Wholegrain pantry",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    serving: "40 g",
    recent: true,
  },
  {
    id: "chicken",
    name: "Grilled chicken breast",
    brand: "Home cooked",
    calories: 198,
    protein: 37,
    carbs: 0,
    fat: 4,
    serving: "120 g",
    recent: true,
    favorite: true,
  },
  {
    id: "rice",
    name: "Jasmine rice",
    brand: "Golden bowl",
    calories: 206,
    protein: 4,
    carbs: 45,
    fat: 0,
    serving: "1 cup",
    favorite: true,
  },
  {
    id: "apple",
    name: "Apple",
    brand: "Fresh",
    calories: 95,
    protein: 0,
    carbs: 25,
    fat: 0,
    serving: "1 medium",
    recent: true,
  },
  {
    id: "salmon",
    name: "Baked salmon",
    brand: "Home cooked",
    calories: 233,
    protein: 25,
    carbs: 0,
    fat: 14,
    serving: "115 g",
    favorite: true,
  },
];

export const initialLogs: LogEntry[] = [
  { id: "log-1", food: foods[0], meal: "breakfast", quantity: 1 },
  { id: "log-2", food: foods[1], meal: "breakfast", quantity: 1 },
  { id: "log-3", food: foods[2], meal: "lunch", quantity: 1.25 },
  { id: "log-4", food: foods[3], meal: "lunch", quantity: 1 },
  { id: "log-5", food: foods[4], meal: "snacks", quantity: 1 },
];

export const mealMeta: Record<MealType, { label: string; icon: typeof Apple }> = {
  breakfast: { label: "Breakfast", icon: Apple },
  lunch: { label: "Lunch", icon: Utensils },
  dinner: { label: "Dinner", icon: Beef },
  snacks: { label: "Snacks", icon: Sparkles },
};

export const macroGoal = {
  calories: 2200,
  protein: 150,
  carbs: 245,
  fat: 75,
};

export function macroFor(
  logs: LogEntry[],
  key: "calories" | "protein" | "carbs" | "fat",
) {
  return Math.round(logs.reduce((sum, entry) => sum + entry.food[key] * entry.quantity, 0));
}

export function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2).replace(/0$/, "");
}
