const HALF_HOUR_MINUTES = 30;

/**
 * Rounds down to the nearest :00/:30, e.g. 9:47 -> 9:30. Used to prefill
 * arrival/departure pickers so a guest lands on a sensible default instead
 * of the exact current second.
 */
export function roundDownToNearestHalfHour(date: Date): Date {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  rounded.setMinutes(rounded.getMinutes() - (rounded.getMinutes() % HALF_HOUR_MINUTES));
  return rounded;
}

/** Formats a Date as the value a `datetime-local` input expects (YYYY-MM-DDTHH:mm), in local time. */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
