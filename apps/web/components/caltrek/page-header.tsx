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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
      </div>
      {action}
    </header>
  );
}
