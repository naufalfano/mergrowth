import {
  useEffect,
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import ProductForm from "@/components/ProductForm";

import {
  getProduct,
  updateProduct
} from "@/lib/product";

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] =
    useState<any>(null);

  async function loadProduct() {
    try {
      const data = await getProduct(
        Number(id)
      );

      setProduct(data);

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProduct();
  }, []);

  async function handleUpdate(
    data: any
  ) {
    try {

      await updateProduct(
        Number(id),
        data
      );

      alert("Product updated");

      navigate("/products");

    } catch (err) {
      console.error(err);
    }
  }

  if (!product) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Edit Product
        </h1>

        <ProductForm
          initialData={product}
          onSubmit={handleUpdate}
          submitLabel="Update Product"
        />

      </div>
    </div>
  );
}