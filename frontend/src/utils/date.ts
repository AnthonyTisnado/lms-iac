export function formatDateTimeForBackend(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return `${trimmed}T08:00:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return undefined;
}

export function isEndBeforeStart(start?: string, end?: string) {
  const formattedStart = formatDateTimeForBackend(start);
  const formattedEnd = formatDateTimeForBackend(end);
  if (!formattedStart || !formattedEnd) return false;
  return new Date(formattedEnd).getTime() < new Date(formattedStart).getTime();
}
