import type { Food, LogEntry, MacroKey, MacroTotals } from "./models";

export class NutritionUtils {
  static macroFor(logs: LogEntry[], key: MacroKey) {
    return Math.round(logs.reduce((sum, entry) => sum + entry.food[key] * entry.quantity, 0));
  }

  static totals(logs: LogEntry[]): MacroTotals {
    return {
      calories: this.macroFor(logs, "calories"),
      protein: this.macroFor(logs, "protein"),
      carbs: this.macroFor(logs, "carbs"),
      fat: this.macroFor(logs, "fat"),
    };
  }

  static values(food: Food): MacroTotals {
    return {
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    };
  }

  static format(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  }

  static round(value: number) {
    return Number(value.toFixed(2));
  }
}
