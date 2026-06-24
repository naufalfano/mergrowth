import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { fetchRevenueForecast, ForecastResponse } from "@/lib/marketing";

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function ForecastPage() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadForecast() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRevenueForecast();
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load forecast.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForecast();
  }, []);

  const isUp = data?.trend === "up";

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Forecast</h1>
          <p className="text-slate-500 mt-1">
            Next-week revenue predicted by a Random Forest model trained on
            historical weekly data.
          </p>
        </div>
        <button
          onClick={loadForecast}
          disabled={loading}
          className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl text-sm text-slate-600 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Loading forecast…
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Growth badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                isUp
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {isUp ? "+" : ""}
              {data.growth_percent.toFixed(2)}% projected growth
            </span>
          </div>

          {/* Revenue cards */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-3">
                Current Week Revenue
              </p>
              <p className="text-4xl font-bold text-slate-900">
                {formatRupiah(data.current_week.revenue)}
              </p>
              <p className="text-xs text-slate-400 mt-3">Last completed week</p>
            </div>

            <div
              className={`border rounded-3xl p-7 shadow-sm ${
                isUp
                  ? "bg-green-50 border-green-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <p
                className={`text-sm font-medium mb-3 ${
                  isUp ? "text-green-700" : "text-red-600"
                }`}
              >
                Next Week Forecast
              </p>
              <p
                className={`text-4xl font-bold ${
                  isUp ? "text-green-800" : "text-red-700"
                }`}
              >
                {formatRupiah(data.next_week.revenue)}
              </p>
              <p
                className={`text-xs mt-3 ${
                  isUp ? "text-green-500" : "text-red-400"
                }`}
              >
                {isUp ? "Predicted increase" : "Predicted decrease"}
              </p>
            </div>
          </div>

          <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-400">
            This forecast uses lag features (last 4 weeks) and calendar signals
            (week number, month) via a Random Forest Regressor. Forecasts are
            indicative, not guaranteed.
          </div>
        </>
      )}
    </div>
  );
}
