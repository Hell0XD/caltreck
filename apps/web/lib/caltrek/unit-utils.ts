import type { UnitSystem } from "@caltrek/api-client";
import { FormatUtils } from "./format-utils";

export type { UnitSystem };

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export const unitSystemOptions: Array<{ value: UnitSystem; label: string }> = [
  { value: "metric", label: "Metric (cm, kg)" },
  { value: "imperial", label: "Imperial (in, lb)" },
];

export class UnitUtils {
  static normalize(unitSystem?: string): UnitSystem {
    return unitSystem === "imperial" ? "imperial" : "metric";
  }

  static weightLabel(unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? "Weight (lb)" : "Weight (kg)";
  }

  static heightLabel(unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? "Height (in)" : "Height (cm)";
  }

  static weightInputStep(unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? "0.1" : "any";
  }

  static heightInputStep(unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? "0.5" : "any";
  }

  static kgToDisplay(weightKg: number, unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? weightKg / KG_PER_LB : weightKg;
  }

  static displayWeightToKg(weight: number, unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? weight * KG_PER_LB : weight;
  }

  static cmToDisplay(heightCm: number, unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? heightCm / CM_PER_IN : heightCm;
  }

  static displayHeightToCm(height: number, unitSystem: UnitSystem) {
    return unitSystem === "imperial" ? height * CM_PER_IN : height;
  }

  static formatWeight(weightKg: number, unitSystem: UnitSystem) {
    const unit = unitSystem === "imperial" ? "lb" : "kg";
    return `${FormatUtils.quantity(this.kgToDisplay(weightKg, unitSystem))} ${unit}`;
  }

  static formatHeightInput(heightCm: number | undefined, unitSystem: UnitSystem) {
    if (!heightCm) {
      return "";
    }
    return FormatUtils.quantity(this.cmToDisplay(heightCm, unitSystem));
  }

  static formatWeightInput(weightKg: number | undefined, unitSystem: UnitSystem) {
    if (!weightKg) {
      return "";
    }
    return FormatUtils.quantity(this.kgToDisplay(weightKg, unitSystem));
  }
}
