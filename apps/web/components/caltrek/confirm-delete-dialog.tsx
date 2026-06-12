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

export function ConfirmDeleteDialog({
  entry,
  onCancel,
  onConfirm,
}: {
  entry: LogEntry | null;
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
              This removes {entry.food.name} from today. The food stays in your library.
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
