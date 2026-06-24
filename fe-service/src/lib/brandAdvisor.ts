import api from "./api";

export interface BrandTone {
  archetype: string;
  description: string;
  traits: string[];
}

export interface PricePositioning {
  recommended_tier: string;
  price_range: string;
  reasoning: string;
}

export interface BrandAdvisorResult {
  category: string;
  brand_tone: BrandTone;
  price_positioning: PricePositioning;
  key_messages: string[];
  keywords_to_emphasize: string[];
  competitive_strategy: string;
  content_tone_guidelines: string;
}

export const ADVISOR_CATEGORIES = [
  { id: "elektronik",  label: "Elektronik" },
  { id: "fashion",     label: "Fashion" },
  { id: "olahraga",    label: "Olahraga" },
  { id: "handphone",   label: "Handphone" },
  { id: "pertukangan", label: "Pertukangan" },
] as const;

export type AdvisorCategory = (typeof ADVISOR_CATEGORIES)[number]["id"];

export async function generateBrandStrategy(
  category: AdvisorCategory,
): Promise<BrandAdvisorResult> {
  const res = await api.post("/api/v1/brand-advisor/generate", { category });
  return res.data.data;
}
