export type PricingRules = {
  id: string;
  categoryId: string;
  tipo_cobranca: string;
  valor: number;
  tolerancia_minutos: number;
  active: boolean;
  createAt: string;
  updateAt: string;
  category?: {
    id: string;
    name: string;
  };
};

export type CreatePricingRuleRequest = {
  categoryId: string;
  tipo_cobranca: string;
  valor: number;
  tolerancia_minutos: number;
};
export type UpdatePricingRuleRequest = {
  categoryId: string;
  tipo_cobranca: string;
  valor: number;
  tolerancia_minutos: number;
  active: boolean;
};
