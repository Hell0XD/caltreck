"use client";

import type React from "react";
import { useId, useState } from "react";
import { LogIn, Sparkles, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type AuthMode = "login" | "register";

export function AuthScreen({
  loading,
  error,
  onSubmit,
}: {
  loading?: boolean;
  error?: string | null;
  onSubmit?: (
    mode: AuthMode,
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSubmit) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(mode, email, password, displayName);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <section className="mx-auto flex w-full max-w-sm flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-[var(--radius)] bg-[var(--primary)] text-white">
            <Utensils className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold">caltrek</p>
            <p className="text-sm text-[var(--muted-foreground)]">Daily nutrition</p>
          </div>
        </div>

        <Card className="gap-0 py-0 shadow-sm shadow-slate-950/5">
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 rounded-[var(--radius)]" />
                <Skeleton className="h-12 rounded-[var(--radius)]" />
                <Skeleton className="h-12 rounded-[var(--radius)]" />
                <Skeleton className="h-11 rounded-[var(--radius)]" />
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">
                    {mode === "login" ? "Welcome back" : "Create account"}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-normal">
                    {mode === "login" ? "Sign in" : "Start tracking"}
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-[var(--radius)] bg-[var(--surface)] p-1">
                  <Button
                    type="button"
                    onClick={() => setMode("login")}
                    variant={mode === "login" ? "secondary" : "ghost"}
                    className="h-10"
                  >
                    Sign in
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setMode("register")}
                    variant={mode === "register" ? "secondary" : "ghost"}
                    className="h-10"
                  >
                    Register
                  </Button>
                </div>

                {mode === "register" && (
                  <Field
                    label="Display name"
                    value={displayName}
                    onChange={setDisplayName}
                    autoComplete="name"
                    placeholder="Alex"
                  />
                )}
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="At least 8 characters"
                  required
                />

                {error && (
                  <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {mode === "login" ? (
                    <LogIn className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {submitting ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type">) {
  const id = useId();

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="h-11"
        {...props}
      />
    </div>
  );
}
