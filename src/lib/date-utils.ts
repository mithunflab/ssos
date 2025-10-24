import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz'

export const formatDate = (date: string | Date, includeTime = false): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date

  if (includeTime) {
    return format(parsedDate, "MMM d, yyyy 'at' h:mm a")
  }

  return format(parsedDate, 'MMM d, yyyy')
}

export const formatTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, 'h:mm a')
}

export const formatRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date

  if (isToday(parsedDate)) {
    return `Today at ${formatTime(parsedDate)}`
  }

  if (isTomorrow(parsedDate)) {
    return `Tomorrow at ${formatTime(parsedDate)}`
  }

  return formatDate(parsedDate, true)
}

export const formatTimeAgo = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsedDate, { addSuffix: true })
}

export const formatDateForInput = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, "yyyy-MM-dd'T'HH:mm")
}

export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const convertToUserTimezone = (date: string | Date, timezone: string): Date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return utcToZonedTime(parsedDate, timezone)
}
