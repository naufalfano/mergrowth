import api from "./api";

export interface PriceRange {
  p25: number;
  median: number;
  p75: number;
}

export interface TierInfo {
  tier: string;
  shop_count: number;
  gap_share: number;
  is_gap: boolean;
  price_range: PriceRange;
}

export interface MarketEntryResult {
  category: string;
  confidence: number;
  n_competitors: number;
  recommended_tier: string | null;
  seller_share: string;
  entry_price_range: PriceRange;
  all_tiers: TierInfo[];
  trend_signal?: number;
  trend_direction?: "rising" | "flat";
}

export interface CategorySuggestion {
  category: string;
  score: number;
}

export interface LowConfidenceResult {
  status: "low_confidence";
  message: string;
  top_categories: CategorySuggestion[];
}

export type MarketEntryResponse = MarketEntryResult | LowConfidenceResult;

export const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Sports",
  "Automotive",
  "Beauty",
  "Home & Living",
  "Books",
  "Food & Beverage",
  "Toys",
  "Pets",
  "Tools",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function getGapShare(result: MarketEntryResult): number {
  return result.all_tiers.find((t) => t.is_gap)?.gap_share ?? 1;
}

export async function analyzeMarketEntry(
  productText: string
): Promise<MarketEntryResponse> {
  const res = await api.post("/api/v1/market-entry/analyze", {
    product_text: productText,
  });
  return res.data.data;
}

export async function analyzeMultipleCategories(
  categories: string[]
): Promise<MarketEntryResult[]> {
  const results = await Promise.all(categories.map(getMarketEntryByCategory));
  return results.sort((a, b) => getGapShare(a) - getGapShare(b));
}

export async function getMarketEntryByCategory(
  category: string
): Promise<MarketEntryResult> {
  const res = await api.post("/api/v1/market-entry/analyze", { category });
  return res.data.data;
}

export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}k`;
  return `Rp ${amount}`;
}

export function formatPriceRange(range: PriceRange): string {
  return `${formatRupiah(range.p25)} – ${formatRupiah(range.p75)}`;
}
