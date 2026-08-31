import { api } from "../services/api";
import type {
  CreateParkingSpotRequest,
  ParkingSpot,
  UpdateParkingSpotRequest,
  DeleteParkingSpotRequeset,
} from "../types/parkingSpotTypes";

export async function getParkingSpots(): Promise<ParkingSpot[]> {
  const response = await api.get<ParkingSpot[]>("/parking-spots");

  return response.data;
}

export async function UpdateParking(
  id: string,
  data: UpdateParkingSpotRequest,
): Promise<ParkingSpot> {
  const response = await api.patch<ParkingSpot>(`/parking-spots/${id}`, data);

  return response.data;
}

export async function createParkingSpot(
  data: CreateParkingSpotRequest,
): Promise<ParkingSpot> {
  const response = await api.post<ParkingSpot>("/parking-spots", data);

  return response.data;
}

export async function DeleteSpot(
  id: string,
): Promise<DeleteParkingSpotRequeset> {
  const response = await api.delete<DeleteParkingSpotRequeset>(
    `/parking-spots/${id}`,
  );

  return response.data;
}
