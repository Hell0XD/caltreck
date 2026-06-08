"use client";

import { Check, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCaltrek } from "@/components/caltrek/app-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountForm = {
  displayName: string;
  timezone: string;
  calorieGoal: string;
  proteinGoal: string;
  carbsGoal: string;
  fatGoal: string;
};

export default function AccountPage() {
  const { user, goals, updateProfile, logout } = useCaltrek();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(() => userToForm(user, goals));

  useEffect(() => {
    setForm(userToForm(user, goals));
  }, [goals, user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName: form.displayName.trim() || undefined,
        timezone: form.timezone,
        calorieGoal: Number(form.calorieGoal),
        proteinGoal: Number(form.proteinGoal),
        carbsGoal: Number(form.carbsGoal),
        fatGoal: Number(form.fatGoal),
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update the account.");
    } finally {
      setSaving(false);
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
          <form onSubmit={submit} className="space-y-5">
            <section className="space-y-3">
              <h2 className="text-base font-semibold">Profile</h2>
              <AccountField label="Email">
                <AccountInput value={user.email} disabled />
              </AccountField>
              <AccountField label="Display name">
                <AccountInput
                  value={form.displayName}
                  onChange={(event) => setField("displayName", event.target.value)}
                />
              </AccountField>
              <AccountField label="Timezone">
                <AccountInput
                  required
                  value={form.timezone}
                  onChange={(event) => setField("timezone", event.target.value)}
                />
              </AccountField>
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold">Daily goals</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  These targets drive the progress shown on Today.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <GoalField
                  label="Calories"
                  field="calorieGoal"
                  value={form.calorieGoal}
                  onChange={setField}
                />
                <GoalField
                  label="Protein (g)"
                  field="proteinGoal"
                  value={form.proteinGoal}
                  onChange={setField}
                />
                <GoalField
                  label="Carbs (g)"
                  field="carbsGoal"
                  value={form.carbsGoal}
                  onChange={setField}
                />
                <GoalField
                  label="Fat (g)"
                  field="fatGoal"
                  value={form.fatGoal}
                  onChange={setField}
                />
              </div>
            </section>

            {error && <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>}

            <Button type="submit" size="lg" disabled={saving} className="w-full">
              <Check className="size-4" />
              {saving ? "Saving..." : "Save account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="outline" size="lg" onClick={logout} className="w-full">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );

  function setField(field: keyof AccountForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
}

function GoalField({
  label,
  field,
  value,
  onChange,
}: {
  label: string;
  field: keyof AccountForm;
  value: string;
  onChange: (field: keyof AccountForm, value: string) => void;
}) {
  return (
    <AccountField label={label}>
      <AccountInput
        type="number"
        min={field === "calorieGoal" ? "1" : "0"}
        step="any"
        required
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </AccountField>
  );
}

function AccountField({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  const id = React.useId();

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {React.cloneElement(children, { id })}
    </div>
  );
}

function AccountInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className="h-11 disabled:text-muted-foreground" />;
}

function userToForm(
  user: ReturnType<typeof useCaltrek>["user"],
  goals: ReturnType<typeof useCaltrek>["goals"],
): AccountForm {
  return {
    displayName: user.displayName ?? "",
    timezone: user.timezone,
    calorieGoal: String(goals.calories),
    proteinGoal: String(goals.protein),
    carbsGoal: String(goals.carbs),
    fatGoal: String(goals.fat),
  };
}
