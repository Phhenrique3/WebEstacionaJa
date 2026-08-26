import { api } from "../services/api";
import type {
  CreateParkingSpotRequest,
  ParkingSpot,
} from "../types/parkingSpotTypes";

export async function getParkingSpots(): Promise<ParkingSpot[]> {
  const response = await api.get<ParkingSpot[]>("/parking-spots");

  return response.data;
}

export async function createParkingSpot(
  data: CreateParkingSpotRequest
): Promise<ParkingSpot> {
  const response = await api.post<ParkingSpot>("/parking-spots", data);

  return response.data;
}