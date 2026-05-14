export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <section className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">caltrek</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Calorie tracking shell</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
            Phase 1 scaffold is ready for the mobile-first PWA implementation.
          </p>
        </div>
      </section>
    </main>
  );
}
