"use client";

import type { ProfileUpdateRequest, UserResponse } from "@caltrek/api-client";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { BrandBlock } from "./brand-block";
import { DatePicker } from "./date-picker";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { ErrorUtils } from "@/lib/caltrek/error-utils";
import type { MacroGoals } from "@/lib/caltrek/models";
import {
  activityOptions,
  ageFromDateOfBirth,
  genderOptions,
  nutritionGoalOptions,
  recommendedGoals,
  type ActivityLevelValue,
  type GenderValue,
  type NutritionGoalValue,
} from "@/lib/caltrek/onboarding-calculator";

type OnboardingDraft = {
  gender: GenderValue;
  dateOfBirth: string;
  heightCm: string;
  startingWeightKg: string;
  activityLevel: ActivityLevelValue;
  nutritionGoal: NutritionGoalValue;
  calorieGoal: string;
  proteinGoal: string;
  carbsGoal: string;
  fatGoal: string;
};

export function OnboardingScreen({
  user,
  goals,
  saving,
  title = "Personal baseline",
  onCancel,
  onComplete,
}: {
  user: UserResponse;
  goals: MacroGoals;
  saving?: boolean;
  title?: string;
  onCancel?: () => void;
  onComplete: (profile: ProfileUpdateRequest, weightKg: number) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    gender: (user.gender as GenderValue | undefined) ?? "other",
    dateOfBirth: user.dateOfBirth ?? "",
    heightCm: user.heightCm ? String(user.heightCm) : "",
    startingWeightKg: user.latestWeightKg ? String(user.latestWeightKg) : "",
    activityLevel: (user.activityLevel as ActivityLevelValue | undefined) ?? "moderate",
    nutritionGoal: (user.nutritionGoal as NutritionGoalValue | undefined) ?? "maintain",
    calorieGoal: String(goals.calories),
    proteinGoal: String(goals.protein),
    carbsGoal: String(goals.carbs),
    fatGoal: String(goals.fat),
  }));

  const recommendation = useMemo(() => {
    const heightCm = Number(draft.heightCm);
    const weightKg = Number(draft.startingWeightKg);
    if (!draft.dateOfBirth || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
      return goals;
    }
    return recommendedGoals({
      gender: draft.gender,
      dateOfBirth: draft.dateOfBirth,
      heightCm,
      weightKg,
      activityLevel: draft.activityLevel,
      nutritionGoal: draft.nutritionGoal,
    });
  }, [
    draft.activityLevel,
    draft.dateOfBirth,
    draft.gender,
    draft.heightCm,
    draft.nutritionGoal,
    draft.startingWeightKg,
    goals,
  ]);

  function update<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function continueToTargets() {
    const validation = validateProfileStep(draft);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setDraft((current) => ({
      ...current,
      calorieGoal: String(recommendation.calories),
      proteinGoal: String(recommendation.protein),
      carbsGoal: String(recommendation.carbs),
      fatGoal: String(recommendation.fat),
    }));
    setStep(2);
  }

  async function finish() {
    const profileError = validateProfileStep(draft);
    const targetError = validateTargets(draft);
    if (profileError || targetError) {
      setError(profileError ?? targetError);
      return;
    }
    setError(null);
    try {
      await onComplete(
        {
          firstName: user.firstName || user.email.split("@")[0] || "User",
          lastName: user.lastName || "User",
          timezone: user.timezone,
          gender: draft.gender,
          dateOfBirth: draft.dateOfBirth,
          heightCm: Number(draft.heightCm),
          activityLevel: draft.activityLevel,
          nutritionGoal: draft.nutritionGoal,
          onboardingCompleted: true,
          calorieGoal: Number(draft.calorieGoal),
          proteinGoal: Number(draft.proteinGoal),
          carbsGoal: Number(draft.carbsGoal),
          fatGoal: Number(draft.fatGoal),
        },
        Number(draft.startingWeightKg),
      );
    } catch (nextError) {
      setError(ErrorUtils.message(nextError));
    }
  }

  return (
    <main className="relative min-h-dvh bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <ThemeToggle className="absolute right-4 top-4" />
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col justify-center">
        <BrandBlock className="mb-8" />
        <Card className="gap-0 overflow-hidden py-0">
          <div className="h-2 bg-[var(--primary)]" />
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                  Setup {step} of 2
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">
                  {step === 1 ? title : "Daily targets"}
                </h1>
              </div>
              <Sparkles className="mt-1 size-6 text-[var(--secondary)]" />
            </div>

            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Gender"
                  value={draft.gender}
                  onChange={(value) => update("gender", value as GenderValue)}
                  options={genderOptions}
                />
                <DateField
                  label="Date of birth"
                  value={draft.dateOfBirth}
                  onChange={(value) => update("dateOfBirth", value)}
                  fromYear={new Date().getFullYear() - 120}
                  toYear={new Date().getFullYear() - 13}
                />
                <InputField
                  label="Height (cm)"
                  type="number"
                  value={draft.heightCm}
                  onChange={(value) => update("heightCm", value)}
                  min="1"
                />
                <InputField
                  label="Starting weight (kg)"
                  type="number"
                  value={draft.startingWeightKg}
                  onChange={(value) => update("startingWeightKg", value)}
                  min="1"
                />
                <SelectField
                  label="Activity"
                  value={draft.activityLevel}
                  onChange={(value) => update("activityLevel", value as ActivityLevelValue)}
                  options={activityOptions}
                />
                <SelectField
                  label="Goal"
                  value={draft.nutritionGoal}
                  onChange={(value) => update("nutritionGoal", value as NutritionGoalValue)}
                  options={nutritionGoalOptions}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[var(--primary-soft)] p-4">
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    Recommended from your baseline
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-[-0.03em]">
                    {recommendation.calories} kcal
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    P {recommendation.protein}g · C {recommendation.carbs}g · F{" "}
                    {recommendation.fat}g
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Calories"
                    type="number"
                    value={draft.calorieGoal}
                    onChange={(value) => update("calorieGoal", value)}
                    min="1"
                  />
                  <InputField
                    label="Protein (g)"
                    type="number"
                    value={draft.proteinGoal}
                    onChange={(value) => update("proteinGoal", value)}
                    min="0"
                  />
                  <InputField
                    label="Carbs (g)"
                    type="number"
                    value={draft.carbsGoal}
                    onChange={(value) => update("carbsGoal", value)}
                    min="0"
                  />
                  <InputField
                    label="Fat (g)"
                    type="number"
                    value={draft.fatGoal}
                    onChange={(value) => update("fatGoal", value)}
                    min="0"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-[var(--destructive)] bg-[var(--missed-soft)] px-3 py-2 text-sm font-semibold text-[var(--destructive-strong)]">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              {step === 1 && onCancel && (
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
                  <ArrowLeft className="size-4" />
                  Account
                </Button>
              )}
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              )}
              {step === 1 ? (
                <Button type="button" size="lg" className="flex-1" onClick={continueToTargets}>
                  <ArrowRight className="size-4" />
                  Review targets
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  disabled={saving}
                  onClick={finish}
                >
                  <Check className="size-4" />
                  {saving ? "Saving..." : "Finish setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<typeof Input>, "value" | "onChange">) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-[var(--muted-foreground)]">{label}</span>
      <Input
        className="h-11"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
  fromYear,
  toYear,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fromYear?: number;
  toYear?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-[var(--muted-foreground)]">{label}</span>
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder="Pick date of birth"
        fromYear={fromYear}
        toYear={toYear}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-[var(--muted-foreground)]">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function validateProfileStep(draft: OnboardingDraft) {
  const age = ageFromDateOfBirth(draft.dateOfBirth);
  if (age < 13 || age > 120) {
    return "Enter a date of birth for someone between 13 and 120 years old.";
  }
  if (!positiveNumber(draft.heightCm)) {
    return "Enter your height in centimeters.";
  }
  if (!positiveNumber(draft.startingWeightKg)) {
    return "Enter your starting weight in kilograms.";
  }
  if (draft.dateOfBirth >= DateUtils.todayIso()) {
    return "Date of birth must be in the past.";
  }
  return null;
}

function validateTargets(draft: OnboardingDraft) {
  if (!positiveNumber(draft.calorieGoal)) {
    return "Calories must be greater than zero.";
  }
  if (![draft.proteinGoal, draft.carbsGoal, draft.fatGoal].every(nonNegativeNumber)) {
    return "Macro targets cannot be negative.";
  }
  return null;
}

function positiveNumber(value: string) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function nonNegativeNumber(value: string) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}
