export class ErrorUtils {
  static message(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === "object") {
      const record = error as Record<string, unknown>;
      if (typeof record.message === "string") {
        return record.message;
      }
      if (typeof record.error === "string") {
        return record.error;
      }
    }
    return "Something went wrong. Please try again.";
  }
}
