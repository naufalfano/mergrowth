import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Search,
} from "lucide-react";

import { getProducts } from "@/lib/product";

import {
  analyzeExistingProduct,
  recommendNewProductPrice,
} from "@/lib/priceAnalysis";

export default function PriceAnalysisPage() {
  const [tab, setTab] =
    useState<"existing" | "new">(
      "existing"
    );

  const [products, setProducts] =
    useState<any[]>([]);

  const [productId, setProductId] =
    useState<number>();

    const [productName, setProductName] =
    useState("");

    const [basePrice, setBasePrice] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data =
      await getProducts();

    setProducts(data);

    if (data.length > 0) {
      setProductId(
        data[0].product_id
      );
    }
  }

  async function handleGenerate() {
    try {
      setLoading(true);

      if (tab === "existing") {
        const data =
          await analyzeExistingProduct(
            Number(productId)
          );

        setResult(data);
      } else {
        const data =
          await recommendNewProductPrice(
            productName,
            Number(basePrice)
          );

        setResult(data);
      }
    } catch (error) {
      console.error(error);

      alert(
        "Failed to generate analysis"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-8 pt-10">

        {/* HERO */}

        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-10 mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Price Analysis
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Analyze market prices and
            generate pricing recommendations
            using NLP similarity matching.
          </p>

        </div>

        {/* TABS */}

        <div className="flex gap-3 mb-6">

          <button
            onClick={() =>
              setTab("existing")
            }
            className={`px-5 py-3 rounded-xl font-medium ${
              tab === "existing"
                ? "bg-[#2D4FE5] text-white"
                : "bg-white border"
            }`}
          >
            Existing Product
          </button>

          <button
            onClick={() =>
              setTab("new")
            }
            className={`px-5 py-3 rounded-xl font-medium ${
              tab === "new"
                ? "bg-[#2D4FE5] text-white"
                : "bg-white border"
            }`}
          >
            New Product
          </button>

        </div>

        {/* FORM */}

        <div className="bg-white rounded-3xl border shadow-sm p-8">

          {tab === "existing" ? (

            <div>

              <label className="block text-sm font-medium mb-2">
                Product
              </label>

              <select
                value={productId}
                onChange={(e) =>
                  setProductId(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                {products.map(
                  (product) => (
                    <option
                      key={
                        product.product_id
                      }
                      value={
                        product.product_id
                      }
                    >
                      {
                        product.product_name
                      }
                    </option>
                  )
                )}
              </select>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-6">

            <div>

                <label className="block text-sm font-medium mb-2">
                Product Name
                </label>

                <input
                value={productName}
                onChange={(e) =>
                    setProductName(
                    e.target.value
                    )
                }
                placeholder="Beras Merah Organik 1kg"
                className="w-full border rounded-xl px-4 py-3"
                />

            </div>

            <div>

                <label className="block text-sm font-medium mb-2">
                Base Cost
                </label>

                <input
                type="number"
                value={basePrice}
                onChange={(e) =>
                    setBasePrice(
                    e.target.value
                    )
                }
                placeholder="18000"
                className="w-full border rounded-xl px-4 py-3"
                />

            </div>

            </div>

          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-6 py-3 rounded-xl transition"
          >
            {loading
              ? "Analyzing..."
              : "Generate Analysis"}
          </button>

        </div>

        {/* RESULTS */}
        {result && (

        <>

            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5 mt-8">

            {/* Base Cost */}

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

                <p className="text-gray-500 text-sm">
                Base Cost
                </p>

                <h2 className="text-2xl font-bold mt-2">

                Rp{" "}

                {result.base_price?.toLocaleString()}

                </h2>

            </div>

            {/* Current / Recommended */}

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

                <p className="text-gray-500 text-sm">

                {tab === "existing"
                    ? "Current Price"
                    : "Recommended Price"}

                </p>

                <h2 className="text-2xl font-bold mt-2">

                Rp{" "}

                {(tab === "existing"
                    ? result.current_price
                    : result.recommended_price
                )?.toLocaleString()}

                </h2>

            </div>

            {/* Recommended Price */}

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

                <p className="text-gray-500 text-sm">
                Recommended Price
                </p>

                <h2 className="text-2xl font-bold mt-2 text-green-600">

                Rp{" "}

                {result.recommended_price?.toLocaleString()}

                </h2>

            </div>

            {/* Market Average */}

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

                <p className="text-gray-500 text-sm">
                Market Average
                </p>

                <h2 className="text-2xl font-bold mt-2">

                Rp{" "}

                {result.average_market_price?.toLocaleString()}

                </h2>

            </div>

            {/* Expected Margin */}

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

                <p className="text-gray-500 text-sm">
                Expected Margin
                </p>

                <h2 className="text-2xl font-bold mt-2 text-green-600">

                Rp{" "}

                {result.expected_margin?.toLocaleString()}

                </h2>

            </div>

            {/* Margin % */}

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

                <p className="text-gray-500 text-sm">
                Margin %
                </p>

                <h2 className="text-2xl font-bold mt-2">

                {result.margin_percentage}%

                </h2>

            </div>

            </div>

            {/* Recommendation */}

            {result.recommendation && (

            <div className="mt-6 bg-white rounded-3xl border shadow-sm p-6">

                <h3 className="font-semibold mb-3">
                Pricing Recommendation
                </h3>

                <div className="inline-flex px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-medium">

                {result.recommendation}

                </div>

            </div>

            )}

            {/* Market Position */}

            {tab === "existing" &&
            result.price_position && (

            <div className="mt-6 bg-white rounded-3xl border shadow-sm p-6">

                <h3 className="font-semibold mb-3">
                Market Position
                </h3>

                <span
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    result.price_position ===
                    "Below Market"
                    ? "bg-red-100 text-red-700"
                    : result.price_position ===
                        "Above Market"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
                >
                {result.price_position}
                </span>

            </div>

            )}

            {/* Similar Products */}

            <div className="mt-8 bg-white rounded-3xl border shadow-sm overflow-hidden">

            <div className="p-6 border-b">

                <h3 className="font-semibold text-lg">
                Similar Market Products
                </h3>

            </div>

            <table className="w-full">

                <thead className="bg-gray-50">

                <tr>

                    <th className="text-left p-4">
                    Product
                    </th>

                    <th className="text-left p-4">
                    Price
                    </th>

                    <th className="text-left p-4">
                    Similarity
                    </th>

                </tr>

                </thead>

                <tbody>

                {result.similar_products.map(
                    (
                    item: any,
                    index: number
                    ) => (

                    <tr
                        key={index}
                        className="border-t"
                    >

                        <td className="p-4">
                        {item.product_name}
                        </td>

                        <td className="p-4">
                        Rp{" "}
                        {item.price.toLocaleString()}
                        </td>

                        <td className="p-4">

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.similarity >= 0.5
                                ? "bg-green-100 text-green-700"
                                : item.similarity >= 0.3
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                            {(item.similarity * 100).toFixed(1)}%
                        </span>

                        </td>

                    </tr>

                    )
                )}

                </tbody>

            </table>

            </div>

        </>

        )}

      </div>

    </div>
  );
}