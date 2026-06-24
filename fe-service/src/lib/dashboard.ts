import api from "./api";

export type RevenueGroupBy = "yearly" | "daily";
export type SalesGroupBy = "yearly" | "daily" | "allTime";
export type NettGroupBy = "yearly" | "daily";

export interface RevenuePeriod {
  period: string;
  revenue: number;
}

export interface RevenueResponse {
  groupBy: string;
  year?: number;
  month?: number;
  data: RevenuePeriod[];
}

export interface SalesItem {
  product_id: number;
  product_name: string;
  sold: number;
}

export interface SalesResponse {
  groupBy: string;
  start?: string;
  end?: string;
  year?: number;
  month?: number;
  data: SalesItem[];
}

export interface NettItem {
  month?: string;
  date?: string;
  sold: number;
  total_revenue: number;
  net_profit: number;
}

export interface NettResponse {
  groupBy: string;
  start?: string;
  end?: string;
  year?: number;
  month?: number;
  data: NettItem[];
}

export interface AssociationRule {
  from: string[];
  to: string[];
  support: number;
  confidence: number;
  lift: number;
}

export interface AssociationResponse {
  level: number;
  total_associations: number;
  data: AssociationRule[];
}

export async function fetchRevenue(
  groupBy: RevenueGroupBy,
  year?: number,
  month?: number
): Promise<RevenueResponse> {
  const params: Record<string, string | number> = { groupBy };
  if (year !== undefined) params.year = year;
  if (month !== undefined) params.month = month;
  const res = await api.get("/api/v1/dashboard/revenue", { params });
  return res.data;
}

export async function fetchSales(
  groupBy: SalesGroupBy,
  year?: number,
  month?: number
): Promise<SalesResponse> {
  const params: Record<string, string | number> = { groupBy };
  if (year !== undefined) params.year = year;
  if (month !== undefined) params.month = month;
  const res = await api.get("/api/v1/dashboard/sales", { params });
  return res.data;
}

export async function fetchNett(
  groupBy: NettGroupBy,
  year?: number,
  month?: number
): Promise<NettResponse> {
  const params: Record<string, string | number> = { groupBy };
  if (year !== undefined) params.year = year;
  if (month !== undefined) params.month = month;
  const res = await api.get("/api/v1/dashboard/nett", { params });
  return res.data;
}

export async function fetchAssociation(
  level: 1 | 2
): Promise<AssociationResponse> {
  const res = await api.get("/api/v1/dashboard/association", {
    params: { level },
  });
  return res.data;
}
