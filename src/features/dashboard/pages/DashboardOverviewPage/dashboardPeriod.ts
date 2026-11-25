export type Period = "day" | "month" | "year";

export function localDateKey(date: Date) {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function periodRange(period: Period, value: string) {
  const [year, month = 1, day = 1] = value.split("-").map(Number);
  const start = new Date(0);
  start.setFullYear(year, month - 1, day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (period === "day") end.setDate(day + 1);
  if (period === "month") end.setMonth(month);
  if (period === "year") end.setFullYear(year + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}
