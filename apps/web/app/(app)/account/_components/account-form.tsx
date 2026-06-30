"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { UserWeightResponse } from "@caltrek/api-client";
import { Check, LogOut, PlayCircle, RefreshCw, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useForm, type Control } from "react-hook-form";
import { z } from "zod";
import { useCaltrek } from "@/hooks/use-caltrek";
import { ContentCard } from "@/components/caltrek/content-card";
import { DatePicker } from "@/components/caltrek/date-picker";
import { PageHeader } from "@/components/caltrek/page-header";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateUtils } from "@/lib/caltrek/date-utils";
import { FormatUtils } from "@/lib/caltrek/format-utils";
import {
  activityOptions,
  ageFromDateOfBirth,
  genderOptions,
  nutritionGoalOptions,
  type ActivityLevelValue,
  type GenderValue,
  type NutritionGoalValue,
} from "@/lib/caltrek/onboarding-calculator";

const accountSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().min(1, "First name is required.").max(60),
  lastName: z.string().trim().min(1, "Last name is required.").max(60),
  timezone: z.string().trim().min(1, "Timezone is required."),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => {
      const age = ageFromDateOfBirth(value);
      return age >= 13 && age <= 120 && value < DateUtils.todayIso();
    }, "Enter a valid date of birth."),
  heightCm: goalSchema("Height", 1),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  nutritionGoal: z.enum(["lose", "maintain", "gain"]),
  calorieGoal: goalSchema("Calories", 1),
  proteinGoal: goalSchema("Protein", 0),
  carbsGoal: goalSchema("Carbs", 0),
  fatGoal: goalSchema("Fat", 0),
});

type AccountForm = z.infer<typeof accountSchema>;
type GoalFieldName = "heightCm" | "calorieGoal" | "proteinGoal" | "carbsGoal" | "fatGoal";

