import type { DailyLogResponse } from "@caltrek/api-client";
import type { Food, QuantityMode } from "./models";

export class QuantityUtils {
  static toApi(food: Food, quantity: number, mode: QuantityMode) {
    if (mode === "amount") {
      return { quantity: Number(quantity.toFixed(2)), unit: food.servingUnit };
    }
    if (mode === "package") {
      return {
        quantity: Number(((food.packageQuantity ?? food.servingSize) * quantity).toFixed(2)),
        unit: food.packageUnit ?? food.servingUnit,
      };
    }
    return {
      quantity: Number((food.servingSize * quantity).toFixed(2)),
      unit: food.servingUnit,
    };
  }

  static fromApi(log: DailyLogResponse, food: Food) {
    return food.servingSize ? Number((log.quantity / food.servingSize).toFixed(2)) : log.quantity;
  }

  static convert(food: Food, quantity: number, from: QuantityMode, to: QuantityMode) {
    const amount = this.toApi(food, quantity, from).quantity;
    const divisor =
      to === "amount" ? 1 : to === "package" ? (food.packageQuantity ?? amount) : food.servingSize;
    return Number((amount / divisor).toFixed(2));
  }
}
