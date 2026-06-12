import type {
  DailyLogResponse,
  FoodResponse,
  UserLibraryResponse,
  UserResponse,
} from "@caltrek/api-client";
import { FormatUtils } from "./format-utils";
import { MealUtils } from "./meal-utils";
import type { Food, LogEntry, MacroGoals } from "./models";
import { NutritionUtils } from "./nutrition-utils";
import { QuantityUtils } from "./quantity-utils";

type FoodShape = Pick<
  FoodResponse,
  "id" | "name" | "caloriesPer100g" | "proteinPer100g" | "carbsPer100g" | "fatPer100g"
> &
  Partial<
    Pick<
      FoodResponse,
      | "brand"
      | "barcode"
      | "locale"
      | "source"
      | "servingSize"
      | "servingUnit"
      | "packageQuantity"
      | "packageUnit"
      | "fiberPer100g"
      | "sugarPer100g"
      | "saltPer100g"
    >
  >;

export class FoodMapper {
  static food(food: FoodShape): Food {
    const servingSize = food.servingSize ?? 100;
    const servingUnit = food.servingUnit ?? "g";
    const factor = servingUnit === "g" || servingUnit === "ml" ? servingSize / 100 : 1;
    return {
      ...food,
      brand: food.brand ?? "Caltrek",
      calories: NutritionUtils.round(food.caloriesPer100g * factor),
      protein: NutritionUtils.round(food.proteinPer100g * factor),
      carbs: NutritionUtils.round(food.carbsPer100g * factor),
      fat: NutritionUtils.round(food.fatPer100g * factor),
      serving: `${FormatUtils.quantity(servingSize)} ${servingUnit}`,
      servingSize,
      servingUnit,
    };
  }

  static log(log: DailyLogResponse, fallbackFood?: Food): LogEntry {
    const food = fallbackFood ?? this.embeddedLogFood(log);
    return {
      id: log.id,
      food,
      meal: MealUtils.fromApi(log.mealType),
      quantity: QuantityUtils.fromApi(log, food),
      amount: log.quantity,
    };
  }

  static library(entry: UserLibraryResponse): Food {
    const food = this.food({
      id: entry.foodId,
      name: entry.foodName,
      brand: entry.foodBrand,
      servingSize: entry.foodServingSize ?? entry.defaultQuantity,
      servingUnit: entry.foodServingUnit ?? entry.defaultUnit,
      packageQuantity: entry.foodPackageQuantity,
      packageUnit: entry.foodPackageUnit,
      caloriesPer100g: entry.foodCaloriesPer100g,
      proteinPer100g: entry.foodProteinPer100g,
      carbsPer100g: entry.foodCarbsPer100g,
      fatPer100g: entry.foodFatPer100g,
    });
    return {
      ...food,
      libraryEntryId: entry.id,
      favorite: entry.favorite,
      recent: true,
      defaultServings: entry.defaultQuantity ? entry.defaultQuantity / food.servingSize : 1,
    };
  }

  static mergeLibraryFlags(foods: Food[], libraryFoods: Food[]) {
    const libraryById = new Map(libraryFoods.map((food) => [food.id, food]));
    return foods.map((food) => {
      const libraryFood = libraryById.get(food.id);
      return libraryFood
        ? { ...food, favorite: libraryFood.favorite, libraryEntryId: libraryFood.libraryEntryId }
        : food;
    });
  }

  static goals(user: UserResponse): MacroGoals {
    return {
      calories: user.calorieGoal,
      protein: user.proteinGoal,
      carbs: user.carbsGoal,
      fat: user.fatGoal,
    };
  }

  private static embeddedLogFood(log: DailyLogResponse) {
    return this.food({
      id: log.foodId,
      name: log.foodName,
      brand: log.foodBrand,
      servingSize: log.foodServingSize,
      servingUnit: log.foodServingUnit,
      packageQuantity: log.foodPackageQuantity,
      packageUnit: log.foodPackageUnit,
      caloriesPer100g: log.foodCaloriesPer100g,
      proteinPer100g: log.foodProteinPer100g,
      carbsPer100g: log.foodCarbsPer100g,
      fatPer100g: log.foodFatPer100g,
    });
  }
}
