import { api } from "./api";

import type {
  CancelParkingSessionRequest,
  CreateParkingSessionRequest,
  ParkingSession,
} from "../types/parkingSession.types";
import { data } from "react-router-dom";

export async function getParkingSessions(): Promise<ParkingSession[]> {
  const response = await api.get<ParkingSession[]>("/parking-sessions");

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
