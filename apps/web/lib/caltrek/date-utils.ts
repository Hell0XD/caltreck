export class DateUtils {
  static todayIso() {
    return this.toIso(new Date());
  }

  static toIso(date: Date) {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  static fromIso(iso: string) {
    return new Date(`${iso}T12:00:00`);
  }

  static addDays(iso: string, days: number) {
    const date = this.fromIso(iso);
    date.setDate(date.getDate() + days);
    return this.toIso(date);
  }

  static shiftMonth(iso: string, months: number) {
    const date = this.fromIso(iso);
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    return this.toIso(date);
  }

  static monthStart(iso: string) {
    const date = this.fromIso(iso);
    date.setDate(1);
    return this.toIso(date);
  }

  static daysInMonth(iso: string) {
    const start = this.fromIso(this.monthStart(iso));
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const days: string[] = [];
    for (const date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
      days.push(this.toIso(date));
    }
    return days;
  }

  static calendarGrid(iso: string) {
    const start = this.fromIso(this.monthStart(iso));
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);

    const end = this.fromIso(this.monthStart(iso));
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    const sundayOffset = (7 - end.getDay()) % 7;
    end.setDate(end.getDate() + sundayOffset);

    const dayCount =
      Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    return Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return this.toIso(date);
    });
  }

  static isSameMonth(left: string, right: string) {
    return left.slice(0, 7) === right.slice(0, 7);
  }

  static isFuture(iso: string) {
    return iso > this.todayIso();
  }

  static format(
    iso: string,
    options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  ) {
    return new Intl.DateTimeFormat(undefined, options).format(this.fromIso(iso));
  }

  static relativeLabel(iso: string) {
    const today = this.todayIso();
    if (iso === today) {
      return "Today";
    }
    if (iso === this.addDays(today, -1)) {
      return "Yesterday";
    }
    return this.format(iso, { weekday: "long" });
  }
}
