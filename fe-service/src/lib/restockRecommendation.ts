import api from "./api";

export async function generateRestockRecommendation(
  budget: number,
  horizon_days: number
) {
  const response = await api.post(
    "/api/v1/restock-recommendation",
    {
      budget,
      horizon_days,
    }
  );

  return response.data.data;
}