import type { ActivityLevel, NutritionGoal } from "@caltrek/api-client";
import type { MacroGoals } from "./models";

export type GenderValue = "male" | "female" | "other";
export type ActivityLevelValue = ActivityLevel;
export type NutritionGoalValue = NutritionGoal;

export const activityLevelValues = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const satisfies readonly ActivityLevel[];

export const nutritionGoalValues = [
  "lose",
  "maintain",
  "gain",
] as const satisfies readonly NutritionGoal[];

export const genderOptions: Array<{ value: GenderValue; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const activityOptions: Array<{ value: ActivityLevel; label: string }> = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very active" },
];

export const nutritionGoalOptions: Array<{ value: NutritionGoal; label: string }> = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain weight" },
];

const genderOffset: Record<GenderValue, number> = {
  male: 5,
  female: -161,
  other: -78,
};

const activityMultiplier: Record<ActivityLevelValue, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const goalAdjustment: Record<NutritionGoalValue, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function ageFromDateOfBirth(dateOfBirth: string, now = new Date()) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }
  let age = now.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  if (!birthdayPassed) {
    age -= 1;
  }
  return age;
}

export function recommendedGoals({
  gender,
  dateOfBirth,
  heightCm,
  weightKg,
  activityLevel,
  nutritionGoal,
}: {
  gender: GenderValue;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevelValue;
  nutritionGoal: NutritionGoalValue;
}): MacroGoals {
  const age = ageFromDateOfBirth(dateOfBirth);
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset[gender];
  const adjustedCalories = bmr * activityMultiplier[activityLevel] + goalAdjustment[nutritionGoal];
  const calories = roundTo(Math.min(Math.max(adjustedCalories, 1200), 6000), 10);
  const protein = Math.round(weightKg * (nutritionGoal === "lose" ? 1.8 : 1.6));
  const fat = Math.round((calories * 0.25) / 9);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(Math.round((calories - proteinCalories - fatCalories) / 4), 0);

  return { calories, protein, carbs, fat };
}

function roundTo(value: number, precision: number) {
  return Math.round(value / precision) * precision;
}
