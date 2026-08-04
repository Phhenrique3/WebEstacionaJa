export type vehicleCategory = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;

  createAdt: string;
  updatedAt: string;
};

export type CreateVehicleCategoryRequest = {
  name: string;
  description: string;
};

export type DeleteVehicleCategoryResponse = {
  message: string;
};
export type UpdateVehicleCategoryRequest = {
  name: string;
  description?: string;
  active: boolean;
};
