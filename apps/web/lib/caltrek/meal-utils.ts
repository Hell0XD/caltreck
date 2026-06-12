import type { DailyLogResponse } from "@caltrek/api-client";
import type { MealType } from "./models";

export class MealUtils {
  static readonly all: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

  static label(meal: MealType) {
    return meal === "snacks" ? "Snacks" : `${meal[0].toUpperCase()}${meal.slice(1)}`;
  }

  static toApi(meal: MealType) {
    return meal === "snacks" ? "SNACK" : (meal.toUpperCase() as "BREAKFAST" | "LUNCH" | "DINNER");
  }

  static fromApi(meal: DailyLogResponse["mealType"]): MealType {
    return meal === "SNACK" ? "snacks" : (meal.toLowerCase() as MealType);
  }
}
