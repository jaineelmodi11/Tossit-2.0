export function getLast7DaysKeys(): string[] {
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleString().split(" ")[0].slice(0, -1);
    result.push(key);
  }
  return result;
}

export function toShortLabel(dateKey: string): string {
  return dateKey.split("/").slice(0, 2).join("/");
}
