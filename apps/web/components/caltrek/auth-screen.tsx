"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Skeleton } from "@/components/ui/skeleton";
import { BrandBlock } from "@/components/caltrek/brand-block";
import { ThemeToggle } from "@/components/caltrek/theme-toggle";

type AuthMode = "login" | "register";

const authSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    firstName: z.string().trim().max(60, "First name must be 60 characters or fewer."),
    lastName: z.string().trim().max(60, "Last name must be 60 characters or fewer."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
  })
  .superRefine((value, context) => {
    if (value.mode === "register" && !value.firstName) {
      context.addIssue({
        code: "custom",
        path: ["firstName"],
        message: "First name is required.",
      });
    }
    if (value.mode === "register" && !value.lastName) {
      context.addIssue({
        code: "custom",
        path: ["lastName"],
        message: "Last name is required.",
      });
    }
  });

type AuthFormValues = z.infer<typeof authSchema>;

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
    firstName: string,
    lastName: string,
  ) => Promise<void>;
}) {
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: "login",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });
  const mode = form.watch("mode");

  async function submit(value: AuthFormValues) {
    if (!onSubmit) {
      return;
    }
    await onSubmit(value.mode, value.email, value.password, value.firstName, value.lastName);
  }

  function setMode(nextMode: AuthMode) {
    form.setValue("mode", nextMode, { shouldDirty: true });
    if (nextMode === "login") {
      form.clearErrors(["firstName", "lastName"]);
    }
  }

  return (
    <main className="relative grid min-h-dvh bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <ThemeToggle className="absolute right-4 top-4" />
      <section className="mx-auto flex w-full max-w-sm flex-col justify-center">
        <BrandBlock className="mb-8" />

        <Card className="gap-0 overflow-hidden py-0">
          <div className="h-2 bg-[var(--primary)]" />
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-11" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                      {mode === "login" ? "Welcome back" : "Create account"}
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">
                      {mode === "login" ? "Sign in" : "Start tracking"}
                    </h1>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-1">
                    <Button
                      type="button"
                      onClick={() => setMode("login")}
                      variant={mode === "login" ? "selected" : "ghost"}
                      className="h-10"
                    >
                      Sign in
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setMode("register")}
                      variant={mode === "register" ? "selected" : "ghost"}
                      className="h-10"
                    >
                      Register
                    </Button>
                  </div>

                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input
                                autoComplete="given-name"
                                placeholder="Alex"
                                className="h-11"
                                {...field}
                              />
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
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input
                                autoComplete="family-name"
                                placeholder="Morgan"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            placeholder="At least 8 characters"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <p className="rounded-xl border border-[var(--destructive)] bg-[var(--missed-soft)] px-3 py-2 text-sm font-semibold text-[var(--destructive-strong)]">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {mode === "login" ? (
                      <LogIn className="size-4" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {form.formState.isSubmitting
                      ? "Working..."
                      : mode === "login"
                        ? "Sign in"
                        : "Create account"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
