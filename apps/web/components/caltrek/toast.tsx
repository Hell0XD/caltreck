import { Check } from "lucide-react";

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite">
      {message && (
        <div
          className="fixed inset-x-4 bottom-24 z-[70] mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-white/25 bg-[var(--foreground)] px-4 py-3 text-sm font-bold text-[var(--background)] shadow-xl lg:bottom-6"
          role="status"
        >
          <Check className="size-4 shrink-0" />
          <span className="min-w-0">{message}</span>
        </div>
      )}
    </div>
  );
}
