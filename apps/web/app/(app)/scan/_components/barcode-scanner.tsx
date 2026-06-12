"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { motion } from "framer-motion";
import { AlertCircle, Camera, Check, Keyboard, RotateCcw, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { cn } from "@/lib/utils";

type ScanState = "idle" | "requesting" | "scanning" | "resolving" | "success" | "failed";

const barcodeSchema = z.object({
  barcode: z.string().regex(/^\d{8,14}$/, "Barcode must contain 8 to 14 digits."),
});

type BarcodeFormValues = z.infer<typeof barcodeSchema>;

export function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [message, setMessage] = useState(
    "Camera access is only used while this screen is scanning.",
  );
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const { openAddFood, findFoodByBarcode } = useCaltrek();
  const form = useForm<BarcodeFormValues>({
    resolver: zodResolver(barcodeSchema),
    defaultValues: { barcode: "" },
  });
  const manualBarcode = form.watch("barcode");

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
      const food = await findFoodByBarcode(normalizedBarcode);
      setScanState("success");
      setMessage("Food found.");
      window.setTimeout(() => openAddFood(food), 450);
    } catch {
      setScanState("failed");
      setMessage("No food matched that barcode. Try again or enter it manually.");
    }
  }

  function submitManualBarcode(value: BarcodeFormValues) {
    stopScanner();
    void resolveBarcode(value.barcode);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Barcode scanner</p>
        <h1 className="text-3xl font-semibold tracking-normal">Scan food</h1>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="relative aspect-[3/4] bg-slate-950">
          <video
            ref={videoRef}
            className={cn("h-full w-full object-cover", scanState === "idle" && "opacity-30")}
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
            <Button
              size="lg"
              onClick={scanState === "scanning" ? pauseScanner : startScanner}
              disabled={scanState === "requesting" || scanState === "resolving"}
            >
              <Camera className="size-4" />
              {scanState === "scanning" ? "Stop" : "Camera"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => void resolveBarcode(lastBarcode ?? manualBarcode)}
            >
              <RotateCcw className="size-4" />
              Retry
            </Button>
          </div>
        </div>
      </Card>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitManualBarcode)} className="space-y-3">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manual barcode</FormLabel>
                    <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                      <div>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="8 to 14 digits"
                            className="h-11 text-base"
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value.replace(/\D/g, ""))
                            }
                          />
                        </FormControl>
                        <FormMessage className="mt-2" />
                      </div>
                      <Button type="submit" variant="outline" size="lg">
                        <Keyboard className="size-4" />
                        Find
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
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
