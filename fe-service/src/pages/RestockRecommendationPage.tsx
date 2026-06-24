import { useState } from "react";
import {
  Wallet,
  Package,
  TrendingUp,
} from "lucide-react";

import {
  generateRestockRecommendation,
} from "@/lib/restockRecommendation";

export default function RestockRecommendationPage() {

  const [budget, setBudget] =
    useState("");

  const [horizonDays, setHorizonDays] =
    useState(30);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  async function handleGenerate() {

    try {

      setLoading(true);

      const response =
        await generateRestockRecommendation(
          Number(budget),
          horizonDays
        );

      setResult(response);

    } catch (error) {

      console.error(error);

      alert(
        "Failed to generate recommendation"
      );

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-8 pt-10">

        {/* Hero */}

        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-10 mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Restock Recommendation
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Optimize inventory purchases using
            demand forecasting and budget constraints.
          </p>

        </div>

        {/* Form */}

        <div className="bg-white rounded-3xl border shadow-sm p-8">

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm font-medium mb-2">
                Budget
              </label>

              <input
                type="number"
                value={budget}
                onChange={(e) =>
                  setBudget(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
                placeholder="5000000"
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Planning Horizon
              </label>

              <select
                value={horizonDays}
                onChange={(e) =>
                  setHorizonDays(
                    Number(
                      e.target.value
                    )
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
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-6 py-3 rounded-xl transition"
          >
            {loading
              ? "Generating..."
              : "Generate Recommendation"}
          </button>

        </div>

        {/* KPI Cards */}

        {result && (

          <div className="grid md:grid-cols-4 gap-5 mt-8">

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Budget
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Rp {result.budget.toLocaleString()}
                  </h2>

                </div>

                <Wallet
                  size={32}
                  className="text-blue-600"
                />

              </div>

            </div>

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Used Budget
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Rp {result.used_budget.toLocaleString()}
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
                    Remaining Budget
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Rp {result.remaining_budget.toLocaleString()}
                  </h2>

                </div>

                <Wallet
                  size={32}
                  className="text-orange-500"
                />

              </div>

            </div>

            <div className="bg-white rounded-3xl p-6 border shadow-sm">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Expected Profit
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Rp {result.expected_profit.toLocaleString()}
                  </h2>

                </div>

                <TrendingUp
                  size={32}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

        )}

        {/* Optimization Summary */}

        {result && (

          <div className="mt-6 bg-white rounded-3xl border shadow-sm p-8">

            <h3 className="font-semibold text-lg mb-3">
              Optimization Summary
            </h3>

            <div className="inline-flex px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-700">

              Selected{" "}
              {result.recommendations.length}
              {" "}products within the available budget
              and generated an expected profit of{" "}
              Rp{" "}
              {result.expected_profit.toLocaleString()}.

            </div>

          </div>

        )}

        {/* Recommendation Table */}

        {result && (

          <div className="mt-8 bg-white rounded-3xl border shadow-sm overflow-hidden">

            <div className="p-6 border-b">

              <h3 className="text-xl font-semibold">
                Recommended Products
              </h3>

              <p className="text-gray-500 mt-1">
                Products selected by the
                optimization model.
              </p>

            </div>

            <table className="w-full">

              <thead>

                <tr className="bg-gray-50 border-b">

                  <th className="text-left px-6 py-4">
                    Product
                  </th>

                  <th className="text-left px-6 py-4">
                    Quantity
                  </th>

                  <th className="text-left px-6 py-4">
                    Cost
                  </th>

                  <th className="text-left px-6 py-4">
                    Expected Profit
                  </th>

                </tr>

              </thead>

              <tbody>

                {result.recommendations.map(
                  (item: any) => (

                    <tr
                      key={item.product_id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-medium">
                        {item.product_name}
                      </td>

                      <td className="px-6 py-4">

                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">

                          {item.recommended_qty}

                        </span>

                      </td>

                      <td className="px-6 py-4">

                        Rp{" "}
                        {item.total_cost.toLocaleString()}

                      </td>

                      <td className="px-6 py-4 font-semibold text-green-600">

                        Rp{" "}
                        {item.expected_profit.toLocaleString()}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );
}
