import type { ParkingSession } from "../../../auth/types/parkingSession.types";

export type Period = "day" | "month" | "year";

export function localDateKey(date: Date) {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function summarizePeriod(sessions: ParkingSession[], period: Period, value: string) {
  const length = { day: 10, month: 7, year: 4 }[period];

  function matches(timestamp: string) {
    const date = new Date(timestamp);
    return !Number.isNaN(date.getTime()) && localDateKey(date).slice(0, length) === value;
  }

  const totals = { entries: 0, ABERTO: 0, FECHADO: 0, CANCELADO: 0, revenue: 0 };
  for (const session of sessions) {
    if (matches(session.entrada)) {
      totals.entries++;
      totals[session.status]++;
    }
    if (session.status === "FECHADO" && session.saida && matches(session.saida)) {
      totals.revenue += Number(session.valor_total ?? 0);
    }
  }
  return totals;
}
