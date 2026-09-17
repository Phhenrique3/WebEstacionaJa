export type TipoDocumento = "CPF" | "CNPJ";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  telefone: string;
  tipo_documento: TipoDocumento;
  documento: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateClientRequest = {
  name: string;
  email: string;
  telefone: string;
  tipo_documento: TipoDocumento;
  documento: string;
};

export type UpdateClientRequest = {
  name?: string;
  email?: string | null;
  telefone?: string;
  tipo_documento?: TipoDocumento;
  documento?: string;
  active?: boolean;
};

export type DeleteClientResponse = {
  message: string;
};