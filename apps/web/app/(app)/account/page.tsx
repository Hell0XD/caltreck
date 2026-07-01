"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { UserWeightResponse } from "@caltrek/api-client";
import {
  AlertTriangle,
  Check,
  LogOut,
  PlayCircle,
  RefreshCw,
  Scale,
  Settings,
  Trash2,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  preferredTimezone,
  supportedTimezoneValues,
  timezoneOptions,
} from "@/lib/caltrek/timezone-utils";
import { UnitUtils, unitSystemOptions, type UnitSystem } from "@/lib/caltrek/unit-utils";
import {
  activityOptions,
  activityLevelValues,
  ageFromDateOfBirth,
  genderOptions,
  nutritionGoalValues,
  nutritionGoalOptions,
  type ActivityLevelValue,
  type GenderValue,
  type NutritionGoalValue,
} from "@/lib/caltrek/onboarding-calculator";

const accountSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().min(1, "First name is required.").max(60),
  lastName: z.string().trim().min(1, "Last name is required.").max(60),
  timezone: z.enum(supportedTimezoneValues),
  unitSystem: z.enum(["metric", "imperial"]),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => {
      const age = ageFromDateOfBirth(value);
      return age >= 13 && age <= 120 && value < DateUtils.todayIso();
    }, "Enter a valid date of birth."),
  heightCm: goalSchema("Height", 1),
  activityLevel: z.enum(activityLevelValues),
  nutritionGoal: z.enum(nutritionGoalValues),
  calorieGoal: goalSchema("Calories", 1),
  proteinGoal: goalSchema("Protein", 0),
  carbsGoal: goalSchema("Carbs", 0),
  fatGoal: goalSchema("Fat", 0),
});

type AccountForm = z.infer<typeof accountSchema>;
type GoalFieldName = "heightCm" | "calorieGoal" | "proteinGoal" | "carbsGoal" | "fatGoal";

