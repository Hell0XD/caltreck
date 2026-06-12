import type React from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { CaltrekProvider } from "@/components/caltrek/caltrek-provider";
import { AppShell } from "./_components/app-shell";

export default function CaltrekAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <CaltrekProvider>
        <AppShell>{children}</AppShell>
      </CaltrekProvider>
    </QueryProvider>
  );
}
