import type React from "react";
import { AppShell } from "@/components/caltrek/app-shell";
import { CaltrekProvider } from "@/components/caltrek/app-state";

export default function CaltrekAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CaltrekProvider>
      <AppShell>{children}</AppShell>
    </CaltrekProvider>
  );
}
