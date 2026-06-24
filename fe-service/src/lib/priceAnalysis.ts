import api from "./api";

export async function analyzeExistingProduct(
  productId: number
) {
  const response = await api.post(
    "/api/v1/price-analysis/existing-product",
    {
      product_id: productId,
    }
  );

  return response.data.data;
}

export async function recommendNewProductPrice(
  productName: string,
  basePrice: number
) {
  const response = await api.post(
    "/api/v1/price-analysis/new-product",
    {
      product_name: productName,
      base_price: basePrice
    }
  );

  return response.data.data;
}