"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type Control } from "react-hook-form";
import { z } from "zod";
import { useCaltrek } from "@/hooks/use-caltrek";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const accountSchema = z.object({
  email: z.string().email(),
  displayName: z.string().trim().max(80, "Display name must be 80 characters or fewer."),
  timezone: z.string().trim().min(1, "Timezone is required."),
  calorieGoal: goalSchema("Calories", 1),
  proteinGoal: goalSchema("Protein", 0),
  carbsGoal: goalSchema("Carbs", 0),
  fatGoal: goalSchema("Fat", 0),
});

type AccountForm = z.infer<typeof accountSchema>;
type GoalFieldName = "calorieGoal" | "proteinGoal" | "carbsGoal" | "fatGoal";

export function AccountForm() {
  const { user, goals, updateProfile, logout } = useCaltrek();
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
        displayName: value.displayName || undefined,
        timezone: value.timezone,
        calorieGoal: Number(value.calorieGoal),
        proteinGoal: Number(value.proteinGoal),
        carbsGoal: Number(value.carbsGoal),
        fatGoal: Number(value.fatGoal),
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update the account.");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Profile and targets</p>
        <h1 className="text-3xl font-semibold tracking-normal">Account</h1>
      </div>

      <Card className="gap-0 py-0 shadow-sm shadow-slate-950/5">
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
              <section className="space-y-3">
                <h2 className="text-base font-semibold">Profile</h2>
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
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Display name</FormLabel>
                      <FormControl>
                        <Input className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold">Daily goals</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    These targets drive the progress shown on Today.
                  </p>
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
      </Card>

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
    displayName: user.displayName ?? "",
    timezone: user.timezone,
    calorieGoal: String(goals.calories),
    proteinGoal: String(goals.protein),
    carbsGoal: String(goals.carbs),
    fatGoal: String(goals.fat),
  };
}
