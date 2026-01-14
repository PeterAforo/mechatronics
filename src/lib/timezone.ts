// Timezone utility for Africa/Accra (GMT+0, no DST)
// All dates should be stored and displayed in this timezone

export const TIMEZONE = "Africa/Accra";
export const TIMEZONE_OFFSET = 0; // GMT+0

/**
 * Get current date/time in Africa/Accra timezone
 */
export function getNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

/**
 * Get current ISO string in Africa/Accra timezone
 */
export function getNowISO(): string {
  return new Date().toLocaleString("en-US", { timeZone: TIMEZONE });
}

/**
 * Convert a date to Africa/Accra timezone
 */
export function toAccraTime(date: Date | string | number): Date {
  const d = new Date(date);
  return new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE }));
}

/**
 * Format a date for display in Africa/Accra timezone
 */
export function formatAccraDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    timeZone: TIMEZONE,
    ...options,
  });
}

/**
 * Format date for database storage (ISO format in Accra timezone)
 */
export function formatForStorage(date?: Date | string | number): Date {
  const d = date ? new Date(date) : new Date();
  // Return the date adjusted to Accra timezone for storage
  return new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE }));
}

/**
 * Get start of day in Africa/Accra timezone
 */
export function getStartOfDay(date?: Date | string | number): Date {
  const d = date ? toAccraTime(date) : getNow();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day in Africa/Accra timezone
 */
export function getEndOfDay(date?: Date | string | number): Date {
  const d = date ? toAccraTime(date) : getNow();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month in Africa/Accra timezone
 */
export function getStartOfMonth(date?: Date | string | number): Date {
  const d = date ? toAccraTime(date) : getNow();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return formatAccraDate(d, { 
    month: "short", 
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined 
  });
}

/**
 * Parse date string and return Date in Accra timezone
 */
export function parseAccraDate(dateString: string): Date {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return toAccraTime(parsed);
}

/**
 * Get timestamp for telemetry storage
 */
export function getTelemetryTimestamp(): Date {
  return formatForStorage();
}
