"use client";

import type React from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Home, ScanLine, Search } from "lucide-react";
import { BrandBlock, MobileHeader } from "./ui";
import { type AppRoute } from "./types";
import { cn } from "@/lib/utils";

const navItems: Array<{
  route: AppRoute;
  href: Route;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
}> = [
  { route: "today", href: "/today", label: "Today", icon: <Home /> },
  { route: "search", href: "/search", label: "Search", icon: <Search /> },
  { route: "scan", href: "/scan", label: "Scan", icon: <ScanLine /> },
  { route: "library", href: "/library", label: "Library", icon: <Heart /> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const activeRoute = routeFromPath(pathname);

  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)] px-5 py-6 lg:block">
          <BrandBlock />
          <DesktopNav activeRoute={activeRoute} />
        </aside>

        <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-24 lg:max-w-none lg:pb-0">
          <MobileHeader />
          <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <BottomNav activeRoute={activeRoute} />
        </section>
      </div>
    </main>
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
  return "today";
}

function BottomNav({ activeRoute }: { activeRoute: AppRoute }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_94%,transparent)] px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
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
        "relative flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius)] px-3 text-sm font-semibold transition",
        wide && "w-full justify-start",
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      {active && (
        <motion.span
          layoutId="active-route"
          className="absolute inset-0 rounded-[var(--radius)] bg-[var(--primary-soft)]"
        />
      )}
      <span className="relative">{icon}</span>
      <span className="relative">{label}</span>
    </Link>
  );
}
