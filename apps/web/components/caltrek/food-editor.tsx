"use client";

import type { CreateFoodRequest } from "@caltrek/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { useForm, type Control } from "react-hook-form";
import { z } from "zod";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetScrollArea,
} from "@/components/caltrek/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Food } from "@/lib/caltrek/models";

export type FoodEditorValue = CreateFoodRequest;

const foodEditorSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    brand: z.string().trim(),
    barcode: z
      .string()
      .trim()
      .refine((value) => !value || /^\d+$/.test(value), "Barcode must contain only digits."),
    locale: z.string().trim(),
    servingSize: z.number().positive("Serving size must be greater than zero."),
    servingUnit: z.string().trim().min(1, "Serving unit is required."),
    packageQuantity: z.number().positive("Whole product must be greater than zero.").optional(),
    packageUnit: z.string().trim(),
    caloriesPer100g: z.number().nonnegative("Calories cannot be negative."),
    proteinPer100g: z.number().nonnegative("Protein cannot be negative."),
    carbsPer100g: z.number().nonnegative("Carbs cannot be negative."),
    fatPer100g: z.number().nonnegative("Fat cannot be negative."),
    fiberPer100g: z.number().nonnegative("Fiber cannot be negative."),
    sugarPer100g: z.number().nonnegative("Sugar cannot be negative."),
    saltPer100g: z.number().nonnegative("Salt cannot be negative."),
  })
  .superRefine((value, context) => {
    if (value.packageQuantity && !value.packageUnit) {
      context.addIssue({
        code: "custom",
        path: ["packageUnit"],
        message: "Package unit is required when whole product is set.",
      });
    }
  });

type FoodEditorFormValues = z.infer<typeof foodEditorSchema>;
type FoodTextFieldName = "name" | "brand" | "barcode" | "servingUnit" | "packageUnit";
type FoodNumberFieldName =
  | "servingSize"
  | "packageQuantity"
  | "caloriesPer100g"
  | "proteinPer100g"
  | "carbsPer100g"
  | "fatPer100g"
  | "fiberPer100g"
  | "sugarPer100g"
  | "saltPer100g";

const emptyFood: FoodEditorFormValues = {
  name: "",
  brand: "",
  barcode: "",
  locale: "",
  servingSize: 100,
  servingUnit: "g",
  packageQuantity: undefined,
  packageUnit: "g",
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbsPer100g: 0,
  fatPer100g: 0,
  fiberPer100g: 0,
  sugarPer100g: 0,
  saltPer100g: 0,
};

export function FoodEditor({
  open,
  food,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  food: Food | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (value: FoodEditorValue) => void;
}) {
  const form = useForm<FoodEditorFormValues>({
    resolver: zodResolver(foodEditorSchema),
    defaultValues: emptyFood,
  });

  useEffect(() => {
    if (open) {
      form.reset(food ? foodToEditorValue(food) : emptyFood);
    }
  }, [food, form, open]);

  function submit(value: FoodEditorFormValues) {
    onSubmit({
      ...value,
      brand: optionalText(value.brand),
      barcode: optionalText(value.barcode),
      locale: optionalText(value.locale),
      servingUnit: optionalText(value.servingUnit),
      packageUnit: value.packageQuantity ? optionalText(value.packageUnit) : undefined,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <BottomSheetScrollArea>
            <BottomSheetHeader
              title={food ? "Edit food" : "Create food"}
              description="Nutrition values are entered per 100 g or 100 ml."
              onClose={onClose}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <FoodTextField
                control={form.control}
                name="name"
                label="Name"
                required
                className="sm:col-span-2"
              />
              <FoodTextField control={form.control} name="brand" label="Brand" />
              <FoodTextField
                control={form.control}
                name="barcode"
                label="Barcode"
                inputMode="numeric"
                digitsOnly
              />
            </div>

            <EditorSection title="Serving">
              <div className="grid grid-cols-2 gap-3">
                <FoodNumberField
                  control={form.control}
                  name="servingSize"
                  label="Serving size"
                  min="0.01"
                />
                <FoodTextField
                  control={form.control}
                  name="servingUnit"
                  label="Unit"
                  placeholder="g"
                />
                <FoodNumberField
                  control={form.control}
                  name="packageQuantity"
                  label="Whole product"
                  min="0.01"
                  placeholder="Optional"
                />
                <FoodTextField
                  control={form.control}
                  name="packageUnit"
                  label="Package unit"
                  placeholder="g"
                />
              </div>
            </EditorSection>

            <EditorSection title="Nutrition per 100">
              <div className="grid grid-cols-2 gap-3">
                <FoodNumberField
                  control={form.control}
                  name="caloriesPer100g"
                  label="Calories"
                  min="0"
                />
                <FoodNumberField
                  control={form.control}
                  name="proteinPer100g"
                  label="Protein (g)"
                  min="0"
                />
                <FoodNumberField
                  control={form.control}
                  name="carbsPer100g"
                  label="Carbs (g)"
                  min="0"
                />
                <FoodNumberField control={form.control} name="fatPer100g" label="Fat (g)" min="0" />
                <FoodNumberField
                  control={form.control}
                  name="fiberPer100g"
                  label="Fiber (g)"
                  min="0"
                />
                <FoodNumberField
                  control={form.control}
                  name="sugarPer100g"
                  label="Sugar (g)"
                  min="0"
                />
                <FoodNumberField
                  control={form.control}
                  name="saltPer100g"
                  label="Salt (g)"
                  min="0"
                />
              </div>
            </EditorSection>

            <Button
              type="submit"
              size="lg"
              disabled={saving || form.formState.isSubmitting}
              className="w-full"
            >
              <Check className="size-4" />
              {saving ? "Saving..." : food ? "Save changes" : "Create food"}
            </Button>
          </BottomSheetScrollArea>
        </form>
      </Form>
    </BottomSheet>
  );
}

function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function FoodTextField({
  control,
  name,
  label,
  required,
  digitsOnly,
  className,
  ...inputProps
}: {
  control: Control<FoodEditorFormValues>;
  name: FoodTextFieldName;
  label: string;
  required?: boolean;
  digitsOnly?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "ref">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-xs text-muted-foreground">
            {label}
            {required ? " *" : ""}
          </FormLabel>
          <FormControl>
            <Input
              className="h-11"
              {...inputProps}
              {...field}
              onChange={(event) =>
                field.onChange(
                  digitsOnly ? event.target.value.replace(/\D/g, "") : event.target.value,
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FoodNumberField({
  control,
  name,
  label,
  ...inputProps
}: {
  control: Control<FoodEditorFormValues>;
  name: FoodNumberFieldName;
  label: string;
} & Omit<ComponentProps<typeof Input>, "name" | "type" | "value" | "onChange" | "onBlur" | "ref">) {
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
              step="any"
              inputMode="decimal"
              className="h-11"
              {...inputProps}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              onChange={(event) =>
                field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function foodToEditorValue(food: Food): FoodEditorFormValues {
  return {
    name: food.name,
    brand: food.brand ?? "",
    barcode: food.barcode ?? "",
    locale: food.locale ?? "",
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    packageQuantity: food.packageQuantity,
    packageUnit: food.packageUnit ?? "",
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    fiberPer100g: food.fiberPer100g ?? 0,
    sugarPer100g: food.sugarPer100g ?? 0,
    saltPer100g: food.saltPer100g ?? 0,
  };
}
