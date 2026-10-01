export type Vehicle = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  clientId: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;

  client?: {
    id: string;
    name: string;
    email?: string;
    telefone?: string;
  };

  category?: {
    id: string;
    name: string;
    description: string | null;
  };
};

export type CreateVehicleRequest = {
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  clientId: string;
  categoryId: string;
};

export type updateVehicleRequest = {
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  clientId: string;
  categoryId: string;
};
