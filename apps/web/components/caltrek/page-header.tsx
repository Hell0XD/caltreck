import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
      </div>
      {action}
    </header>
  );
}
