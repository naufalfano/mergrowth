import api from "./api";

export interface ForecastResponse {
  current_week: { revenue: number };
  next_week: { revenue: number };
  growth_percent: number;
  trend: "up" | "down";
}

export interface RecommendationItem {
  product_name: string;
  support: number;
  confidence: number;
  lift: number;
}

export interface RecommendationResponse {
  level: number;
  product_id?: number;
  product_name?: string;
  product_ids?: number[];
  product_names?: string[];
  recommendations: RecommendationItem[];
}

export async function fetchRevenueForecast(): Promise<ForecastResponse> {
  const res = await api.get("/api/v1/marketing/forecast/revenue");
  return res.data;
}

export async function fetchRecommendation(
  productId: number,
  productId2?: number
): Promise<RecommendationResponse> {
  const params: Record<string, number> = { product_id: productId };
  if (productId2 !== undefined) params.product_id_2 = productId2;
  const res = await api.get("/api/v1/marketing/recommendation", { params });
  return res.data;
}

export type ProductCategory =
  | "CORE_PRODUCT"
  | "BUNDLE_OPPORTUNITY"
  | "MONITOR_PRODUCT"
  | "REMOVAL_CANDIDATE";

export interface ProductInsightItem {
  product_id: number;
  product_name: string;
  segment: "CORE_PRODUCT" | "SUPPORTING_PRODUCT";
  category: ProductCategory;
  sold_qty: number;
  revenue: number;
  net_profit: number;
  margin: number;
  business_score: number;
  profit_rank: number;
  sold_rank: number;
  margin_rank: number;
  associated_products: string[];
  recommendation: string;
}

export interface ProductInsightResponse {
  summary: {
    core_products: number;
    bundle_opportunities: number;
    monitor_products: number;
    removal_candidates: number;
  };
  core_products: ProductInsightItem[];
  bundle_opportunities: ProductInsightItem[];
  monitor_products: ProductInsightItem[];
  removal_candidates: ProductInsightItem[];
  products: ProductInsightItem[];
}

export async function fetchProductInsight(): Promise<ProductInsightResponse> {
  const res = await api.get("/api/v1/marketing/product-insight");
  return res.data;
}
