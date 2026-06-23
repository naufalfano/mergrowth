import { useNavigate } from "react-router-dom";

import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/lib/product";

export default function ProductCreatePage() {
  const navigate = useNavigate();

  async function handleCreate(data: any) {
    try {
      await createProduct(data);

      alert("Product created successfully");

      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Create Product
        </h1>

        <ProductForm
          onSubmit={handleCreate}
          submitLabel="Create Product"
        />

      </div>
    </div>
  );
}