import type { UserTimezone } from "@caltrek/api-client";

export const supportedTimezoneValues = [
  "Europe/Prague",
  "Europe/Berlin",
  "Europe/London",
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const satisfies readonly UserTimezone[];

export const timezoneOptions: Array<{ value: UserTimezone; label: string }> = [
  { value: "Europe/Prague", label: "Prague (Europe/Prague)" },
  { value: "Europe/Berlin", label: "Berlin (Europe/Berlin)" },
  { value: "Europe/London", label: "London (Europe/London)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (America/New_York)" },
  { value: "America/Chicago", label: "Chicago (America/Chicago)" },
  { value: "America/Denver", label: "Denver (America/Denver)" },
  { value: "America/Los_Angeles", label: "Los Angeles (America/Los_Angeles)" },
  { value: "Asia/Tokyo", label: "Tokyo (Asia/Tokyo)" },
  { value: "Australia/Sydney", label: "Sydney (Australia/Sydney)" },
];

export function preferredTimezone(timezone?: string): UserTimezone {
  if (isSupportedTimezone(timezone)) {
    return timezone;
  }
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isSupportedTimezone(browserTimezone) ? browserTimezone : "UTC";
}

function isSupportedTimezone(timezone: string | undefined): timezone is UserTimezone {
  return supportedTimezoneValues.some((supported) => supported === timezone);
}
