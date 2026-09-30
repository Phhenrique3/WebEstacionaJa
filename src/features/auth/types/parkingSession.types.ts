export type ParkingSessionStatus = "ABERTO" | "FECHADO" | "CANCELADO";

export type ParkingSessionChargeType = "HORA" | "DIARIA" | "MENSAL" | "MINUTO";

export type ParkingSession = {
  id: string;
  vehicleId: string;
  parkingSpotId: string;
  entrada: string;
  saida: string | null;
  tempo_total_minutos: number | null;
  valor_total: string | number | null;
  tipo_cobranca: ParkingSessionChargeType;
  status: ParkingSessionStatus;
  createdAt: string;
  updatedAt: string;

  vehicle?: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    cor: string;
    clientId: string;
    categoryId: string;

    client?: {
      id: string;
      name: string;
      email: string;
      telefone: string;
      tipo_documento: string;
      documento: string;
      active: boolean;
    };

    category?: {
      id: string;
      name: string;
      description: string | null;
      active: boolean;
    };
  };

  parkingSpot?: {
    id: string;
    numero: string;
    patio: string | null;
    status: string;
  };
};

export type CreateParkingSessionRequest = {
  vehicleId: string;
  parkingSpotId: string;
  tipo_cobranca: ParkingSessionChargeType;
};

export type CancelParkingSessionRequest = {
  motivo?: string;
};
