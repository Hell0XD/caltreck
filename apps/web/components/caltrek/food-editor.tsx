"use client";

import type { CreateFoodRequest } from "@caltrek/api-client";
import { Check, ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Food } from "./types";

export type FoodEditorValue = CreateFoodRequest;

const emptyFood: FoodEditorValue = {
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
  const [value, setValue] = useState<FoodEditorValue>(emptyFood);

  useEffect(() => {
    if (!open) {
      return;
    }
    setValue(food ? foodToEditorValue(food) : emptyFood);
  }, [food, open]);

  function setText(key: keyof FoodEditorValue, next: string) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  function setNumber(key: keyof FoodEditorValue, next: string) {
    setValue((current) => ({
      ...current,
      [key]: next === "" ? undefined : Number(next),
    }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      ...value,
      name: value.name.trim(),
      brand: optionalText(value.brand),
      barcode: optionalText(value.barcode),
      locale: optionalText(value.locale),
      servingUnit: optionalText(value.servingUnit),
      packageUnit: value.packageQuantity ? optionalText(value.packageUnit) : undefined,
    });
  }

  return (
    <Drawer.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[94dvh] max-w-md overflow-y-auto rounded-t-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl outline-none lg:max-w-lg">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border)]" />
          <form className="space-y-5" onSubmit={submit}>
            <div className="flex items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Close"
                title="Close"
                onClick={onClose}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div>
                <Drawer.Title className="text-xl font-semibold">
                  {food ? "Edit food" : "Create food"}
                </Drawer.Title>
                <Drawer.Description className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Nutrition values are entered per 100 g or 100 ml.
                </Drawer.Description>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" required className="sm:col-span-2">
                <TextInput
                  required
                  value={value.name}
                  onChange={(event) => setText("name", event.target.value)}
                />
              </Field>
              <Field label="Brand">
                <TextInput
                  value={value.brand ?? ""}
                  onChange={(event) => setText("brand", event.target.value)}
                />
              </Field>
              <Field label="Barcode">
                <TextInput
                  value={value.barcode ?? ""}
                  inputMode="numeric"
                  onChange={(event) => setText("barcode", event.target.value.replace(/\D/g, ""))}
                />
              </Field>
            </div>

            <EditorSection title="Serving">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Serving size">
                  <NumberInput
                    min="0.01"
                    value={value.servingSize ?? ""}
                    onChange={(event) => setNumber("servingSize", event.target.value)}
                  />
                </Field>
                <Field label="Unit">
                  <TextInput
                    placeholder="g"
                    value={value.servingUnit ?? ""}
                    onChange={(event) => setText("servingUnit", event.target.value)}
                  />
                </Field>
                <Field label="Whole product">
                  <NumberInput
                    min="0.01"
                    placeholder="Optional"
                    value={value.packageQuantity ?? ""}
                    onChange={(event) => setNumber("packageQuantity", event.target.value)}
                  />
                </Field>
                <Field label="Package unit">
                  <TextInput
                    placeholder="g"
                    value={value.packageUnit ?? ""}
                    onChange={(event) => setText("packageUnit", event.target.value)}
                  />
                </Field>
              </div>
            </EditorSection>

            <EditorSection title="Nutrition per 100">
              <div className="grid grid-cols-2 gap-3">
                <MacroField
                  label="Calories"
                  field="caloriesPer100g"
                  value={value}
                  onChange={setNumber}
                />
                <MacroField
                  label="Protein (g)"
                  field="proteinPer100g"
                  value={value}
                  onChange={setNumber}
                />
                <MacroField
                  label="Carbs (g)"
                  field="carbsPer100g"
                  value={value}
                  onChange={setNumber}
                />
                <MacroField label="Fat (g)" field="fatPer100g" value={value} onChange={setNumber} />
                <MacroField
                  label="Fiber (g)"
                  field="fiberPer100g"
                  value={value}
                  onChange={setNumber}
                />
                <MacroField
                  label="Sugar (g)"
                  field="sugarPer100g"
                  value={value}
                  onChange={setNumber}
                />
                <MacroField
                  label="Salt (g)"
                  field="saltPer100g"
                  value={value}
                  onChange={setNumber}
                />
              </div>
            </EditorSection>

            <Button
              type="submit"
              size="lg"
              disabled={saving || !value.name.trim()}
              className="w-full"
            >
              <Check className="size-4" />
              {saving ? "Saving..." : food ? "Save changes" : "Create food"}
            </Button>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function MacroField({
  label,
  field,
  value,
  onChange,
}: {
  label: string;
  field: keyof FoodEditorValue;
  value: FoodEditorValue;
  onChange: (key: keyof FoodEditorValue, value: string) => void;
}) {
  return (
    <Field label={label}>
      <NumberInput
        min="0"
        required={field === "caloriesPer100g"}
        value={(value[field] as number | undefined) ?? ""}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </Field>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  const id = React.useId();

  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-xs text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </Label>
      {React.cloneElement(children, { id })}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className="h-11" />;
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput {...props} type="number" step="any" inputMode="decimal" />;
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function foodToEditorValue(food: Food): FoodEditorValue {
  return {
    name: food.name,
    brand: food.brand,
    barcode: food.barcode,
    locale: food.locale,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    packageQuantity: food.packageQuantity,
    packageUnit: food.packageUnit,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    fiberPer100g: food.fiberPer100g,
    sugarPer100g: food.sugarPer100g,
    saltPer100g: food.saltPer100g,
  };
}
