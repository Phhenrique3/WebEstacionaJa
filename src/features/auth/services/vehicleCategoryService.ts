import { api } from "../services/api";
import type {
  CreateVehicleCategoryRequest,
  DeleteVehicleCategoryResponse,
  UpdateVehicleCategoryRequest,
  vehicleCategory,
} from "../types/vehicleCategory.types";

export async function getVehicleCategories(): Promise<vehicleCategory[]> {
  const response = await api.get<vehicleCategory[]>("/vehicle-categories");

  return response.data;
}

export async function createVehicleCategory(
  data: CreateVehicleCategoryRequest,
): Promise<vehicleCategory> {
  const response = await api.post<vehicleCategory>("/vehicle-categories", data);

  return response.data;
}

export async function updateVehicleCategory(
  id: string,
  data: UpdateVehicleCategoryRequest,
): Promise<vehicleCategory> {
  const response = await api.patch<vehicleCategory>(
    `/vehicle-categories/${id}`,
    data,
  );

  return response.data;
}

export async function deleteVehicleCategory(
  id: string,
): Promise<DeleteVehicleCategoryResponse> {
  const response = await api.delete<DeleteVehicleCategoryResponse>(
    `/vehicle-categories/${id}`,
  );

  return response.data;
}
