import { api } from "./api";
import type {
  CreatePricingRuleRequest,
  PricingRules,
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
