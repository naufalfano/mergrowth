import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchSales, SalesGroupBy, SalesResponse } from "@/lib/dashboard";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
type FilterMode = "allTime" | "yearly" | "thisMonth" | "custom";

export default function SalesPage() {
  const now = new Date();
  const [filterMode, setFilterMode] = useState<FilterMode>("allTime");
  const [customYear, setCustomYear] = useState(now.getFullYear());
  const [customMonth, setCustomMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      let groupBy: SalesGroupBy;
      let year: number | undefined;
      let month: number | undefined;

      if (filterMode === "allTime") {
        groupBy = "allTime";
      } else if (filterMode === "yearly") {
        groupBy = "yearly";
      } else if (filterMode === "thisMonth") {
        groupBy = "daily";
      } else {
        groupBy = "daily";
        year = customYear;
        month = customMonth;
      }

      const result = await fetchSales(groupBy, year, month);
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterMode, customYear, customMonth]);

  const chartData = (data?.data ?? []).slice(0, 10).map((d) => ({
    name:
      d.product_name.length > 22
        ? d.product_name.slice(0, 22) + "…"
        : d.product_name,
    sold: d.sold,
  }));

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const filterLabel = () => {
    if (filterMode === "allTime") return "All Time";
    if (filterMode === "yearly") return "Last 12 Months";
    if (filterMode === "thisMonth")
      return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    return `${MONTHS[customMonth - 1]} ${customYear}`;
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Top Sales</h1>
        <p className="text-slate-500 mt-1">
          Most frequently sold products ranked by transaction count.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Period:</span>
          {(
            [
              { key: "allTime", label: "All Time" },
              { key: "yearly", label: "12 Months" },
              { key: "thisMonth", label: "This Month" },
              { key: "custom", label: "Pick a Month" },
            ] as { key: FilterMode; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterMode === key
                  ? "bg-[#2D4FE5] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}

          {filterMode === "custom" && (
            <div className="flex items-center gap-2">
              <select
                value={customMonth}
                onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={customYear}
                onChange={(e) => setCustomYear(parseInt(e.target.value))}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">
          Top 10 Products — {filterLabel()}
        </h2>

        {loading && (
          <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="h-72 flex items-center justify-center text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div className="h-72 flex items-center justify-center text-slate-300 text-sm">
            No sales data for this period.
          </div>
        )}

        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(chartData.length * 42, 200)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
                width={160}
              />
              <Tooltip
                formatter={(value) => String(value)}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="sold" fill="#2D4FE5" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Full Table */}
      {!loading && !error && (data?.data ?? []).length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              All Products — {filterLabel()}
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">#</th>
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Product</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {data!.data.map((item, idx) => (
                <tr key={item.product_id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-400 tabular-nums">{idx + 1}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums font-semibold text-slate-900">
                    {item.sold.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
