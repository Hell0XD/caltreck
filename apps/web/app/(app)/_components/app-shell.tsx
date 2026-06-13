"use client";

import type React from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronRight, Heart, ScanLine, Search, UserRound } from "lucide-react";
import { BrandBlock } from "@/components/caltrek/brand-block";
import { MobileHeader } from "@/components/caltrek/mobile-header";
import { ThemeToggle } from "@/components/caltrek/theme-toggle";
import { Button } from "@/components/ui/button";
import { useCaltrek } from "@/hooks/use-caltrek";
import { cn } from "@/lib/utils";

type AppRoute = "today" | "search" | "scan" | "library" | "account";

const navItems: Array<{
  route: AppRoute;
  href: Route;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
}> = [
  { route: "today", href: "/today", label: "Journal", icon: <CalendarDays /> },
  { route: "search", href: "/search", label: "Search", icon: <Search /> },
  { route: "scan", href: "/scan", label: "Scan", icon: <ScanLine /> },
  { route: "library", href: "/library", label: "Library", icon: <Heart /> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const activeRoute = routeFromPath(pathname);
  const { user } = useCaltrek();

  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--border-strong)] bg-[var(--surface)] px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center justify-between gap-3">
            <BrandBlock />
            <ThemeToggle className="shrink-0" />
          </div>
          <DesktopNav activeRoute={activeRoute} />
          <UserPanel email={user.email} />
        </aside>

        <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-24 lg:max-w-none lg:pb-0">
          <MobileHeader>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="outline" size="icon">
                <Link href="/account" aria-label="Open profile" title="Open profile">
                  <UserRound className="size-4" />
                </Link>
              </Button>
            </div>
          </MobileHeader>
          <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
            <motion.div
              key={pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
          <BottomNav activeRoute={activeRoute} />
        </section>
      </div>
    </main>
  );
}

function UserPanel({ email }: { email: string }) {
  return (
    <Link
      href="/account"
      className="mt-auto flex items-center gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] p-3 shadow-[var(--shadow-control)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Signed in</p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{email}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)]" />
    </Link>
  );
}

function routeFromPath(pathname: string): AppRoute {
  if (pathname.startsWith("/search")) {
    return "search";
  }
  if (pathname.startsWith("/scan")) {
    return "scan";
  }
  if (pathname.startsWith("/library")) {
    return "library";
  }
  if (pathname.startsWith("/account")) {
    return "account";
  }
  return "today";
}

function BottomNav({ activeRoute }: { activeRoute: AppRoute }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--card)_94%,transparent)] px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => (
          <NavLink key={item.route} activeRoute={activeRoute} {...item} />
        ))}
      </div>
    </nav>
  );
}

function DesktopNav({ activeRoute }: { activeRoute: AppRoute }) {
  return (
    <nav className="mt-8 space-y-2">
      {navItems.map((item) => (
        <NavLink key={item.route} activeRoute={activeRoute} wide {...item} />
      ))}
    </nav>
  );
}

function NavLink({
  route,
  href,
  activeRoute,
  icon,
  label,
  wide,
}: {
  route: AppRoute;
  href: Route;
  activeRoute: AppRoute;
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  wide?: boolean;
}) {
  const active = route === activeRoute;

  return (
    <Link
      href={href}
      className={cn(
        "relative flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition",
        wide && "w-full justify-start",
        active
          ? "border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-[var(--shadow-control)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      {active && (
        <motion.span
          layoutId="active-route"
          className="absolute inset-0 rounded-xl bg-[var(--primary-soft)]"
        />
      )}
      <span className="relative">{icon}</span>
      <span className="relative">{label}</span>
    </Link>
  );
}
