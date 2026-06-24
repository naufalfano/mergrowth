import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, RefreshCw, ArrowRight } from "lucide-react";
import { fetchRevenue, RevenueResponse } from "@/lib/dashboard";
import { fetchRevenueForecast, ForecastResponse } from "@/lib/marketing";

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

function formatPeriodLabel(period: string, groupBy: string): string {
  if (groupBy === "yearly") {
    const [year, month] = period.split("-");
    return `${MONTHS[parseInt(month) - 1]} '${year.slice(2)}`;
  }
  const month = parseInt(period.split("-")[1]);
  const day = parseInt(period.split("-")[2]);
  return `${MONTHS[month - 1]} ${day}`;
}

export default function MarketingDashboardPage() {
  const now = new Date();

  // — Forecast state —
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // — Revenue chart state —
  const [filterMode, setFilterMode] = useState<FilterMode>("yearly");
  const [customYear, setCustomYear] = useState(now.getFullYear());
  const [customMonth, setCustomMonth] = useState(now.getMonth() + 1);
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  async function loadForecast() {
    setForecastLoading(true);
    setForecastError(null);
    try {
      setForecast(await fetchRevenueForecast());
    } catch (e: any) {
      setForecastError(e?.response?.data?.detail ?? "Failed to load forecast.");
    } finally {
      setForecastLoading(false);
    }
  }

  async function loadRevenue() {
    setRevenueLoading(true);
    setRevenueError(null);
    try {
      let result: RevenueResponse;
      if (filterMode === "yearly") {
        result = await fetchRevenue("yearly");
      } else if (filterMode === "thisMonth") {
        result = await fetchRevenue("daily");
      } else {
        result = await fetchRevenue("daily", customYear, customMonth);
      }
      setRevenueData(result);
    } catch (e: any) {
      setRevenueError(e?.response?.data?.detail ?? "Failed to load revenue data.");
    } finally {
      setRevenueLoading(false);
    }
  }

  useEffect(() => {
    loadForecast();
  }, []);

  useEffect(() => {
    loadRevenue();
  }, [filterMode, customYear, customMonth]);

  const chartData = revenueData?.data.map((d) => ({
    period: formatPeriodLabel(d.period, revenueData.groupBy),
    revenue: d.revenue,
  })) ?? [];

  const totalRevenue = revenueData?.data.reduce((s, d) => s + d.revenue, 0) ?? 0;
  const peakRevenue = revenueData?.data.length
    ? Math.max(...revenueData.data.map((d) => d.revenue))
    : 0;

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const xInterval = chartData.length > 15 ? Math.floor(chartData.length / 6) : 0;

  const filterLabel = () => {
    if (filterMode === "yearly") return "Last 12 Completed Months";
    if (filterMode === "thisMonth") return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    return `${MONTHS[customMonth - 1]} ${customYear}`;
  };

  const isUp = forecast?.trend === "up";

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Revenue Overview</h1>
        <p className="text-slate-500 mt-1">
          Historical revenue data and next-week AI-powered forecast.
        </p>
      </div>

      {/* ── Forecast strip ── */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-100 rounded-3xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Next-Week Revenue Forecast
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Random Forest · lag-4 weekly features
            </p>
          </div>
          <button
            onClick={loadForecast}
            disabled={forecastLoading}
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:border-slate-300 px-3 py-1.5 rounded-xl text-xs text-slate-500 transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={forecastLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {forecastLoading && (
          <p className="text-sm text-slate-400">Loading forecast…</p>
        )}

        {!forecastLoading && forecastError && (
          <p className="text-sm text-red-400">{forecastError}</p>
        )}

        {!forecastLoading && !forecastError && forecast && (
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-slate-400 mb-1">Current Week</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatRupiah(forecast.current_week.revenue)}
              </p>
            </div>

            <ArrowRight size={18} className="text-slate-300 shrink-0" />

            <div>
              <p className="text-xs text-slate-400 mb-1">Forecast Next Week</p>
              <p className={`text-2xl font-bold ${isUp ? "text-green-700" : "text-red-600"}`}>
                {formatRupiah(forecast.next_week.revenue)}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}
            >
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? "+" : ""}
              {forecast.growth_percent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* ── Revenue history ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-5 shadow-sm">
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

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Total Revenue — {filterLabel()}</p>
          <p className="text-2xl font-bold text-slate-900">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Peak Revenue</p>
          <p className="text-2xl font-bold text-slate-900">{formatRupiah(peakRevenue)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6">
          Revenue — {filterLabel()}
        </h2>

        {revenueLoading && (
          <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
            Loading…
          </div>
        )}

        {!revenueLoading && revenueError && (
          <div className="h-72 flex items-center justify-center text-red-400 text-sm">
            {revenueError}
          </div>
        )}

        {!revenueLoading && !revenueError && (
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
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2D4FE5"
                strokeWidth={2.5}
                dot={{ fill: "#2D4FE5", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}