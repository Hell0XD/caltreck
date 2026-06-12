"use client";

import { ChevronLeft } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[94dvh] max-w-md overflow-hidden rounded-t-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl outline-none lg:max-w-lg">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border)]" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function BottomSheetScrollArea({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("max-h-[calc(94dvh-3.5rem)] space-y-5 overflow-y-auto", className)}
      {...props}
    />
  );
}

export function BottomSheetHeader({
  title,
  description,
  onClose,
  className,
}: {
  title: ReactNode;
  description: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
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
      <div className="min-w-0 flex-1">
        <Drawer.Title className="truncate text-xl font-semibold">{title}</Drawer.Title>
        <Drawer.Description className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
          {description}
        </Drawer.Description>
      </div>
    </div>
  );
}
