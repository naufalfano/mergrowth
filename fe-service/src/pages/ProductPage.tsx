import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProducts,
  deleteProduct,
} from "@/lib/product";

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);

      alert("Product deleted successfully");

      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Product Management
          </h1>

          <button
            onClick={() =>
              navigate("/products/create")
            }
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Add Product
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">

            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">HPP</th>
                <th className="text-left p-4">Sale Price</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {product.product_name}
                  </td>

                  <td className="p-4">
                    {product.category}
                  </td>

                  <td className="p-4">
                    {product.current_stock}
                  </td>

                  <td className="p-4">
                    Rp {product.base_price.toLocaleString()}
                  </td>

                  <td className="p-4">
                    Rp {product.sale_price.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          navigate(
                            `/products/edit/${product.id}`
                          )
                        }
                        className="border px-3 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(product.id)
                        }
                        className="border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}