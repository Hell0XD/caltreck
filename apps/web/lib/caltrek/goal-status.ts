import type { DailySummaryResponse } from "@caltrek/api-client";
import type { MacroGoals, MacroKey, MacroTotals } from "./models";

export type GoalStatus = "hit" | "almost" | "missed" | "no-log";

const targetFloor = 0.9;
const calorieCeiling = 1.1;
const macroKeys: MacroKey[] = ["protein", "carbs", "fat"];

export class GoalStatusUtils {
  static forSummary(summary: DailySummaryResponse | undefined, goals: MacroGoals): GoalStatus {
    if (!summary || summary.entries.length === 0) {
      return "no-log";
    }

    return this.forTotals(summary, true, goals);
  }

  static forTotals(totals: MacroTotals, hasEntries: boolean, goals: MacroGoals): GoalStatus {
    if (!hasEntries) {
      return "no-log";
    }

    const caloriesHit =
      totals.calories >= goals.calories * targetFloor &&
      totals.calories <= goals.calories * calorieCeiling;
    const macrosHit = macroKeys.every(
      (key) => goals[key] <= 0 || totals[key] >= goals[key] * targetFloor,
    );

    if (caloriesHit && macrosHit) {
      return "hit";
    }
    if (caloriesHit) {
      return "almost";
    }
    return "missed";
  }
}
