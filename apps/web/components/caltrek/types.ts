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

export const foods: Food[] = [
  {
    id: "skyr",
    name: "Greek yogurt",
    brand: "Farmhouse",
    calories: 118,
    protein: 17,
    carbs: 6,
    fat: 2,
    caloriesPer100g: 69,
    proteinPer100g: 10,
    carbsPer100g: 4,
    fatPer100g: 1,
    serving: "170 g",
    servingSize: 170,
    servingUnit: "g",
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
    caloriesPer100g: 375,
    proteinPer100g: 13,
    carbsPer100g: 68,
    fatPer100g: 8,
    serving: "40 g",
    servingSize: 40,
    servingUnit: "g",
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
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 4,
    serving: "120 g",
    servingSize: 120,
    servingUnit: "g",
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
    caloriesPer100g: 206,
    proteinPer100g: 4,
    carbsPer100g: 45,
    fatPer100g: 0,
    serving: "1 cup",
    servingSize: 1,
    servingUnit: "cup",
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
    caloriesPer100g: 95,
    proteinPer100g: 0,
    carbsPer100g: 25,
    fatPer100g: 0,
    serving: "1 medium",
    servingSize: 1,
    servingUnit: "medium",
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
    caloriesPer100g: 203,
    proteinPer100g: 22,
    carbsPer100g: 0,
    fatPer100g: 12,
    serving: "115 g",
    servingSize: 115,
    servingUnit: "g",
    favorite: true,
  },
];

export const initialLogs: LogEntry[] = [
  { id: "log-1", food: foods[0], meal: "breakfast", quantity: 1, amount: 170 },
  { id: "log-2", food: foods[1], meal: "breakfast", quantity: 1, amount: 40 },
  { id: "log-3", food: foods[2], meal: "lunch", quantity: 1.25, amount: 150 },
  { id: "log-4", food: foods[3], meal: "lunch", quantity: 1, amount: 1 },
  { id: "log-5", food: foods[4], meal: "snacks", quantity: 1, amount: 1 },
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

export function macroFor(logs: LogEntry[], key: "calories" | "protein" | "carbs" | "fat") {
  return Math.round(logs.reduce((sum, entry) => sum + entry.food[key] * entry.quantity, 0));
}

export function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2).replace(/0$/, "");
}
