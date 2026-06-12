"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Sparkles, Utensils } from "lucide-react";
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
import {BrandBlock} from "@/components/caltrek/brand-block";

type AuthMode = "login" | "register";

const authSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    displayName: z.string().trim().max(80, "Display name must be 80 characters or fewer."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
  })
  .superRefine((value, context) => {
    if (value.mode === "register" && !value.displayName) {
      context.addIssue({
        code: "custom",
        path: ["displayName"],
        message: "Display name is required.",
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
    displayName: string,
  ) => Promise<void>;
}) {
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: "login",
      displayName: "",
      email: "",
      password: "",
    },
  });
  const mode = form.watch("mode");

  async function submit(value: AuthFormValues) {
    if (!onSubmit) {
      return;
    }
    await onSubmit(value.mode, value.email, value.password, value.displayName);
  }

  function setMode(nextMode: AuthMode) {
    form.setValue("mode", nextMode, { shouldDirty: true });
    if (nextMode === "login") {
      form.clearErrors("displayName");
    }
  }

  return (
    <main className="grid min-h-dvh bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <section className="mx-auto flex w-full max-w-sm flex-col justify-center">
        <BrandBlock className="mb-8" />

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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
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
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display name</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="name"
                              placeholder="Alex"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
