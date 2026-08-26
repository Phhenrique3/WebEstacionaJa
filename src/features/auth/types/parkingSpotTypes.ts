export type ParkingSpotStatus =
  | "DISPONIVEL"
  | "OCUPADA"
  | "RESERVADA"
  | "INATIVA";

export type ParkingSpot = {
  id: string;
  numero: string;
  patio: string | null;
  status: ParkingSpotStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateParkingSpotRequest = {
  numero: string;
  patio?: string;
};