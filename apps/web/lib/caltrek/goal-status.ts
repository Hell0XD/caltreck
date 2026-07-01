import type { DailyGoalStatus, DailySummaryResponse } from "@caltrek/api-client";
import type { MacroGoals } from "./models";

export type GoalStatus = DailyGoalStatus;

export class GoalStatusUtils {
  static forSummary(summary: DailySummaryResponse | undefined): GoalStatus {
    if (!summary) {
      return "no-log";
    }

    return summary.goalStatus;
  }

  static goalsForSummary(
    summary: DailySummaryResponse | undefined,
    fallbackGoals?: MacroGoals,
  ): MacroGoals {
    if (!summary) {
      return fallbackGoals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return {
      calories: summary.calorieGoal,
      protein: summary.proteinGoal,
      carbs: summary.carbsGoal,
      fat: summary.fatGoal,
    };
  }
}
