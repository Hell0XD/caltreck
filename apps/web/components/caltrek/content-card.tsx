import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ContentCard({ className, ...props }: ComponentProps<typeof Card>) {
  return <Card className={cn("gap-0 py-0", className)} {...props} />;
}
