import { Utensils } from "lucide-react";
import {cn} from "@/lib/utils";
import React from "react";

interface BrandBlockProps extends React.HTMLAttributes<HTMLDivElement> {}

export function BrandBlock({className, ...props}: BrandBlockProps) {
  return (
    <div {...props} className={cn(className, "flex items-center gap-3")}>
      <div className="grid size-11 place-items-center rounded-[var(--radius)] bg-[var(--primary)] text-white">
        <Utensils className="size-5" />
      </div>
      <div>
        <p className="text-base font-semibold">caltrek</p>
        <p className="text-sm text-[var(--muted-foreground)]">Daily nutrition</p>
      </div>
    </div>
  );
}
