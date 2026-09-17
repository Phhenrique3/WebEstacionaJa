import { api } from "../services/api";

import type {
  Client,
  CreateClientRequest,
  DeleteClientResponse,
  UpdateClientRequest,
} from "../types/client.types";

export async function getClients(): Promise<Client[]> {
  const response = await api.get<Client[]>("/clients");

  return response.data;
}

export async function createClient(data: CreateClientRequest) {
  const response = await api.post<Client>("/clients", data);

  return response.data;
}

export async function updateClient(
  id: string,
  data: UpdateClientRequest,
): Promise<Client> {
  const response = await api.patch<Client>(`/clients/${id}`, data);

  return response.data;
}

export async function deleteClient(id: string) {
  const response = await api.delete<DeleteClientResponse>(`/clients/${id}`);

  return response.data;
}
