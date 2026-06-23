import api from "./api";

export interface DemandForecastResponse {
  product_id: number;
  forecast_quantity: number;
  current_stock: number;
  remaining_stock: number;
  recommendation: string;
}

export async function generateDemandForecast(
  productId: number,
  horizonDays: number
): Promise<DemandForecastResponse> {
  const res = await api.post(
    "/api/v1/demand-forecasting/predict",
    {
      product_id: productId,
      horizon_days: horizonDays,
    }
  );

  return res.data.data;
}