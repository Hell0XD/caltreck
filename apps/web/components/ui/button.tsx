import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--primary-strong)] bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:-translate-y-0.5 hover:bg-[var(--primary-strong)] hover:shadow-lg active:translate-y-0 active:shadow-sm",
        destructive:
          "border border-[var(--destructive-strong)] bg-destructive text-white shadow-[0_5px_14px_rgba(194,65,61,0.2)] hover:-translate-y-0.5 hover:bg-[var(--destructive-strong)] active:translate-y-0",
        outline:
          "border border-[var(--border-strong)] bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-control)] hover:-translate-y-0.5 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] active:translate-y-0 active:shadow-none",
        secondary:
          "border border-[var(--secondary-foreground)] bg-secondary text-secondary-foreground shadow-[var(--shadow-control)] hover:-translate-y-0.5 hover:bg-[#f5d264] active:translate-y-0 active:shadow-none",
        ghost:
          "border border-transparent hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
