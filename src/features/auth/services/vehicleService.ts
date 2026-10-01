export { api } from "./api";

import type {
  CreateVehicleRequest,
  updateVehicleRequest,
  Vehicle,
} from "../types/vehicle.types";
import { api } from "./api";

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await api.get<Vehicle[]>("/vehicles");

  return response.data;
}

export async function createVehicle(
  data: CreateVehicleRequest,
): Promise<Vehicle> {
  const response = await api.post<Vehicle>("/vehicles", data);

  return response.data;
}

export async function updateVichle(
  id: string,
  data: updateVehicleRequest,
): Promise<Vehicle> {
  const response = await api.patch<Vehicle>(`/vehicles/${id}`, data);

  return response.data;
}
