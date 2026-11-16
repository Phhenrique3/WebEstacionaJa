import { api } from "../services/api";

export type MetodoPagamento = "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";

export interface CreatePaymentDTO {
  parkingSessionId: string;
  metodo_pagamento: MetodoPagamento;
}

export interface Payment {
  id: string;
  parkingSessionId: string;
  metodo_pagamento: MetodoPagamento;
  valor_pago: string;
  pago_em: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPayments(): Promise<Payment[]> {
  const response = await api.get<Payment[]>("/payments");

  return response.data;
}

export async function createPayment(data: CreatePaymentDTO): Promise<Payment> {
  const response = await api.post<Payment>("/payments", data);

  return response.data;
}
