import api from "./api";

export async function getProducts() {
  const res = await api.get("/api/v1/products");
  return res.data.data;
}

export async function createProduct(payload: {
  product_name: string;
  description: string;
  category: string;
  current_stock: number;
  base_price: number;
  sale_price: number;
}) {
  const res = await api.post(
    "/api/v1/products",
    payload
  );

  return res.data.data;
}

export async function getProduct(id: number) {
  const res = await api.get(
    `/api/v1/products/${id}`
  );

  return res.data.data;
}

export async function updateProduct(
  id: number,
  payload: {
    product_name: string;
    description: string;
    category: string;
    current_stock: number;
    base_price: number;
    sale_price: number;
  }
) {
  const res = await api.put(
    `/api/v1/products/${id}`,
    payload
  );

  return res.data.data;
}

export async function deleteProduct(
  id: number
) {
  const res = await api.delete(
    `/api/v1/products/${id}`
  );

  return res.data.data;
}

export async function importProducts(
  products: any[]
) {
  const res = await api.post(
    "/api/v1/products/import",
    {
      products,
    }
  );

  return res.data.data;
}