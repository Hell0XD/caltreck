"use client";

import { Check, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetScrollArea,
} from "@/components/caltrek/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealUtils } from "@/lib/caltrek/meal-utils";
import type { Food, LogEntry, MealType, QuantityMode } from "@/lib/caltrek/models";
import { NutritionUtils } from "@/lib/caltrek/nutrition-utils";
import { QuantityUtils } from "@/lib/caltrek/quantity-utils";
import { cn } from "@/lib/utils";

type SheetProps = {
  meal: MealType;
  quantity: number;
  quantityMode: QuantityMode;
  onMeal: (meal: MealType) => void;
  onQuantity: (quantity: number) => void;
  onQuantityMode: (mode: QuantityMode, food: Food) => void;
  onClose: () => void;
  onSave: () => void;
};

export function FoodSheet({
  food,
  onEdit,
  ...props
}: SheetProps & { food: Food | null; onEdit: (food: Food) => void }) {
  return (
    <BottomSheet open={Boolean(food)} onClose={props.onClose}>
      {food && (
        <SheetBody
          {...props}
          food={food}
          title={food.name}
          subtitle={`${food.brand} - ${food.serving}`}
          footer={
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Button variant="outline" size="lg" onClick={() => onEdit(food)} className="px-3">
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button size="lg" onClick={props.onSave}>
                <Check className="size-4" />
                Save food
              </Button>
            </div>
          }
        />
      )}
    </BottomSheet>
  );
}

export function EditLogSheet({
  entry,
  onDelete,
  ...props
}: SheetProps & { entry: LogEntry | null; onDelete: (entry: LogEntry) => void }) {
  return (
    <BottomSheet open={Boolean(entry)} onClose={props.onClose}>
      {entry && (
        <SheetBody
          {...props}
          food={entry.food}
          title={entry.food.name}
          subtitle="Edit log entry"
          footer={
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => onDelete(entry)}
                className="px-3"
              >
                <Trash2 className="size-4" />
              </Button>
              <Button size="lg" onClick={props.onSave}>
                <Check className="size-4" />
                Update entry
              </Button>
            </div>
          }
        />
      )}
    </BottomSheet>
  );
}

function SheetBody({
  title,
  subtitle,
  food,
  meal,
  quantity,
  quantityMode,
  footer,
  onMeal,
  onQuantity,
  onQuantityMode,
  onClose,
}: SheetProps & {
  title: string;
  subtitle: string;
  food: Food;
  footer: ReactNode;
}) {
  const supportsAmount = food.servingUnit === "g" || food.servingUnit === "ml";
  const supportsPackage = Boolean(food.packageQuantity && food.packageUnit);
  const step = quantityMode === "amount" ? 1 : 0.25;
  const minimum = quantityMode === "amount" ? 0.01 : 0.25;
  const quantityLabel =
    quantityMode === "servings"
      ? "Serving quantity"
      : quantityMode === "package"
        ? "Whole product quantity"
        : `Amount in ${food.servingUnit}`;

  return (
    <BottomSheetScrollArea>
      <BottomSheetHeader title={title} description={subtitle} onClose={onClose} />

      <NutritionDetails food={food} quantity={quantity} quantityMode={quantityMode} />

      <div>
        <p className="mb-2 text-sm font-semibold">Meal</p>
        <div className="grid grid-cols-4 gap-2">
          {MealUtils.all.map((item) => (
            <Button
              key={item}
              type="button"
              variant={meal === item ? "secondary" : "outline"}
              onClick={() => onMeal(item)}
              className={cn("h-11 px-2 text-xs", meal === item && "text-primary")}
            >
              {MealUtils.label(item)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            {quantityMode === "servings"
              ? "Servings"
              : quantityMode === "package"
                ? "Whole product"
                : "Amount"}
          </p>
          {(supportsAmount || supportsPackage) && (
            <div
              className={cn(
                "grid rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-1",
                supportsAmount && supportsPackage ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              <QuantityModeButton
                mode="servings"
                current={quantityMode}
                onClick={() => onQuantityMode("servings", food)}
              >
                Servings
              </QuantityModeButton>
              {supportsAmount && (
                <QuantityModeButton
                  mode="amount"
                  current={quantityMode}
                  onClick={() => onQuantityMode("amount", food)}
                >
                  {food.servingUnit === "g" ? "Grams" : "Milliliters"}
                </QuantityModeButton>
              )}
              {supportsPackage && (
                <QuantityModeButton
                  mode="package"
                  current={quantityMode}
                  onClick={() => onQuantityMode("package", food)}
                >
                  Whole product
                </QuantityModeButton>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-3">
          <Button
            variant="outline"
            size="icon"
            aria-label={`Decrease ${quantityLabel.toLowerCase()}`}
            onClick={() => onQuantity(Math.max(minimum, Number((quantity - step).toFixed(2))))}
          >
            <Minus className="size-4" />
          </Button>
          <div className="relative min-w-0">
            <Input
              aria-label={quantityLabel}
              value={quantity}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (next > 0) {
                  onQuantity(next);
                }
              }}
              inputMode="decimal"
              className={cn(
                "h-11 text-center text-lg font-semibold",
                quantityMode !== "servings" && "pr-10",
              )}
            />
            {quantityMode !== "servings" && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-[var(--muted-foreground)]">
                {quantityMode === "package" ? "x" : food.servingUnit}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Increase ${quantityLabel.toLowerCase()}`}
            onClick={() => onQuantity(Number((quantity + step).toFixed(2)))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      {footer}
    </BottomSheetScrollArea>
  );
}

function QuantityModeButton({
  mode,
  current,
  children,
  onClick,
}: {
  mode: QuantityMode;
  current: QuantityMode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={current === mode ? "secondary" : "ghost"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function NutritionDetails({
  food,
  quantity,
  quantityMode,
}: {
  food: Food;
  quantity: number;
  quantityMode: QuantityMode;
}) {
  const multiplier = QuantityUtils.toApi(food, quantity, quantityMode).quantity / food.servingSize;
  return (
    <div className="space-y-2">
      <NutritionRow label={`Per serving (${food.serving})`} values={NutritionUtils.values(food)} />
      <NutritionRow
        label={food.servingUnit === "ml" ? "Per 100 ml" : "Per 100 g"}
        values={{
          calories: food.caloriesPer100g,
          protein: food.proteinPer100g,
          carbs: food.carbsPer100g,
          fat: food.fatPer100g,
        }}
      />
      <NutritionRow
        label="Selected total"
        values={{
          calories: food.calories * multiplier,
          protein: food.protein * multiplier,
          carbs: food.carbs * multiplier,
          fat: food.fat * multiplier,
        }}
        selected
      />
    </div>
  );
}

function NutritionRow({
  label,
  values,
  selected,
}: {
  label: string;
  values: ReturnType<typeof NutritionUtils.values>;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-3",
        selected && "border-[var(--primary)] bg-[var(--primary-soft)]",
      )}
    >
      <p className="mb-2 text-xs font-bold text-[var(--muted-foreground)]">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
          <div key={key} className="min-w-0 text-center">
            <p className="truncate text-xs capitalize text-[var(--muted-foreground)]">
              {key === "calories" ? "kcal" : key}
            </p>
            <p className="mt-1 text-sm font-bold">
              {NutritionUtils.format(values[key])}
              {key === "calories" ? "" : "g"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
