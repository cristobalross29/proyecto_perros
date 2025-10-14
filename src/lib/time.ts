// Timezone helpers for consistent Europe/Madrid handling

export const CHILE_TZ = 'America/Santiago'

export function formatDateInTz(timestamp: string | number | Date, locale: string = 'en-GB', timeZone: string = CHILE_TZ): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat(locale, { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function formatTimeInTz(timestamp: string | number | Date, locale: string = 'en-GB', timeZone: string = CHILE_TZ): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit' }).format(date)
}

// Returns YYYY-MM-DD for the given instant in the specified timezone
export function getDateKeyInTz(timestamp: string | number | Date, timeZone: string = CHILE_TZ): string {
  const date = new Date(timestamp)
  // en-CA yields ISO-like YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

// Construct a Date that represents the given wall-clock components in the target TZ
function constructInstantFromTzParts(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  // Start with the naive UTC instant for the provided parts
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  const naive = new Date(naiveUtcMs)
  // Compute the timezone offset (in minutes) at this instant for the target zone
  const tzOffsetMinutes = getTimeZoneOffsetMinutes(naive, timeZone)
  // Adjust the naive instant backwards by the offset to get the real UTC instant corresponding to the TZ wall time
  return new Date(naiveUtcMs - tzOffsetMinutes * 60 * 1000)
}

// Returns the timezone offset (minutes) for the given instant in the specified TZ
function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dtfUTC = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const partsTz = partsToRecord(dtf.formatToParts(instant))
  const partsUtc = partsToRecord(dtfUTC.formatToParts(instant))

  const msTz = Date.UTC(
    Number(partsTz.year),
    Number(partsTz.month) - 1,
    Number(partsTz.day),
    Number(partsTz.hour),
    Number(partsTz.minute),
    Number(partsTz.second)
  )
  const msUtc = Date.UTC(
    Number(partsUtc.year),
    Number(partsUtc.month) - 1,
    Number(partsUtc.day),
    Number(partsUtc.hour),
    Number(partsUtc.minute),
    Number(partsUtc.second)
  )

  // Positive when TZ is ahead of UTC (e.g., CET/CEST)
  return (msTz - msUtc) / 60000
}

function partsToRecord(parts: Intl.DateTimeFormatPart[]): Record<string, string> {
  const rec: Record<string, string> = {}
  for (const p of parts) {
    if (p.type !== 'literal') rec[p.type] = p.value
  }
  return rec
}

// Convert an input value from <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
// interpreting it as wall time in the target TZ, into a UTC ISO string
export function datetimeLocalToUtcIso(datetimeLocal: string, timeZone: string = CHILE_TZ): string {
  // Expect format YYYY-MM-DDTHH:mm
  const [datePart, timePart] = datetimeLocal.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  const instant = constructInstantFromTzParts(y, m, d, hh, mm, timeZone)
  return instant.toISOString()
}

// Get start and end of day boundaries in UTC for the given timezone
export function getDayBoundariesInUtc(date: Date = new Date(), timeZone: string = CHILE_TZ): { startOfDay: string, endOfDay: string } {
  // Get the date components in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const [year, month, day] = formatter.format(date).split('-').map(Number)
  
  // Create start of day (00:00:00) in the target timezone
  const startOfDay = constructInstantFromTzParts(year, month, day, 0, 0, timeZone)
  
  // Create end of day (23:59:59.999) in the target timezone  
  const endOfDay = constructInstantFromTzParts(year, month, day, 23, 59, timeZone)
  endOfDay.setMilliseconds(999)
  
  return {
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString()
  }
}