export default function AccountPage() {
  const {
    user,
    goals,
    weights,
    updateProfile,
    saveWeight,
    deleteWeight,
    deleteAccount,
    openOnboardingHelper,
    replayAppTour,
    logout,
  } = useCaltrek();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const form = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: userToForm(user, goals),
  });
  const unitSystem = UnitUtils.normalize(form.watch("unitSystem"));
  const timezone = form.watch("timezone");
  const timezoneSelectOptions = timezoneOptions.some((option) => option.value === timezone)
    ? timezoneOptions
    : [{ value: timezone, label: timezone }, ...timezoneOptions];

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
        unitSystem: value.unitSystem,
        gender: value.gender,
        dateOfBirth: value.dateOfBirth,
        heightCm: UnitUtils.displayHeightToCm(Number(value.heightCm), value.unitSystem),
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

  function changeUnitSystem(nextSystem: UnitSystem) {
    const currentSystem = UnitUtils.normalize(form.getValues("unitSystem"));
    const currentHeight = Number(form.getValues("heightCm"));
    if (Number.isFinite(currentHeight) && currentHeight > 0 && nextSystem !== currentSystem) {
      const heightCm = UnitUtils.displayHeightToCm(currentHeight, currentSystem);
      form.setValue("heightCm", FormatUtils.quantity(UnitUtils.cmToDisplay(heightCm, nextSystem)), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    form.setValue("unitSystem", nextSystem, { shouldDirty: true, shouldValidate: true });
  }

  async function confirmDeleteAccount() {
    if (!deletePassword) {
      setDeleteAccountError("Enter your password to delete your account.");
      return;
    }
    setDeleteAccountError(null);
    setDeletingAccount(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteAccountOpen(false);
      setDeletePassword("");
    } catch (nextError) {
      setDeleteAccountError(
        nextError instanceof Error ? nextError.message : "Could not delete your account.",
      );
    } finally {
      setDeletingAccount(false);
    }
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
                  <GoalField
                    control={form.control}
                    label={UnitUtils.heightLabel(unitSystem)}
                    name="heightCm"
                    min="1"
                    step={UnitUtils.heightInputStep(unitSystem)}
                  />
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

      <WeightProgress
        weights={weights}
        latestWeight={user.latestWeightKg}
        unitSystem={unitSystem}
        onSave={saveWeight}
        onDelete={deleteWeight}
      />

      <ContentCard>
        <CardContent className="p-4 sm:p-5">
          <section className="space-y-4 rounded-2xl bg-[var(--surface)] p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <Settings className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                  Preferences
                </p>
                <h2 className="mt-1 text-lg font-bold">Display</h2>
              </div>
            </div>

            <Form {...form}>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  control={form.control}
                  name="timezone"
                  label="Timezone"
                  options={timezoneSelectOptions}
                />
                <FormField
                  control={form.control}
                  name="unitSystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">System</FormLabel>
                      <FormControl>
                        <Select
                          value={UnitUtils.normalize(field.value)}
                          onValueChange={(value) => changeUnitSystem(value as UnitSystem)}
                        >
                          <SelectTrigger aria-label="System">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {unitSystemOptions.map((option) => (
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
              </div>
              {error && <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>}
              <Button
                type="button"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="w-full"
                onClick={form.handleSubmit(submit)}
              >
                <Check className="size-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save preferences"}
              </Button>
            </Form>
          </section>
        </CardContent>
      </ContentCard>

      <Button variant="outline" size="lg" onClick={startTourReplay} className="w-full">
        <PlayCircle className="size-4" />
        Replay guided tour
      </Button>

      <Button variant="outline" size="lg" onClick={logout} className="w-full">
        <LogOut className="size-4" />
        Sign out
      </Button>

      <Button
        variant="destructive"
        size="lg"
        onClick={() => {
          setDeleteAccountError(null);
          setDeletePassword("");
          setDeleteAccountOpen(true);
        }}
        className="w-full"
      >
        <AlertTriangle className="size-4" />
        Delete account
      </Button>

      <AlertDialog
        open={deleteAccountOpen}
        onOpenChange={(open) => {
          if (!open && !deletingAccount) {
            setDeleteAccountOpen(false);
            setDeleteAccountError(null);
            setDeletePassword("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your profile and all the information about you. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="grid gap-2">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">Password</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              className="h-11"
              onChange={(event) => setDeletePassword(event.target.value)}
            />
          </label>
          {deleteAccountError && (
            <p className="text-sm font-semibold text-[var(--destructive)]">
              {deleteAccountError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingAccount || !deletePassword}
              onClick={confirmDeleteAccount}
            >
              {deletingAccount ? "Deleting..." : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GoalField({
  control,
  label,
  name,
  min,
  step = "any",
}: {
  control: Control<AccountForm>;
  label: string;
  name: GoalFieldName;
  min: string;
  step?: string;
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
              step={step}
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
  name: "gender" | "activityLevel" | "nutritionGoal" | "timezone";
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
              <SelectTrigger aria-label={label}>
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
  unitSystem,
  onSave,
  onDelete,
}: {
  weights: UserWeightResponse[];
  latestWeight?: number;
  unitSystem: UnitSystem;
  onSave: (measuredOn: string, weightKg: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [measuredOn, setMeasuredOn] = useState(DateUtils.todayIso());
  const [displayWeight, setDisplayWeight] = useState(() =>
    UnitUtils.formatWeightInput(latestWeight, unitSystem),
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserWeightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recentWeights = [...weights].sort((left, right) =>
    right.measuredOn.localeCompare(left.measuredOn),
  );

  useEffect(() => {
    setDisplayWeight(UnitUtils.formatWeightInput(latestWeight, unitSystem));
  }, [latestWeight, unitSystem]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedWeight = Number(displayWeight);
    if (!measuredOn || measuredOn > DateUtils.todayIso() || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Enter a past or current date and a positive weight.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(measuredOn, UnitUtils.displayWeightToKg(parsedWeight, unitSystem));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not save weight.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not delete weight.");
    } finally {
      setDeleting(false);
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

          <WeightChart weights={weights} unitSystem={unitSystem} />

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
                {UnitUtils.weightLabel(unitSystem)}
              </span>
              <Input
                type="number"
                min="1"
                step={UnitUtils.weightInputStep(unitSystem)}
                inputMode="decimal"
                value={displayWeight}
                className="h-11"
                onChange={(event) => setDisplayWeight(event.target.value)}
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
                <div className="flex items-center gap-2">
                  <span className="font-bold tabular-nums">
                    {UnitUtils.formatWeight(entry.weightKg, unitSystem)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete weight from ${DateUtils.format(entry.measuredOn, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}`}
                    className="size-8 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                    onClick={() => setDeleteTarget(entry)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
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
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        {deleteTarget && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete weight entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes {UnitUtils.formatWeight(deleteTarget.weightKg, unitSystem)} from{" "}
                {DateUtils.format(deleteTarget.measuredOn, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={deleting} onClick={confirmDelete}>
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ContentCard>
  );
}

function WeightChart({ weights, unitSystem }: { weights: UserWeightResponse[]; unitSystem: UnitSystem }) {
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
        <span>{UnitUtils.formatWeight(ordered[0].weightKg, unitSystem)}</span>
        <span>{UnitUtils.formatWeight(ordered.at(-1)!.weightKg, unitSystem)}</span>
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
    timezone: preferredTimezone(user.timezone),
    unitSystem: UnitUtils.normalize(user.unitSystem),
    gender: ((user.gender as GenderValue | undefined) ?? "other") satisfies GenderValue,
    dateOfBirth: user.dateOfBirth ?? "",
    heightCm: UnitUtils.formatHeightInput(user.heightCm, UnitUtils.normalize(user.unitSystem)),
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
