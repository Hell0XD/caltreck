"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { LogEntry } from "@/lib/caltrek/models";
import { DateUtils } from "@/lib/caltrek/date-utils";

export function ConfirmDeleteDialog({
  entry,
  date,
  onCancel,
  onConfirm,
}: {
  entry: LogEntry | null;
  date: string;
  onCancel: () => void;
  onConfirm: (entry: LogEntry) => void;
}) {
  return (
    <AlertDialog open={Boolean(entry)} onOpenChange={(open) => !open && onCancel()}>
      {entry && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete log entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {entry.food.name} from{" "}
              {DateUtils.format(date, { month: "long", day: "numeric" })}. The food stays in your
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onConfirm(entry)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
