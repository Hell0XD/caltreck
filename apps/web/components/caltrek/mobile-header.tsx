import type { ReactNode } from "react";
import { BrandBlock } from "./brand-block";

export function MobileHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <BrandBlock />
        {children}
      </div>
    </header>
  );
}
