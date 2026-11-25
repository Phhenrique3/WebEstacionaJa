import { api } from "./api";

import type {
  CancelParkingSessionRequest,
  CreateParkingSessionRequest,
  ParkingSession,
} from "../types/parkingSession.types";

export type ParkingTotals = Record<ParkingSession["status"] | "entries" | "revenue", number>;

export async function getParkingTotals(params: { start: string; end: string }, signal: AbortSignal) {
  const response = await api.get<ParkingTotals>("/parking-sessions", { params, signal });
  return response.data;
}

export type SessionPage = {
  items: ParkingSession[];
  page: number;
  totalPages: number;
  total: number;
  summary: Record<ParkingSession["status"], number>;
};

export async function getParkingSessionPage(page: number, search: string, signal: AbortSignal) {
  const response = await api.get<SessionPage>("/parking-sessions", { params: { page, search }, signal });
  return response.data;
}

export async function getParkingSessionById(
  sessionId: string,
): Promise<ParkingSession> {
  const response = await api.get<ParkingSession>(
    `/parking-sessions/${sessionId}`,
  );

  return response.data;
}

export async function CreateParkingSession(
  data: CreateParkingSessionRequest,
): Promise<ParkingSession> {
  const response = await api.post<ParkingSession>("/parking-sessions", data);
  return response.data;
}

export async function closeParkingSession(
  sessionId: string,
): Promise<ParkingSession> {
  const response = await api.patch<ParkingSession>(
    `/parking-sessions/${sessionId}/close`,
  );
  return response.data;
}

export async function cancelParkingSession(
  sessionId: string,
  data?: CancelParkingSessionRequest,
): Promise<ParkingSession> {
  const response = await api.patch<ParkingSession>(
    `/parking-sessions/${sessionId}/cancel`,
    data,
  );
  return response.data;
}
