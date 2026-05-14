"use client";

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { motion } from "framer-motion";
import { AlertCircle, Camera, Check, Keyboard, RotateCcw, ScanLine } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useCaltrek } from "@/components/caltrek/app-state";
import { AppButton } from "@/components/caltrek/ui";
import type { Food } from "@/components/caltrek/types";
import { cn } from "@/lib/utils";

type ScanState = "idle" | "requesting" | "scanning" | "resolving" | "success" | "failed";

type ApiFood = {
  id: string;
  name: string;
  brand?: string | null;
  servingSize?: number | null;
  servingUnit?: string | null;
  caloriesPer100g: number;
  proteinPer100g?: number | null;
  carbsPer100g?: number | null;
  fatPer100g?: number | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("Camera access is only used while this screen is scanning.");
  const [manualBarcode, setManualBarcode] = useState("");
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const { openAddFood } = useCaltrek();

  useEffect(() => () => stopScanner(), []);

  async function startScanner() {
    if (!videoRef.current) {
      return;
    }

    setScanState("requesting");
    setMessage("Waiting for camera permission.");
    try {
      const codeReader = new BrowserMultiFormatReader();
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          const barcode = result?.getText();
          if (!barcode || controlsRef.current === null) {
            return;
          }
          stopScanner();
          void resolveBarcode(barcode);
        },
      );
      setScanState("scanning");
      setMessage("Hold the barcode inside the frame.");
    } catch {
      setScanState("failed");
      setMessage("Camera permission was blocked or no camera was available.");
    }
  }

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }

  function pauseScanner() {
    stopScanner();
    setScanState("idle");
    setMessage("Camera paused. Start again when the barcode is in view.");
  }

  async function resolveBarcode(barcode: string) {
    const normalizedBarcode = barcode.trim();
    if (!/^\d{8,14}$/.test(normalizedBarcode)) {
      setScanState("failed");
      setMessage("Barcode must contain 8 to 14 digits.");
      return;
    }

    setLastBarcode(normalizedBarcode);
    setScanState("resolving");
    setMessage("Looking up barcode.");
    try {
      const response = await fetch(`${API_BASE_URL}/api/foods/barcode/${normalizedBarcode}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("Lookup failed");
      }
      const food = mapFood(await response.json() as ApiFood);
      setScanState("success");
      setMessage("Food found.");
      window.setTimeout(() => openAddFood(food), 450);
    } catch {
      setScanState("failed");
      setMessage("No food matched that barcode. Try again or enter it manually.");
    }
  }

  function submitManualBarcode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopScanner();
    void resolveBarcode(manualBarcode);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Barcode scanner</p>
        <h1 className="text-3xl font-semibold tracking-normal">Scan food</h1>
      </div>

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)]">
        <div className="relative aspect-[3/4] bg-slate-950">
          <video
            ref={videoRef}
            className={cn(
              "h-full w-full object-cover",
              scanState === "idle" && "opacity-30",
            )}
            muted
            playsInline
          />
          <div className="pointer-events-none absolute inset-0 grid place-items-center p-8">
            <div className="h-36 w-full max-w-64 rounded-[var(--radius)] border-2 border-white/80 shadow-[0_0_0_999px_rgb(2_6_23/0.45)]" />
          </div>
          {scanState === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 grid place-items-center bg-emerald-600/85 text-white"
            >
              <div className="grid place-items-center gap-3">
                <Check className="size-12" />
                <p className="text-base font-semibold">Matched</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <StatusIcon state={scanState} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{statusTitle(scanState)}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{message}</p>
              {lastBarcode && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{lastBarcode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppButton
              onClick={scanState === "scanning" ? pauseScanner : startScanner}
              disabled={scanState === "requesting" || scanState === "resolving"}
            >
              <Camera className="size-4" />
              {scanState === "scanning" ? "Stop" : "Camera"}
            </AppButton>
            <AppButton variant="secondary" onClick={() => void resolveBarcode(lastBarcode ?? manualBarcode)}>
              <RotateCcw className="size-4" />
              Retry
            </AppButton>
          </div>
        </div>
      </section>

      <form
        onSubmit={submitManualBarcode}
        className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4"
      >
        <label className="text-sm font-semibold" htmlFor="manual-barcode">
          Manual barcode
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <input
            id="manual-barcode"
            value={manualBarcode}
            onChange={(event) => setManualBarcode(event.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            pattern="[0-9]{8,14}"
            placeholder="8 to 14 digits"
            className="h-11 min-w-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          />
          <AppButton type="submit" variant="secondary">
            <Keyboard className="size-4" />
            Find
          </AppButton>
        </div>
      </form>
    </div>
  );
}

function StatusIcon({ state }: { state: ScanState }) {
  if (state === "failed") {
    return <AlertCircle className="mt-0.5 size-5 shrink-0 text-[var(--destructive)]" />;
  }
  if (state === "success") {
    return <Check className="mt-0.5 size-5 shrink-0 text-[var(--primary)]" />;
  }
  return <ScanLine className="mt-0.5 size-5 shrink-0 text-[var(--primary)]" />;
}

function statusTitle(state: ScanState) {
  switch (state) {
    case "requesting":
      return "Requesting camera";
    case "scanning":
      return "Scanning";
    case "resolving":
      return "Resolving barcode";
    case "success":
      return "Scan matched";
    case "failed":
      return "Try another path";
    default:
      return "Ready";
  }
}

function mapFood(food: ApiFood): Food {
  const servingAmount = food.servingSize ?? 100;
  const servingUnit = food.servingUnit ?? "g";
  const multiplier = servingUnit === "g" ? servingAmount / 100 : 1;

  return {
    id: food.id,
    name: food.name,
    brand: food.brand ?? "Scanned food",
    serving: `${servingAmount} ${servingUnit}`,
    calories: Math.round(food.caloriesPer100g * multiplier),
    protein: Math.round((food.proteinPer100g ?? 0) * multiplier),
    carbs: Math.round((food.carbsPer100g ?? 0) * multiplier),
    fat: Math.round((food.fatPer100g ?? 0) * multiplier),
    recent: true,
  };
}
