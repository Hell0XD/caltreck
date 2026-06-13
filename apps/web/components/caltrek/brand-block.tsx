import { Utensils } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BrandBlockProps = ComponentProps<"div">;

export function BrandBlock({ className, ...props }: BrandBlockProps) {
  return (
    <div {...props} className={cn(className, "flex items-center gap-3")}>
      <div className="grid size-11 place-items-center rounded-xl border border-[var(--primary-strong)] bg-[var(--primary)] text-white shadow-[var(--shadow-button)]">
        <Utensils className="size-5" />
      </div>
      <div>
        <p className="text-base font-bold tracking-[-0.02em]">caltrek</p>
        <p className="text-xs font-semibold text-[var(--muted-foreground)]">Daily nutrition</p>
      </div>
    </div>
  );
}
