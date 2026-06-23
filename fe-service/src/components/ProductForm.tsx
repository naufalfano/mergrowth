import { useState } from "react";

interface ProductFormProps {
  initialData?: {
    product_name: string;
    description: string;
    category: string;
    current_stock: number;
    base_price: number;
    sale_price: number;
  };

  onSubmit: (data: {
    product_name: string;
    description: string;
    category: string;
    current_stock: number;
    base_price: number;
    sale_price: number;
  }) => Promise<void>;

  submitLabel?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  submitLabel = "Save",
}: ProductFormProps) {
  const [productName, setProductName] = useState(
    initialData?.product_name ?? ""
  );

  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const [category, setCategory] = useState(
    initialData?.category ?? ""
  );

  const [currentStock, setCurrentStock] = useState(
    initialData?.current_stock ?? 0
  );

  const [basePrice, setBasePrice] = useState(
    initialData?.base_price ?? 0
  );

  const [salePrice, setSalePrice] = useState(
    initialData?.sale_price ?? 0
  );

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await onSubmit({
      product_name: productName,
      description,
      category,
      current_stock: currentStock,
      base_price: basePrice,
      sale_price: salePrice,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        className="w-full border rounded-xl p-3"
        placeholder="Product Name"
        value={productName}
        onChange={(e) =>
          setProductName(e.target.value)
        }
      />

      <input
        className="w-full border rounded-xl p-3"
        placeholder="Category"
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      />

      <textarea
        className="w-full border rounded-xl p-3"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <input
        type="number"
        className="w-full border rounded-xl p-3"
        placeholder="Current Stock"
        value={currentStock}
        onChange={(e) =>
          setCurrentStock(Number(e.target.value))
        }
      />

      <input
        type="number"
        className="w-full border rounded-xl p-3"
        placeholder="Base Price (HPP)"
        value={basePrice}
        onChange={(e) =>
          setBasePrice(Number(e.target.value))
        }
      />

      <input
        type="number"
        className="w-full border rounded-xl p-3"
        placeholder="Sale Price"
        value={salePrice}
        onChange={(e) =>
          setSalePrice(Number(e.target.value))
        }
      />

      <button
        type="submit"
        className="bg-black text-white px-5 py-3 rounded-xl"
      >
        {submitLabel}
      </button>
    </form>
  );
}