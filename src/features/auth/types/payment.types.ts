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
