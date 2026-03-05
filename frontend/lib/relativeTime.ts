import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isYesterday,
  isThisYear,
} from 'date-fns';


export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (isYesterday(date)) return 'Yesterday';
  if (days < 7) return `${days}d`;
  if (isThisYear(date)) return format(date, 'MMM d');
  return format(date, 'MMM d, yyyy');
}
