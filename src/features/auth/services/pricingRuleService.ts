import { api } from "./api";
import type {
  CreatePricingRuleRequest,
  PricingRules,
  UpdatePricingRuleRequest,
} from "../types/PricingRulesPage.types";

export async function getPricingRules(): Promise<PricingRules[]> {
  const response = await api.get<PricingRules[]>("/pricing-rules");
  return response.data;
}

export async function createPricingRule(
  data: CreatePricingRuleRequest,
): Promise<PricingRules> {
  const response = await api.post<PricingRules>("/pricing-rules", data);

  return response.data;
}

export async function updatePricingRule(
  id: string,
  data: UpdatePricingRuleRequest,
): Promise<PricingRules> {
  const response = await api.patch<PricingRules>(`/pricing-rules/${id}`, data);

  return response.data;
}