export function AccountForm() {
  const {
    user,
    goals,
    weights,
    updateProfile,
    saveWeight,
    openOnboardingHelper,
    replayAppTour,
    logout,
  } = useCaltrek();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: userToForm(user, goals),
  });

  useEffect(() => {
    form.reset(userToForm(user, goals));
  }, [form, goals, user]);

  async function submit(value: AccountForm) {
    setError(null);
    try {
      await updateProfile({
        firstName: value.firstName,
        lastName: value.lastName,
        timezone: value.timezone,
        gender: value.gender,
        dateOfBirth: value.dateOfBirth,
        heightCm: Number(value.heightCm),
        activityLevel: value.activityLevel,
        nutritionGoal: value.nutritionGoal,
        calorieGoal: Number(value.calorieGoal),
        proteinGoal: Number(value.proteinGoal),
        carbsGoal: Number(value.carbsGoal),
        fatGoal: Number(value.fatGoal),
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update the account.");
    }
  }

  function startTourReplay() {
    router.push("/journal");
    window.setTimeout(replayAppTour, 150);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader eyebrow="Profile and targets" title="Account" />

      <ContentCard>
        <CardContent className="p-4 sm:p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
              <section className="space-y-3 rounded-2xl bg-[var(--surface)] p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                    Personal details
                  </p>
                  <h2 className="mt-1 text-lg font-bold">Profile</h2>
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          className="h-11 disabled:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">First name</FormLabel>
                        <FormControl>
                          <Input autoComplete="given-name" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Last name</FormLabel>
                        <FormControl>
                          <Input autoComplete="family-name" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Timezone</FormLabel>
                      <FormControl>
                        <Input className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField
                    control={form.control}
                    name="gender"
                    label="Gender"
                    options={genderOptions}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Date of birth
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Pick date of birth"
                            fromYear={new Date().getFullYear() - 120}
                            toYear={new Date().getFullYear() - 13}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <GoalField control={form.control} label="Height (cm)" name="heightCm" min="1" />
                  <SelectField
                    control={form.control}
                    name="activityLevel"
                    label="Activity"
                    options={activityOptions}
                  />
                  <SelectField
                    control={form.control}
                    name="nutritionGoal"
                    label="Goal"
                    options={nutritionGoalOptions}
                  />
                </div>
              </section>

              <section className="space-y-3 rounded-2xl bg-[var(--primary-soft)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                      Nutrition plan
                    </p>
                    <h2 className="mt-1 text-lg font-bold">Daily goals</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      These targets drive the progress shown on Today.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openOnboardingHelper}
                    className="shrink-0 bg-[var(--card)]"
                  >
                    <RefreshCw className="size-4" />
                    Recalibrate
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GoalField control={form.control} label="Calories" name="calorieGoal" min="1" />
                  <GoalField
                    control={form.control}
                    label="Protein (g)"
                    name="proteinGoal"
                    min="0"
                  />
                  <GoalField control={form.control} label="Carbs (g)" name="carbsGoal" min="0" />
                  <GoalField control={form.control} label="Fat (g)" name="fatGoal" min="0" />
                </div>
              </section>

              {error && <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>}

              <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                <Check className="size-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </ContentCard>

      <WeightProgress weights={weights} latestWeight={user.latestWeightKg} onSave={saveWeight} />

      <Button variant="outline" size="lg" onClick={startTourReplay} className="w-full">
        <PlayCircle className="size-4" />
        Replay guided tour
      </Button>

      <Button variant="outline" size="lg" onClick={logout} className="w-full">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}

function GoalField({
  control,
  label,
  name,
  min,
}: {
  control: Control<AccountForm>;
  label: string;
  name: GoalFieldName;
  min: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs text-muted-foreground">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={min}
              step="any"
              inputMode="decimal"
              className="h-11"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({
  control,
  label,
  name,
  options,
}: {
  control: Control<AccountForm>;
  label: string;
  name: "gender" | "activityLevel" | "nutritionGoal";
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs text-muted-foreground">{label}</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function WeightProgress({
  weights,
  latestWeight,
  onSave,
}: {
  weights: UserWeightResponse[];
  latestWeight?: number;
  onSave: (measuredOn: string, weightKg: number) => Promise<void>;
}) {
  const [measuredOn, setMeasuredOn] = useState(DateUtils.todayIso());
  const [weightKg, setWeightKg] = useState(latestWeight ? String(latestWeight) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recentWeights = [...weights].sort((left, right) =>
    right.measuredOn.localeCompare(left.measuredOn),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedWeight = Number(weightKg);
    if (!measuredOn || measuredOn > DateUtils.todayIso() || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Enter a past or current date and a positive weight.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(measuredOn, parsedWeight);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not save weight.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ContentCard>
      <CardContent className="p-4 sm:p-5">
        <section className="space-y-4 rounded-2xl bg-[var(--surface)] p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Scale className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                Progress
              </p>
              <h2 className="mt-1 text-lg font-bold">Weight</h2>
            </div>
          </div>

          <WeightChart weights={weights} />

          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[var(--muted-foreground)]">Date</span>
              <DatePicker
                value={measuredOn}
                onChange={setMeasuredOn}
                placeholder="Pick measurement date"
                disabled={(date) => date > new Date()}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[var(--muted-foreground)]">
                Weight (kg)
              </span>
              <Input
                type="number"
                min="1"
                step="any"
                inputMode="decimal"
                value={weightKg}
                className="h-11"
                onChange={(event) => setWeightKg(event.target.value)}
              />
            </label>
            <Button type="submit" size="lg" disabled={saving} className="self-end">
              <Check className="size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>

          {error && <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>}

          <div className="space-y-2">
            {recentWeights.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--card)] px-3 py-2 text-sm"
              >
                <span className="font-semibold">
                  {DateUtils.format(entry.measuredOn, { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="font-bold tabular-nums">
                  {FormatUtils.quantity(entry.weightKg)} kg
                </span>
              </div>
            ))}
            {recentWeights.length === 0 && (
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                Your first onboarding weight will appear here.
              </p>
            )}
          </div>
        </section>
      </CardContent>
    </ContentCard>
  );
}

function WeightChart({ weights }: { weights: UserWeightResponse[] }) {
  if (weights.length < 2) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--card)] px-4 text-center text-sm font-semibold text-[var(--muted-foreground)]">
        Add another weight entry to see your trend.
      </div>
    );
  }

  const ordered = [...weights].sort((left, right) => left.measuredOn.localeCompare(right.measuredOn));
  const values = ordered.map((entry) => entry.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = ordered
    .map((entry, index) => {
      const x = ordered.length === 1 ? 50 : (index / (ordered.length - 1)) * 100;
      const y = 90 - ((entry.weightKg - min) / range) * 70;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl bg-[var(--card)] p-3">
      <svg viewBox="0 0 100 100" role="img" aria-label="Weight progress chart" className="h-40 w-full">
        <polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {ordered.map((entry, index) => {
          const x = ordered.length === 1 ? 50 : (index / (ordered.length - 1)) * 100;
          const y = 90 - ((entry.weightKg - min) / range) * 70;
          return <circle key={entry.id} cx={x} cy={y} r="3" fill="var(--secondary)" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs font-bold text-[var(--muted-foreground)]">
        <span>{FormatUtils.quantity(ordered[0].weightKg)} kg</span>
        <span>{FormatUtils.quantity(ordered.at(-1)!.weightKg)} kg</span>
      </div>
    </div>
  );
}

function goalSchema(label: string, minimum: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} goal is required.`)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= minimum, {
      message: `${label} goal must be at least ${minimum}.`,
    });
}

function userToForm(
  user: ReturnType<typeof useCaltrek>["user"],
  goals: ReturnType<typeof useCaltrek>["goals"],
): AccountForm {
  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    timezone: user.timezone,
    gender: ((user.gender as GenderValue | undefined) ?? "other") satisfies GenderValue,
    dateOfBirth: user.dateOfBirth ?? "",
    heightCm: user.heightCm ? String(user.heightCm) : "",
    activityLevel:
      ((user.activityLevel as ActivityLevelValue | undefined) ?? "moderate") satisfies ActivityLevelValue,
    nutritionGoal:
      ((user.nutritionGoal as NutritionGoalValue | undefined) ?? "maintain") satisfies NutritionGoalValue,
    calorieGoal: String(goals.calories),
    proteinGoal: String(goals.protein),
    carbsGoal: String(goals.carbs),
    fatGoal: String(goals.fat),
  };
}
