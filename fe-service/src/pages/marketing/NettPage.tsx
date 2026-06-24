import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchNett, NettGroupBy, NettResponse } from "@/lib/dashboard";

type FilterMode = "yearly" | "thisMonth" | "custom";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatAxisLabel(value: number): string {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}K`;
  return `Rp${value}`;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatPeriodLabel(raw: string, groupBy: string): string {
  if (groupBy === "yearly") {
    const [year, month] = raw.split("-");
    return `${MONTHS[parseInt(month) - 1]} '${year.slice(2)}`;
  }
  const month = parseInt(raw.split("-")[1]);
  const day = parseInt(raw.split("-")[2]);
  return `${MONTHS[month - 1]} ${day}`;
}

export default function NettPage() {
  const now = new Date();
  const [filterMode, setFilterMode] = useState<FilterMode>("yearly");
  const [customYear, setCustomYear] = useState(now.getFullYear());
  const [customMonth, setCustomMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<NettResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      let groupBy: NettGroupBy;
      let year: number | undefined;
      let month: number | undefined;

      if (filterMode === "yearly") {
        groupBy = "yearly";
      } else if (filterMode === "thisMonth") {
        groupBy = "daily";
      } else {
        groupBy = "daily";
        year = customYear;
        month = customMonth;
      }

      const result = await fetchNett(groupBy, year, month);
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load net profit data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterMode, customYear, customMonth]);

  const chartData = (data?.data ?? []).map((d: any) => {
    const raw: string = d.month ?? d.date ?? "";
    return {
      period: formatPeriodLabel(raw, data?.groupBy ?? "yearly"),
      revenue: d.total_revenue,
      profit: d.net_profit,
      sold: d.sold,
    };
  });

  const totalRevenue = (data?.data ?? []).reduce(
    (s: number, d: any) => s + d.total_revenue,
    0
  );
  const totalProfit = (data?.data ?? []).reduce(
    (s: number, d: any) => s + d.net_profit,
    0
  );
  const totalSold = (data?.data ?? []).reduce(
    (s: number, d: any) => s + d.sold,
    0
  );

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const xInterval = chartData.length > 15 ? Math.floor(chartData.length / 6) : 0;

  const filterLabel = () => {
    if (filterMode === "yearly") return "Last 12 Completed Months";
    if (filterMode === "thisMonth")
      return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    return `${MONTHS[customMonth - 1]} ${customYear}`;
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Net Profit</h1>
        <p className="text-slate-500 mt-1">
          Compare total revenue vs. net profit (after cost of goods).
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-500">View by:</span>
          {(
            [
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-slate-900">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Net Profit</p>
          <p className="text-xl font-bold text-green-700">{formatRupiah(totalProfit)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Units Sold</p>
          <p className="text-xl font-bold text-slate-900">
            {totalSold.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6">
          Revenue vs. Net Profit — {filterLabel()}
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

        {!loading && !error && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
              />
              <YAxis
                tickFormatter={formatAxisLabel}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                formatter={(value) => formatRupiah(Number(value))}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Total Revenue"
                stroke="#2D4FE5"
                strokeWidth={2.5}
                dot={{ fill: "#2D4FE5", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
