import { useEffect, useState } from "react";
import { RefreshCw, Star, Package2, Eye, AlertTriangle } from "lucide-react";
import {
  fetchProductInsight,
  ProductInsightResponse,
  ProductInsightItem,
  ProductCategory,
} from "@/lib/marketing";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
  return `Rp ${value}`;
}

const CATEGORY_META: Record<
  ProductCategory,
  { label: string; badge: string; border: string; icon: JSX.Element }
> = {
  CORE_PRODUCT: {
    label: "Core Product",
    badge: "bg-green-100 text-green-700",
    border: "border-green-200",
    icon: <Star size={15} className="text-green-600" />,
  },
  BUNDLE_OPPORTUNITY: {
    label: "Bundle Opportunity",
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    icon: <Package2 size={15} className="text-blue-600" />,
  },
  MONITOR_PRODUCT: {
    label: "Monitor",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    icon: <Eye size={15} className="text-amber-600" />,
  },
  REMOVAL_CANDIDATE: {
    label: "Removal Candidate",
    badge: "bg-red-100 text-red-600",
    border: "border-red-200",
    icon: <AlertTriangle size={15} className="text-red-500" />,
  },
};

type ActiveFilter = "all" | ProductCategory;

const FILTER_TO_KEY: Record<ProductCategory, keyof ProductInsightResponse> = {
  CORE_PRODUCT: "core_products",
  BUNDLE_OPPORTUNITY: "bundle_opportunities",
  MONITOR_PRODUCT: "monitor_products",
  REMOVAL_CANDIDATE: "removal_candidates",
};

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(score * 100, 100);
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-6">
        {pct.toFixed(0)}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductInsightPage() {
  const [data, setData] = useState<ProductInsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilter>("all");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchProductInsight());
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load product insights.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const displayedProducts: ProductInsightItem[] = (() => {
    if (!data) return [];
    if (filter === "all") return data.products;
    return data[FILTER_TO_KEY[filter]] as ProductInsightItem[];
  })();

  const summaryCards: {
    key: ProductCategory;
    label: string;
    count: number;
    cardBg: string;
    numColor: string;
  }[] = data
    ? [
        {
          key: "CORE_PRODUCT",
          label: "Core Products",
          count: data.summary.core_products,
          cardBg: "bg-green-50 border-green-100",
          numColor: "text-green-700",
        },
        {
          key: "BUNDLE_OPPORTUNITY",
          label: "Bundle Opportunities",
          count: data.summary.bundle_opportunities,
          cardBg: "bg-blue-50 border-blue-100",
          numColor: "text-blue-700",
        },
        {
          key: "MONITOR_PRODUCT",
          label: "Monitor",
          count: data.summary.monitor_products,
          cardBg: "bg-amber-50 border-amber-100",
          numColor: "text-amber-700",
        },
        {
          key: "REMOVAL_CANDIDATE",
          label: "Removal Candidates",
          count: data.summary.removal_candidates,
          cardBg: "bg-red-50 border-red-100",
          numColor: "text-red-600",
        },
      ]
    : [];

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Insight</h1>
          <p className="text-slate-500 mt-1">
            ML-powered segmentation of your catalogue into actionable product
            categories.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl text-sm text-slate-500 transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {!loading && !error && data && (
        <div className="grid grid-cols-4 gap-4 mb-7">
          {summaryCards.map(({ key, label, count, cardBg, numColor }) => {
            const meta = CATEGORY_META[key];
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(isActive ? "all" : key)}
                className={`border rounded-3xl p-5 text-left transition hover:shadow-md ${cardBg} ${
                  isActive ? `ring-2 ring-offset-1 ${meta.border}` : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {meta.icon}
                  <span className="text-xs font-medium text-slate-500">
                    {label}
                  </span>
                </div>
                <p className={`text-3xl font-bold ${numColor}`}>{count}</p>
                <p className="text-xs text-slate-400 mt-1">products</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && !error && data && (
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === "all"
                ? "bg-[#2D4FE5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({data.products.length})
          </button>
          {summaryCards.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "all" : key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === key
                  ? "bg-[#2D4FE5] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label.split(" ")[0]} ({count})
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          Analysing products…
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && displayedProducts.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 text-sm shadow-sm">
          No products in this category.
        </div>
      )}

      {/* Product table */}
      {!loading && !error && displayedProducts.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-400 font-medium w-72">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">
                  Sold
                </th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">
                  Revenue
                </th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">
                  Net Profit
                </th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">
                  Margin
                </th>
                <th className="px-6 py-3 text-slate-400 font-medium">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((item) => {
                const meta = CATEGORY_META[item.category];
                return (
                  <tr
                    key={item.product_id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition align-top"
                  >
                    {/* Product name + recommendation */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs">
                        {item.recommendation}
                      </p>
                      {item.category === "BUNDLE_OPPORTUNITY" &&
                        item.associated_products.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.associated_products
                              .slice(0, 3)
                              .map((p) => (
                                <span
                                  key={p}
                                  className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-lg"
                                >
                                  {p}
                                </span>
                              ))}
                          </div>
                        )}
                    </td>

                    {/* Category badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${meta.badge}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>

                    {/* Sold */}
                    <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                      {item.sold_qty.toLocaleString("id-ID")}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatRupiah(item.revenue)}
                    </td>

                    {/* Net Profit */}
                    <td className="px-4 py-4 text-right tabular-nums font-medium text-green-700">
                      {formatRupiah(item.net_profit)}
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                      {item.margin.toFixed(1)}%
                    </td>

                    {/* Business Score */}
                    <td className="px-6 py-4">
                      <ScoreBar score={item.business_score} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}