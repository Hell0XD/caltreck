import type { UserResponse } from "@caltrek/api-client";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type MacroKey = "calories" | "protein" | "carbs" | "fat";
export type MacroTotals = Record<MacroKey, number>;
export type MacroGoals = MacroTotals;
export type QuantityMode = "servings" | "amount" | "package";

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

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
};
