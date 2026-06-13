import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  compact,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <Card className="gap-0 border-dashed bg-[var(--surface)] py-0 shadow-none">
      <CardContent className={cn("text-center", compact ? "p-3" : "p-8")}>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
