import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Boxes,
  Tags,
  Plus,
  Pencil,
  Trash2,
  Upload
} from "lucide-react";

import {
  getProducts,
  deleteProduct,
  importProducts,
} from "@/lib/product";

import * as XLSX from "xlsx";

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProductsData, setImportProductsData] = useState<any[]>([]);
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
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        setImportProductsData(rows);
  }
  async function handleImportProducts() {
    try {
        await importProducts(
            importProductsData
        );
        alert(
            `${importProductsData.length} products imported successfully`
        );
        
        setShowImportModal(false);
        setImportProductsData([]);
        await loadProducts();
    } catch (err) {
        console.error(err);
        alert("Import failed");
    }
  }


  useEffect(() => {
    loadProducts();
  }, []);

  const totalStock = products.reduce(
    (sum, product) => sum + product.current_stock,
    0
  );

  const totalCategories = new Set(
    products.map((product) => product.category)
  ).size;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 pt-10">
        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-10 mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Product Management
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Manage your products, inventory, and pricing
            from a single dashboard.
          </p>

          {/* Product Management Menu */}

          <div className="flex flex-wrap gap-3 mt-8">

            <button
              onClick={() =>
                navigate("/demand-forecasting")
              }
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl hover:shadow-sm transition"
            >
              Demand Forecasting
            </button>

            <button
              disabled
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl opacity-50 cursor-not-allowed"
            >
              Product Clustering
            </button>

            <button
              disabled
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl opacity-50 cursor-not-allowed"
            >
              Restock Recommendation
            </button>

            <button
              disabled
              className="bg-white border border-gray-200 px-5 py-3 rounded-xl opacity-50 cursor-not-allowed"
            >
              Market Benchmark
            </button>

          </div>

        </div>

        {/* Stats Cards */}

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-3xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Products
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {products.length}
                </h2>
              </div>

              <Package
                className="text-blue-600"
                size={32}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Inventory
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {totalStock}
                </h2>
              </div>

              <Boxes
                className="text-green-600"
                size={32}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Categories
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {totalCategories}
                </h2>
              </div>

              <Tags
                className="text-orange-600"
                size={32}
              />
            </div>
          </div>

        </div>

        {/* Header */}

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-2xl font-semibold">
              Product Catalog
            </h2>

            <p className="text-gray-500 mt-1">
              View and manage all registered products.
            </p>
          </div>
            <div className="flex gap-3">

            <button
                onClick={() =>
                setShowImportModal(true)
                }
                className="
                flex
                items-center
                gap-2
                border
                border-[#2D4FE5]
                text-[#2D4FE5]
                px-5
                py-3
                rounded-xl
                hover:bg-blue-50
                transition
                "
            >
                <Upload size={18} />
                Import Excel
            </button>

            <button
                onClick={() =>
                navigate("/products/create")
                }
                className="
                flex
                items-center
                gap-2
                bg-[#2D4FE5]
                hover:bg-[#2444d0]
                text-white
                px-5
                py-3
                rounded-xl
                transition
                "
            >
                <Plus size={18} />
                Add Product
            </button>

            </div>

        </div>

        {/* Product Table */}

        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-5">
                  Product
                </th>

                <th className="text-left p-5">
                  Category
                </th>

                <th className="text-left p-5">
                  Stock
                </th>

                <th className="text-left p-5">
                  HPP
                </th>

                <th className="text-left p-5">
                  Sale Price
                </th>

                <th className="text-left p-5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    No products available.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.product_id}
                    className="border-b hover:bg-slate-50 transition"
                  >

                    <td className="p-5">

                      <div className="font-medium">
                        {product.product_name}
                      </div>

                      <div className="text-sm text-gray-500 mt-1">
                        {product.description}
                      </div>

                    </td>

                    <td className="p-5">

                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                        {product.category}
                      </span>

                    </td>

                    <td className="p-5">

                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                        {product.current_stock}
                      </span>

                    </td>

                    <td className="p-5 font-medium">
                      Rp{" "}
                      {product.base_price.toLocaleString()}
                    </td>

                    <td className="p-5 font-medium">
                      Rp{" "}
                      {product.sale_price.toLocaleString()}
                    </td>

                    <td className="p-5">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            navigate(
                              `/products/edit/${product.product_id}`
                            )
                          }
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(product.product_id)
                          }
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
        {showImportModal && (
        <div className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
        ">
            <div className="
            bg-white
            rounded-3xl
            p-6
            w-full
            max-w-5xl
            shadow-xl
            ">

            <h2 className="text-2xl font-bold mb-4">
                Import Products
            </h2>

            <p className="text-gray-500 mb-6">
                Upload an Excel file containing product data.
            </p>

            <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="mb-6"
            />

            {importProductsData.length > 0 && (
                <>
                <div className="mb-4 font-medium">
                    {importProductsData.length} products ready to import
                </div>

                <div className="
                    max-h-72
                    overflow-auto
                    border
                    rounded-xl
                    mb-6
                ">
                    <table className="w-full">

                    <thead className="bg-slate-50">
                        <tr>
                        {Object.keys(
                            importProductsData[0]
                        ).map((key) => (
                            <th
                            key={key}
                            className="p-3 text-left"
                            >
                            {key}
                            </th>
                        ))}
                        </tr>
                    </thead>

                    <tbody>
                        {importProductsData.map(
                        (row, index) => (
                            <tr
                            key={index}
                            className="border-t"
                            >
                            {Object.values(row).map(
                                (value, i) => (
                                <td
                                    key={i}
                                    className="p-3"
                                >
                                    {String(value)}
                                </td>
                                )
                            )}
                            </tr>
                        )
                        )}
                    </tbody>

                    </table>
                </div>
                </>
            )}

            <div className="flex justify-end gap-3">

                <button
                onClick={() => {
                    setShowImportModal(false);
                    setImportProductsData([]);
                }}
                className="
                border
                px-5
                py-2
                rounded-xl
                "
                >
                Cancel
                </button>

                <button
                onClick={handleImportProducts}
                disabled={
                    importProductsData.length === 0
                }
                className="
                bg-[#2D4FE5]
                text-white
                px-5
                py-2
                rounded-xl
                disabled:opacity-50
                "
                >
                Import
                </button>

            </div>

            </div>
        </div>
        )}

      </div>

    </div>
  );
}