import api from "./api";

export interface ShopResponse {
  id: string;
  user_id: string;
  shop_name: string;
  location: string;
  category: string;
}

export async function createShop(
  shop_name: string,
  location: string,
  category: string
): Promise<ShopResponse> {
  const res = await api.post("/api/v1/shop", { shop_name, location, category });
  return res.data.data;
}

export async function getShop(): Promise<ShopResponse | null> {
  const res = await api.get("/api/v1/shop");
  return res.data.data;
}
