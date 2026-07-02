/**
 * Canonical Firestore date key: local-time YYYY-MM-DD.
 * Locale-independent, sorts lexicographically, stable across devices.
 */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Key format v2.0 wrote on US-English devices ("7/2/2026").
 * Kept as a read-time fallback so pre-migration data still charts.
 */
export function toLegacyDateKey(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function toShortLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
