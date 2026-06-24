import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Package, ArrowLeft } from "lucide-react";
import ProductSelect from "@/components/ProductSelect";

import { getAllProducts } from "@/lib/product";
import {
  generateDemandForecast,
} from "@/lib/demandForecasting";

export default function DemandForecastPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState<number>();

  const [horizonDays, setHorizonDays] =
    useState<number>(7);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const items = await getAllProducts();

      setProducts(items);

      if (items.length > 0) {
        setProductId(items[0].product_id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerateForecast() {
    if (!productId) return;

    try {
      setLoading(true);

      const data =
        await generateDemandForecast(
          productId,
          horizonDays
        );

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate forecast");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-8 pt-10">

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition"
        >
          <ArrowLeft size={15} /> Products
        </button>

        {/* Hero */}

        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-10 mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Demand Forecasting
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Predict future product demand using
            machine learning.
          </p>

        </div>

        {/* Form */}

        <div className="bg-white rounded-3xl border shadow-sm p-8">

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm font-medium mb-2">
                Product
              </label>

              <ProductSelect
                products={products}
                value={productId}
                onChange={setProductId}
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Forecast Horizon
              </label>

              <select
                value={horizonDays}
                onChange={(e) =>
                  setHorizonDays(
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value={7}>
                  7 Days
                </option>

                <option value={30}>
                  30 Days
                </option>
              </select>

            </div>

          </div>

          <button
            onClick={handleGenerateForecast}
            disabled={loading}
            className="mt-6 bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-6 py-3 rounded-xl transition"
          >
            {loading
              ? "Generating..."
              : "Generate Forecast"}
          </button>

        </div>

        {/* Results */}

        {result && (

          <div className="grid md:grid-cols-3 gap-5 mt-8">

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Forecast Demand
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {result.forecast_quantity}
                  </h2>

                </div>

                <TrendingUp
                  size={32}
                  className="text-blue-600"
                />

              </div>

            </div>

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Current Stock
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {result.current_stock}
                  </h2>

                </div>

                <Package
                  size={32}
                  className="text-green-600"
                />

              </div>

            </div>

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Remaining Stock
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {result.remaining_stock}
                  </h2>

                </div>

                <Package
                  size={32}
                  className={
                    result.remaining_stock >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                />

              </div>

            </div>

          </div>

        )}

        {/* Recommendation */}

        {result && (

          <div className="mt-6 bg-white rounded-3xl border shadow-sm p-8">

            <h3 className="font-semibold text-lg mb-3">
              Recommendation
            </h3>

            <div
              className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium ${
                result.remaining_stock >= 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result.recommendation}
            </div>

          </div>

        )}

      </div>

    </div>
  );
}