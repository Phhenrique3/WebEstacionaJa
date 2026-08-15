export type Client = {
  id: string;
  name: string;
  email: string;
  telefone: string;
  tipo_documento: string;
  documento: string;
};

export type CreateClientRequest = Omit<Client, "id">;
export type UpdateClientRequest = CreateClientRequest;

export type DeleteClientResponse = {
  message: string;
};
